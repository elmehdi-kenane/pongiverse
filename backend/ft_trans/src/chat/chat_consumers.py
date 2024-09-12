from myapp.models import customuser  ###########
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message, Directs, RoomInvitation
from django.core.files.storage import default_storage
import json, os
from django.db.models import F

async def add_user_channel_group(self, data):
    try:
        user = await sync_to_async(customuser.objects.get)(username=data["user"])
    except customuser.DoesNotExist:
        return
    try:
        memberships = await sync_to_async(list)(Membership.objects.filter(user=user))
    except Membership.DoesNotExist:
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
    room = await sync_to_async(Room.objects.filter(name=data["data"]["name"]).get)()
    sender = await sync_to_async(customuser.objects.get)(
        username=data["data"]["sender"]
    )
    newMessage = await sync_to_async(Message.objects.create)(
        sender=sender, room=room, content=data["data"]["message"]
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
    message = await sync_to_async(Directs.objects.create)(
        sender=sender, reciver=reciver, message=data["data"]["message"]
    )
    ip_address = os.getenv("IP_ADDRESS")
    protocol = os.getenv('PROTOCOL')
    channel_name = user_channels.get(reciver.id)
    mychannel_name = user_channels.get(sender.id)
    if channel_name:
        for channel in channel_name:
            await self.channel_layer.send(
                channel,
                {
                    "type": "send_direct",
                    "data": {
                        'senderAvatar' : f"{protocol}://{ip_address}:8000/chatAPI{sender.avatar.url}",
                        "sender": sender.username,
                        "reciver": reciver.username,
                        "message": message.message,
                        'senderId' : sender.id,
                        'receiverId' : reciver.id,
                        'date' : message.timestamp,
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
