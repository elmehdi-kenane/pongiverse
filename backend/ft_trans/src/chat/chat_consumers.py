from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser  ###########
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message, Directs, RoomInvitation
from django.core.files.storage import default_storage
import imghdr, re, base64, json
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password, check_password


async def add_user_channel_group(self, data):
    user = await get_user_by_name(self, data["user"])
    memberships = await sync_to_async(list)(Membership.objects.filter(user=user))
    for membership in memberships:
        room_id = await sync_to_async(lambda: membership.room.id)()
        await self.channel_layer.group_add(
            re.sub(f"chat_room{room_id}"), self.channel_name
        )

async def leave_chat_room(self, data, user_channels):
    # get the user by username
    user = await get_user_by_name(self, data["message"]["user"])
    # get the room by name
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    room_name = room.name
    # get the room memeber query by username
    member_to_kick = await sync_to_async(Membership.objects.get)(user=user, room=room)
    member_roles = member_to_kick.roles
    # cick the member from the room membership
    await sync_to_async(member_to_kick.delete)()
    # delete the query (remove the member from the chat room)
    if member_roles == "admin":
        print("the user is an admin")
        all_members = await sync_to_async(list)(
            Membership.objects.filter(room=room).order_by("joined_at")
        )
        admin_found = 0
        for member in all_members:
            if member.roles == "admin" and member_to_kick != member:
                admin_found += 1
        if all_members and not admin_found:
            all_members[0].roles = "admin"
            new_admin = await sync_to_async(customuser.objects.get)(
                id=all_members[0].user_id
            )
            await self.channel_layer.send(
                user_channels.get(new_admin.username),
                {
                    "type": "broadcast_message",
                    "data": {
                        "type": "chatRoomAdminAdded",
                        "message": {"name": room.name},
                    },
                },
            )
            await sync_to_async(all_members[0].save)()
    # decrease room count members
    room.members_count -= 1
    # remove the room if there are no members
    room_members_count = room.members_count
    if room.members_count == 0:
        if room.icon.path and default_storage.exists(room.icon.path):
            await sync_to_async(default_storage.delete)(room.icon.path)
        await sync_to_async(room.delete)()
    else:
        await sync_to_async(room.save)()
    await self.channel_layer.group_send(
        re.sub(r"\s+", "_", room_name),
        {
            "type": "broadcast_message",
            "data": {
                "type": "memberleaveChatRoom",
                "message": {
                    "name": room_name,
                    "membersCount": room_members_count,
                    "user": user.username,
                },
            },
        },
    )
    await self.channel_layer.group_discard(
        re.sub(r"\s+", "_", room_name), user_channels.get(user.username)
    )


async def change_chat_room_name(self, data, user_channels):
    if await sync_to_async(Room.objects.filter(name=data["message"]["newName"]).exists)():
        await self.send(json.dumps({"type": "newNameAlreadyExists"}))
        return
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    room.name = data["message"]["newName"]
    await sync_to_async(room.save)()
    members = await sync_to_async(list)(Membership.objects.filter(room=room))
    old_name = str(re.sub(r"\s+", "_", data["message"]["room"]))
    new_name = str(re.sub(r"\s+", "_", room.name))
    for member in members:
        user = await sync_to_async(customuser.objects.get)(id=member.user_id)
        user_channel = user_channels.get(user.username)
        if user_channel:
            await self.channel_layer.group_discard(old_name, user_channel)
            await self.channel_layer.group_add(new_name, user_channel)
    await self.channel_layer.group_send(
        new_name,
        {
            "type": "broadcast_message",
            "data": {
                "type": "chatRoomNameChanged",
                "message": {"name": data["message"]["room"], "newName": room.name},
            },
        },
    )


async def change_chat_room_avatar(self, data):
    image_data = base64.b64decode(data["message"]["newIcon"])
    room_name = data["message"]["room"]
    room = await sync_to_async(Room.objects.get)(name=room_name)
    if room:
        image_type = imghdr.what(None, h=image_data)
        if image_type is None:
            print("Unsupported image type")
            return
        image_file = ContentFile(image_data, name=f"{room_name}.{image_type}")
        old_icon_path = room.icon.path
        if old_icon_path and default_storage.exists(old_icon_path):
            await sync_to_async(default_storage.delete)(old_icon_path)
        await sync_to_async(room.icon.save)(image_file.name, image_file)
        await sync_to_async(room.save)()
    elif not room:
        await self.send(json.dump({"type": "roomNotFound"}))
        return
    await self.channel_layer.group_send(
        str(re.sub(r"\s+", "_", room.name)),
        {
            "type": "broadcast_message",
            "data": {
                "type": "chatRoomAvatarChanged",
                "message": {"name": room.name, "iconPath": room.icon.path},
            },
        },
    )


async def detete_char_room(self, data, user_channels):
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    if room :
        room_name = room.name
        all_members = await sync_to_async(list)(Membership.objects.filter(room=room))
        for member in all_members:
            await sync_to_async(member.delete)()
            user = await sync_to_async(customuser.objects.get)(id=member.user_id)
            user_channel = user_channels.get(user.username)
            if user_channel :
                await self.channel_layer.send(
                    user_channel,
                    {
                        "type": "broadcast_message",
                        "data": {"type": "chatRoomDeleted", "message": {"name": room_name}},
                    },
                )
                await self.channel_layer.group_discard(
                    re.sub(r"\s+", "_", room_name), user_channel
                )
        if room.icon.path and default_storage.exists(room.icon.path):
            await sync_to_async(default_storage.delete)(room.icon.path)
        await sync_to_async(room.delete)()


async def add_chat_room_admin(self, data, user_channels):
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    user = await sync_to_async(customuser.objects.get)(
        username=data["message"]["memberName"]
    )
    member = await sync_to_async(Membership.objects.get)(room=room, user=user)
    member.roles = "admin"
    await sync_to_async(member.save)()
    await self.channel_layer.send(
        user_channels.get(user.username),
        {
            "type": "broadcast_message",
            "data": {"type": "chatRoomAdminAdded", "message": {"name": room.name}},
        },
    )


async def invite_member_chat_room(self, data, user_channels):
    user = await sync_to_async(customuser.objects.get)(
        username=data["message"]["member"]
    )
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    if (
        room
        and not await sync_to_async(
            RoomInvitation.objects.filter(user=user, room=room).exists
        )()
    ):
        await sync_to_async(RoomInvitation.objects.create)(user=user, room=room)
        user_channel = user_channels.get(user.username)
        if user_channel:
            await self.channel_layer.send(
                user_channel,
                {
                    "type": "broadcast_message",
                    "data": {
                        "type": "roomInvitation",
                        "room": {
                            "name": room.name,
                            "icon_url": room.icon.path,
                            "membersCount": room.members_count,
                        },
                    },
                },
            )


async def chat_room_accept_invitation(self, data):
    user = await sync_to_async(customuser.objects.get)(username=data["message"]["user"])
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    invitation = await sync_to_async(RoomInvitation.objects.get)(user=user, room=room)
    if room:
        await sync_to_async(invitation.delete)()
        await sync_to_async(Membership.objects.create)(user=user, room=room)
        room.members_count += 1
        await sync_to_async(room.save)()
        await self.channel_layer.group_add(
            str(re.sub(r"\s+", "_", room.name)), self.channel_name
        )
        await self.channel_layer.group_send(
            re.sub(r"\s+", "_", room.name),
            {
                "type": "broadcast_message",
                "data": {
                    "type": "roomInvitationAccepted",
                    "data": {
                        "user": user.username,
                        "room": {
                            "id": room.id,
                            "role": "member",
                            "name": room.name,
                            "topic": room.topic,
                            "icon_url": room.icon.path,
                            "membersCount": room.members_count,
                        },
                    },
                },
            },
        )
    elif not room:
        await self.channel_layer.send(
            json.dumps(
                {
                    "type": "removeRoomInvitation",
                    "room": {"name": data["message"]["room"]},
                }
            )
        )


async def chat_room_invitation_declined(self, data):
    user = await sync_to_async(customuser.objects.get)(username=data["message"]["user"])
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    invitation = await sync_to_async(RoomInvitation.objects.get)(user=user, room=room)
    await sync_to_async(invitation.delete)()
    await self.channel_layer.send(
        json.dumps(
            {
                "type": "roomInviteCancelled",
                "room": {
                    "name": room.name,
                },
            },
        )
    )


async def message(self, data):
    print(data)
    room_name = data["data"]["name"]
    user_name = data["data"]["sender"]
    message = data["data"]["message"]
    room = await sync_to_async(Room.objects.filter(name=room_name).get)()
    sender = await get_user_by_name(self, user_name)
    newMessage = await sync_to_async(Message.objects.create)(
        sender=sender, room=room, content=message
    )
    event = {
        "type": "send_message",
        "message": newMessage,
    }
    await self.channel_layer.group_add(
        f'chat_room_{room.id}', self.channel_name
    )
    await self.channel_layer.group_send(f'chat_room_{room.id}', event)


async def get_user_by_name(self, user_name):
    return await sync_to_async(customuser.objects.get)(username=user_name)


async def direct_message(self, data, user_channels):
    sender = await sync_to_async(customuser.objects.get)(
        username=data["data"]["sender"]
    )
    reciver = await sync_to_async(customuser.objects.get)(
        username=data["data"]["reciver"]
    )
    await sync_to_async(Directs.objects.create)(
        sender=sender, reciver=reciver, message=data["data"]["message"]
    )
    channel_name = user_channels.get(data["data"]["reciver"])
    print(channel_name)
    mychannel_name = user_channels.get(data["data"]["sender"])
    print(mychannel_name)
    if channel_name:
        print("the others message", channel_name)
        await self.channel_layer.send(
            channel_name,
            {
                "type": "send_direct",
                "data": {
                    "sender": data["data"]["sender"],
                    "reciver": data["data"]["reciver"],
                    "message": data["data"]["message"],
                },
            },
        )
    if mychannel_name:
        print("my message", mychannel_name)
        await self.channel_layer.send(
            mychannel_name,
            {
                "type": "send_direct",
                "data": {
                    "sender": data["data"]["sender"],
                    "reciver": data["data"]["sender"],
                    "message": data["data"]["message"],
                },
            },
        )
