from myapp.models import customuser
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message, Directs, RoomInvitation
from django.core.files.storage import default_storage
import json
import os
from django.db.models import F
from Notifications.common import notifs_user_channels


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
        )() and not await sync_to_async(Membership.objects.filter(user=user, room=room).exists)()
    ):
        invitaion = await sync_to_async(RoomInvitation.objects.create)(user=user, room=room)
        user_channels = user_channels.get(user.id)
        # if user_channel:
        for user_channel in user_channels:
            await self.channel_layer.send(
                user_channel,
                {
                    "type": "broadcast_message",
                    "data": {
                        "type": "roomInvitation",
                        "room": {
                            'id': room.id,
                            "name": room.name,
                            'topic': room.topic,
                            "icon": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/chatAPI{room.icon.url}",
                            'status': invitaion.status,
                            "membersCount": room.members_count,
                        },
                    },
                },
            )
        user_notification_channels = notifs_user_channels.get(user.id)
        for user_channel in user_notification_channels:
            await self.channel_layer.send(
                user_channel,
                {
                    "type": "roomInvite",
                    'message': {
                        'room_id': room.id,
                    }
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

    await sync_to_async(Membership.objects.filter(room=room).exclude(user=sender).update)(unreadCount=F('unreadCount') + 1)

    formatted_date = newMessage.timestamp.strftime('%Y/%m/%d AT %I:%M %p')

    event = {
        "type": "send_message",
        "data": {
            'id': newMessage.id,
            'roomId': room.id,
            'content': newMessage.content,
            'sender': sender.username,
            # 'date': newMessage.timestamp.isoformat(),
            'date': formatted_date,
        }
    }
    await self.channel_layer.group_send(f"chat_room_{room.id}", event)

    members = await sync_to_async(lambda: list(Membership.objects.filter(room=room).exclude(user=sender)))()
    for member in members:
        user_channels = notifs_user_channels.get(member.user_id)

        if user_channels is not None:
            room_unread_count = await sync_to_async(lambda: Room.objects.filter(
                membership__user=member.user, membership__unreadCount__gt=0).count())()
            direct_unread_count = await sync_to_async(lambda: Directs.objects.filter(
                receiver=member.user, is_read=False).values('sender').distinct().count())()
            count = room_unread_count + direct_unread_count
            for user_channel in user_channels:
                await self.channel_layer.send(
                    user_channel,
                    {
                        "type": "chatNotificationCounter",
                        'message': count,
                    },
                )

async def direct_message(self, data, user_channels):
    sender = await sync_to_async(customuser.objects.get)(
        username=data["data"]["sender"]
    )
    receiver = await sync_to_async(customuser.objects.get)(
        username=data["data"]["receiver"]
    )
    message = await sync_to_async(Directs.objects.create)(
        sender=sender, receiver=receiver, message=data["data"]["message"]
    )
    ip_address = os.getenv("IP_ADDRESS")
    protocol = os.getenv('PROTOCOL')
    channel_names = user_channels.get(receiver.id)
    mychannel_names = user_channels.get(sender.id)

    formatted_date = message.timestamp.strftime('%Y/%m/%d AT %I:%M %p')

    message_data = {
        "type": "send_direct",
        "data": {
            'senderAvatar': f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{sender.avatar.url}",
            "sender": sender.username,
            "receiver": receiver.username,
            "message": message.message,
            'senderId': sender.id,
            'receiverId': receiver.id,
            # 'date': message.timestamp.isoformat(),
            'date': formatted_date,
        },
    }

    if channel_names:
        for channel in channel_names:
            await self.channel_layer.send(channel, message_data)

    receiver_message_data = {
        **message_data,
        "data": {
            **message_data["data"],
            "receiver": sender.username, # overwrite receiver with sender
        }
    }
    if mychannel_names:
        for channel in mychannel_names:
            await self.channel_layer.send(channel, receiver_message_data)

    # Handle notifications counter
    user_notification_channels = notifs_user_channels.get(receiver.id)
    count = await sync_to_async(Directs.objects.filter(receiver=receiver, is_read=False).values('sender').distinct().count)() + await sync_to_async(Room.objects.filter(membership__user=receiver, membership__unreadCount__gt=0).count)()

    if user_notification_channels is not None:
        notification_data = {
            "type": "chatNotificationCounter",
            'message': count,
        }
        for user_channel in user_notification_channels:
            await self.channel_layer.send(user_channel, notification_data)
