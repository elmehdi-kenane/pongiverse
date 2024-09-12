from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser  ###########
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message, Directs, RoomInvitation
from django.core.files.storage import default_storage
import json, os
from django.db.models import F


async def add_user_channel_group(self, data):
    user = await get_user_by_name(self, data["user"])
    memberships = await sync_to_async(list)(Membership.objects.filter(user=user))
    for membership in memberships:
        room_name = await sync_to_async(lambda: membership.room.name)()
        #print("the roorm name after remove the whitespaces:", re.sub(r"\s+", "_", room_name))
        await self.channel_layer.group_add(
            re.sub(r"\s+", "_", room_name), self.channel_name
        )


async def create_chat_room(self, data):
    user_name = data["user"]
    room_name = data["message"]["name"]
    image_data = base64.b64decode(data["message"]["icon"])
    try:
        user = await get_user_by_name(self, user_name)
    except customuser.DoesNotExist:
        return
    #print("user is found")
    room = await sync_to_async(Room.objects.filter(name=room_name).first)()
    if not room:
        #print("room not found")
        image_type = imghdr.what(None, h=image_data)
        if image_type is None:
            #print("Unsupported image type")
            return
        image_file = ContentFile(image_data, name=f"{room_name}.{image_type}")
        room = await sync_to_async(Room.objects.create)(
            name=room_name, topic=data["message"]["topic"], icon=image_file
        )
        room.members_count += 1
        room.visiblity = (
            "private"
            if data["message"]["roomVisibility"] == "private-room"
            else (
                "protected"
                if data["message"]["roomVisibility"] == "protected-room"
                else "public"
            )
        )
        if room.visiblity == "protected":
            room.password = make_password(data["message"]["password"])
    elif room:
        #print("roomAlreadyExists")
        self.send(json.dumps({"type": "roomAlreadyExists"}))
        return
    for membership in memberships:
        room_id = await sync_to_async(lambda: membership.room.id)()
        await self.channel_layer.group_add(f"chat_room_{room_id}", self.channel_name)


async def add_chat_room_admin(self, data, user_channels):
    room = await sync_to_async(Room.objects.get)(name=data["message"]["room"])
    user = await sync_to_async(customuser.objects.get)(
        username=data["message"]["memberName"]
    )
    member = await sync_to_async(Membership.objects.get)(room=room, user=user)
    member.role = "admin"
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
    room_name = data["data"]["name"]
    user_name = data["data"]["sender"]
    message = data["data"]["message"]
    room = await sync_to_async(Room.objects.filter(name=room_name).get)()
    sender = await get_user_by_name(self, user_name)
    newMessage = await sync_to_async(Message.objects.create)(
        sender=sender, room=room, content=message
    )

    await sync_to_async(Membership.objects.exclude(user=sender).update)(unreadCount= F('unreadCount') + 1)
    event = {
        "type": "send_message",
        "message": newMessage,
    }
    # await self.channel_layer.group_add(f"chat_room_{room.id}", self.channel_name)
    await self.channel_layer.group_send(f"chat_room_{room.id}", event)


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
    #print(channel_name)
    mychannel_name = user_channels.get(data["data"]["sender"])
    #print(mychannel_name)
    if channel_name:
        #print("the others message", channel_name)
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
        for channel in mychannel_name:
            await self.channel_layer.send(
                channel,
                {
                    "type": "send_direct",
                    "data": {
                        'senderAvatar' : f"{protocol}://{ip_address}:8000/chatAPI{sender.avatar.url}",
                        "sender": sender.username,
                        "reciver": sender.username,
                        "message": message.message,
                        'senderId' : sender.id,
                        'receiverId' : reciver.id,
                        'date' : message.timestamp,
                    },
                },
        )
