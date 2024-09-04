from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message, Directs, RoomInvitation
from friends.models import Friendship
from myapp.models import customuser
from django.core.files.storage import default_storage
import os
from .consumers import user_channels
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime


def get_protocol(request):
    return "https" if request.is_secure() else "http"


@api_view(["POST"])
def leave_chat_room(request):
    if request.method == "POST":
        # get the user by username
        try:
            user = customuser.objects.get(username=request.data.get("member"))
        except customuser.DoesNotExist:
            return Response({"error": {"Opps!, User not found"}}, status=404)
        # get the room by name
        try:
            room = Room.objects.get(id=request.data.get("roomId"))
        except Room.DoesNotExist:
            return Response({"error": {"Opps!, Chat room not found"}}, status=404)
        # get the room memeber query by username
        try:
            member_to_kick = Membership.objects.get(user=user, room=room)
        except Membership.DoesNotExist:
            return Response({"error": {"Opps!, Something went Wrong"}}, status=404)

        member_roles = member_to_kick.roles
        # cick the member from the room membership
        member_to_kick.delete()
        if member_roles == "admin":
            print("the user is an admin")
            all_members = Membership.objects.filter(room=room).order_by("joined_at")
            admin_found = 0
            for member in all_members:
                if member.roles == "admin" and member_to_kick != member:
                    admin_found += 1
            if all_members and not admin_found:
                all_members[0].roles = "admin"
                new_admin = customuser.objects.get(id=all_members[0].user_id)
                all_members[0].save()
        room.members_count -= 1
        if room.members_count == 0:
            if (
                room.icon.path
                and room.icon.url != "/uploads/roomIcon.png"
                and default_storage.exists(room.icon.path)
            ):
                default_storage.delete(room.icon.path)
            if (
                room.cover.path
                and room.cover.url != "/uploads/roomCover.png"
                and default_storage.exists(room.cover.path)
            ):
                default_storage.delete(room.cover.path)
            room.delete()
        else:
            room.save()
        return Response(
            {
                "success": "You left chat room successfully",
                "data": {
                    "id": request.data.get("roomId"),
                    "user": request.data.get("member"),
                },
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["DELETE"])
def delete_chat_room(request, id):
    if request.method == "DELETE":
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        all_members = Membership.objects.filter(room=room)
        for member in all_members:
            member.delete()
        print("ROOM ICON URL: ", room.icon.url)
        print("ROOM COVER URL: ", room.cover.url)
        if (
            room.icon.path
            and room.icon.url != "/media/uploads/roomIcon.png"
            and default_storage.exists(room.icon.path)
        ):
            default_storage.delete(room.icon.path)
        if (
            room.cover.path
            and room.cover.url != "/media/uploads/roomCover.png"
            and default_storage.exists(room.cover.path)
        ):
            default_storage.delete(room.cover.path)
        room.delete()
        return Response(
            {
                "success": "chat room has been deleted successfully",
                "data": {"roomId": id},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def chat_room_update_icon(request):
    if request.method == "POST":
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        if (
            room.icon.path
            and room.icon.url != "/uploads/roomIcon.png"
            and default_storage.exists(room.icon.path)
        ):
            default_storage.delete(room.icon.path)
        room.icon = request.data.get("icon")
        room.save()
        return Response({"success": "chat room icon changed successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def chat_room_update_cover(request):
    if request.method == "POST":
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        cover = request.data.get("cover")
        if cover is None or cover == "null":
            return Response({"error": "invalid chat room cover!"}, status=400)
        if (
            room.cover.path
            and room.cover.url != "/uploads/roomCover.png"
            and default_storage.exists(room.cover.path)
        ):
            default_storage.delete(room.cover.path)
        room.cover = request.data.get("cover")
        room.save()
        return Response(
            {
                "success": "chat room cover changed successfully",
                "data": {"id": room.id, "cover": room.cover.path},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["PATCH"])
def chat_room_update_name(request, id):
    if request.method == "PATCH":
        if (Room.objects.filter(name=request.data.get("name"))).exists():
            return Response({"return": "Name Already in Use"})
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"})
        room.name = request.data.get("name")
        room.save()
        return Response(
            {
                "success": "chat room name changed successfully",
                "data": {"id": id, "newName": room.name},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def create_chat_room(request):
    if request.method == "POST":
        try:
            user = customuser.objects.get(username=request.data.get("user"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        room = Room.objects.filter(name=request.data.get("name")).first()
        if not room:
            icon = icon = request.FILES.get("icon")
            if icon is None or icon == "null":
                new_room = Room.objects.create(
                    name=request.data.get("name"),
                    topic=request.data.get("topic"),
                    visiblity=request.data.get("visibility"),
                )
            else:
                new_room = Room.objects.create(
                    name=request.data.get("name"),
                    topic=request.data.get("topic"),
                    icon=request.FILES.get("icon"),
                    visiblity=request.data.get("visibility"),
                )
            new_room.members_count = 1
            new_room.save()
        elif room:
            return Response(
                {"error": "Chat room name is taken. Try a different one."}, status=400
            )
        Membership.objects.create(user=user, room=new_room, roles="admin")
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(user.id)
        for channel in user_channels_name:
            async_to_sync(channel_layer.group_add(f"chat_room_{new_room.id}", channel))
        return Response(
            {
                "type": "chatRoomCreated",
                "room": {
                    "id": new_room.id,
                    "name": new_room.name,
                    "topic": new_room.topic,
                    "role": "admin",
                    "icon": f"{protocol}://{ip_address}:8000/chatAPI{new_room.icon.url}",
                    "cover": f"{protocol}://{ip_address}:8000/chatAPI{new_room.cover.url}",
                    "membersCount": new_room.members_count,
                },
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["GET"])
def channel_list(request, username):
    if request.method == "GET":
        user = customuser.objects.get(username=username)
        memberships = Membership.objects.filter(user=user)
        rooms = []
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        for membership in memberships:
            room_data = {
                "id": membership.room.id,
                "role": membership.roles,
                "name": membership.room.name,
                "topic": membership.room.topic,
                "icon": f"{protocol}://{ip_address}:8000/chatAPI{membership.room.icon.url}",
                "cover": f"{protocol}://{ip_address}:8000/chatAPI{membership.room.cover.url}",
                "membersCount": membership.room.members_count,
            }
            rooms.append(room_data)
        return Response(rooms)

    return Response({"error": "Invalid request method"}, status=400)


@api_view(["GET"])
def all_chat_room_memebers(request, chat_room_name):
    room = Room.objects.get(name=chat_room_name)
    members = Membership.objects.filter(room=room)
    data = []
    for member in members:
        if member.roles == "member":
            user = customuser.objects.get(id=member.user_id)
            member_data = {"name": user.username, "avatar": user.avatar.path}
            data.append(member_data)
    return Response(data)


@api_view(["GET"])
def channel_messages(request, room_id):
    if request.method == "GET":
        messages = Message.objects.filter(room_id=room_id)
        data = []
        for message in messages:
            timestamp = message.timestamp.isoformat()
            dt = datetime.fromisoformat(timestamp)
            formatted_time = dt.strftime("%Y/%m/%d AT %I:%M %p")
            message_data = {
                "id": message.id,
                "content": message.content,
                "sender": message.sender.username,
                "date": formatted_time,
            }
            data.append(message_data)
        return Response(data)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def direct_messages(request):
    if request.method == "POST":
        username = customuser.objects.get(username=(request.data).get("user"))
        friend = customuser.objects.get(username=(request.data).get("friend"))
        messages = Directs.objects.filter(
            Q(sender=username, reciver=friend) | Q(sender=friend, reciver=username)
        ).order_by('timestamp')
        data = []
        for message in messages:
            timestamp = message.timestamp.isoformat()
            dt = datetime.fromisoformat(timestamp)
            formatted_time = dt.strftime("%Y/%m/%d AT %I:%M %p")
            message_data = {
                "id": message.id,
                "sender": message.sender.username,
                "reciver": message.reciver.username,
                "content": message.message,
                "date": formatted_time,
            }
            data.append(message_data)
        # sorted_by_date = sorted(data, key=lambda x: x["date"])
        return Response(data)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def list_all_friends(request):
    if request.method == "POST":
        print(request.data)
        try:
            user = customuser.objects.get(username=(request.data).get("user"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        try:
            friends = Friendship.objects.filter(user=user)
        except Friendship.DoesNotExist:
            return Response({"error": "Opps! Something went wrong"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("id"))
        except Room.DoesNotExist:
            return Response({"error": "Opps! Something went wrong"}, status=400)
        all_friend = []
        for friend in friends:
            try:
                friend_object = customuser.objects.get(id=friend.friend_id)
            except customuser.DoesNotExist:
                return Response({"error": "Opps! Something went wrong"}, status=400)
            my_friend = Membership.objects.filter(room=room, user=friend_object)
            if not my_friend:
                friend_data = {
                    "name": friend_object.username,
                    "avatar": f"http://localhost:8000/auth{friend_object.avatar.url}",
                }
                all_friend.append(friend_data)
        return Response(all_friend)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["GET"])
def rooms_invitations(request, username):
    if request.method == "GET":
        user = customuser.objects.get(username=username)
        invitations = RoomInvitation.objects.filter(user=user)
        all_invitations = []
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        for invitaion in invitations:
            room = Room.objects.get(id=invitaion.room_id)
            invitaion_data = {
                "name": room.name,
                "topic": room.topic,
                "icon": f"{protocol}://{ip_address}:8000/chatAPI{room.icon.url}",
                "membersCount": room.members_count,
            }
            all_invitations.append(invitaion_data)
        return Response(all_invitations)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["GET"])
def suggested_chat_rooms(request, username):
    if request.method == "GET":
        user = customuser.objects.get(username=username)
        # Get memberships for the user
        user_memberships = Membership.objects.filter(user=user).values_list(
            "room_id", flat=True
        )
        # Exclude rooms that the user has already joined
        suggested_memberships = Membership.objects.exclude(room_id__in=user_memberships)
        rooms = []
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        for membership in suggested_memberships:
            if membership.room.visiblity == "public":
                room_data = {
                    "id": membership.room.id,
                    "role": membership.roles,
                    "name": membership.room.name,
                    "topic": membership.room.topic,
                    "icon": f"{protocol}://{ip_address}:8000/chatAPI{membership.room.icon.url}",
                    "cover": f"{protocol}://{ip_address}:8000/chatAPI{membership.room.cover.url}",
                    "membersCount": membership.room.members_count,
                }
                rooms.append(room_data)
        return Response(rooms)
    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def chat_room_members_list(request):
    if request.method == "POST":
        try:
            room = Room.objects.get(id=request.data.get("id"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        memberships = Membership.objects.filter(room=room)
        data = []
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        for member in memberships:
            member_data = {
                "username": member.user.username,
                "avatar": f"{protocol}://{ip_address}:8000/chatAPI{member.user.avatar.url}",
            }
            data.append(member_data)
        return Response(data, status=200)

    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def accept_chat_room_invite(request):
    if request.method == "POST":
        try:
            user = customuser.objects.get(username=request.data.get("user"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        try:
            invitation = RoomInvitation.objects.get(user=user, room=room)
        except RoomInvitation.DoesNotExist:
            return Response({"error": "opps, something went wrong"}, status=400)
        Membership.objects.create(user=user, room=room, roles="member")
        room.members_count += 1
        invitation.delete()
        room.save()
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(user.id)
        for channel in user_channels_name:
            async_to_sync(channel_layer.group_add(f"chat_room_{room.id}", channel))
        return Response(
            {
                "success": f"You have joined {room.name} chat room",
                "room": {
                    "id": room.id,
                    "role": "member",
                    "name": room.name,
                    "topic": room.topic,
                    "icon": f"{protocol}://{ip_address}:8000/chatAPI{room.icon.url}",
                    "cover": f"{protocol}://{ip_address}:8000/chatAPI{room.cover.url}",
                    "membersCount": room.members_count,
                },
            }
        )

    return Response({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def cancel_chat_room_invite(request):
    pass


@api_view(["POST"])
def reset_unread_messages(request):
    if request.method == "POST":
        try:
            user = customuser.objects.get(username=request.data.get("user"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        try:
            receiver = customuser.objects.get(id=request.data.get("receiver"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        unread = Directs.objects.filter(sender=receiver, reciver=user, is_read=False)
        if unread:
            unread.update(is_read=True)
        return Response({"success": "reset unread message successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)


def get_direct_last_message(username, friend):
    user = customuser.objects.get(username=username)
    friend = customuser.objects.get(username=friend)
    last_message = (
        Directs.objects.filter(
            Q(sender=user, reciver=friend) | Q(sender=friend, reciver=user)
        )
        .order_by("-timestamp")
        .first()
    )
    if last_message == None:
        return ""
    return last_message.message


@api_view(["GET"])
def friends_with_directs(request, username):
    user = customuser.objects.get(username=username)
    friends = Friendship.objects.filter(user=user, isBlocked=False)
    data = []
    protocol = get_protocol(request)
    ip_address = os.getenv("IP_ADDRESS")
    for friend in friends:
        if Directs.objects.filter(
            Q(sender=user, reciver=friend.friend)
            | Q(sender=friend.friend, reciver=user)
        ).exists():
            last_message = get_direct_last_message(username, friend.friend.username)
            friend_data = {
                "id": friend.friend.id,
                "name": friend.friend.username,
                "avatar": f"{protocol}://{ip_address}:8000/chatAPI{friend.friend.avatar.url}",
                "is_online": friend.friend.is_online,
                "is_playing": friend.friend.is_playing,
                "lastMessage": last_message,
                "unreadCount": Directs.objects.filter(
                    reciver=user, sender=friend.friend, is_read=False
                ).count(),
            }
            data.append(friend_data)
    return Response(data)


@api_view(["POST"])
def join_chat_room(request):
    if request.method == "POST":
        try:
            user = customuser.objects.get(username=request.data.get("user"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("roomId"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        if Membership.objects.filter(user=user, room=room).exists():
            return Response({"error": "you already joined chat room"}, status=400)
        Membership.objects.create(user=user, room=room, roles="member")
        room.members_count += 1
        room.save()
        protocol = get_protocol(request)
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(user.id)
        for channel in user_channels_name:
            async_to_sync(channel_layer.group_add(f"chat_room_{room.id}", channel))
        return Response(
            {
                "success": f"You have joined {room.name} chat room",
                "room": {
                    "id": room.id,
                    "role": "member",
                    "name": room.name,
                    "topic": room.topic,
                    "icon": f"{protocol}://{ip_address}:8000/chatAPI{room.icon.url}",
                    "cover": f"{protocol}://{ip_address}:8000/chatAPI{room.cover.url}",
                    "membersCount": room.members_count,
                },
            }
        )

    return Response({"error": "Invalid request method"}, status=400)
