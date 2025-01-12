from django.db.models import OuterRef, Subquery, Exists, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message, Directs, RoomInvitation
from friends.models import Friendship
from myapp.models import customuser
from django.core.files.storage import default_storage
import os
from .common import user_channels
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime
from .serializers import friends_with_directs_serializer, direct_message_serializer, room_serializer, room_message_serializer
from rest_framework.pagination import PageNumberPagination
from myapp.decorators import authentication_required
import sys
import logging

# from Notifications.consumers import notifs_user_channels

class CustomLimitOffsetPagination(PageNumberPagination):
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100  # Maximum page size the user can request


class CustomMyChatRoomLimitOffsetPagination(PageNumberPagination):
    page_size = 6  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100  # Maximum page size the user can request

@authentication_required
@api_view(["GET"])
def friends_with_directs(request, **kwargs):
    try:
        user = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    friends = Friendship.objects.filter(user=user, block_status = Friendship.BLOCK_NONE)
    last_message_subquery = Directs.objects.filter(
        Q(sender=user, receiver=OuterRef('friend')) | 
        Q(receiver=user, sender=OuterRef('friend'))
    ).order_by('-timestamp').values('timestamp')[:1]  # Get the latest timestamp

    # Step 3: Filter friends who have messages and annotate (katizd filde akhour f resault mkainch f tabel) with last message timestamp
    friends_with_messages = friends.annotate(
        last_message_timestamp=Subquery(last_message_subquery)
    ).filter(
        Exists(Directs.objects.filter(
            Q(sender=user, receiver=OuterRef('friend')) | 
            Q(receiver=user, sender=OuterRef('friend'))
        ))
    ).order_by('-last_message_timestamp')  # Sort by last message timestamp
    paginator = CustomLimitOffsetPagination()
    result_page = paginator.paginate_queryset(friends_with_messages, request)
    serializer = friends_with_directs_serializer(result_page, many=True, context={
        'username': user.username,  # Passing the username to get the last message
        'user': user
    })

    return paginator.get_paginated_response(serializer.data)

@authentication_required
@api_view(["POST"])
def direct_messages(request, **kwargs):
    try:
        username = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    id = (request.data).get("friend")
    if id is None or type(id) is not int:
        return Response({"error": "Invalid friend id"}, status=400)
    try:
        friend = customuser.objects.get(id=(request.data).get("friend")) # TODO: change to id => DONE
    except customuser.DoesNotExist:
        return Response({"error": "friend not found"}, status=400)
    messages = Directs.objects.filter(
        Q(sender=username, receiver=friend) | Q(sender=friend, receiver=username)
    ).order_by('-timestamp')
    paginator = CustomLimitOffsetPagination()
    result_page = paginator.paginate_queryset(messages, request)
    reversed_page = list(reversed(result_page))
    serializer = direct_message_serializer(reversed_page,  many=True)
    return paginator.get_paginated_response(serializer.data)

@authentication_required
@api_view(["GET"])
def chat_rooms_list(request, **kwargs):
    try:
        user = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    memberships = Membership.objects.filter (user=user, room__message__isnull=False).distinct()
    ordered_memberships = sorted(
        memberships,
        key=lambda membership: membership.room.message_set.last().timestamp
        if membership.room.message_set.last()
        else membership.room.membership_set.last().joined_at,
        reverse=True,
    )
    paginator = CustomLimitOffsetPagination()
    result_page = paginator.paginate_queryset(ordered_memberships, request)
    serializer = room_serializer(result_page, many=True, context={"user": user})
    return paginator.get_paginated_response(serializer.data)

@authentication_required
@api_view(["GET"])
def my_chat_rooms(request, **kwargs):
    try:
        user = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    memberships = Membership.objects.filter(user=user)
    paginator = CustomMyChatRoomLimitOffsetPagination()
    result_page = paginator.paginate_queryset(memberships, request)
    serializer = room_serializer(result_page, many=True, context={"user": user})
    return paginator.get_paginated_response(serializer.data)


@authentication_required
@api_view(["GET"])
def chat_room_messages(request, room_id, **kwargs):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({"error": "chat room not found"}, status=400)
    try:
        Membership.objects.get(user__id=kwargs.get("user_id"), room=room)
    except Membership.DoesNotExist:
        return Response({"error": "you are not a member of this chat room"}, status=400)
    messages = Message.objects.filter(room_id=room_id).order_by("-timestamp")
    paginator = CustomLimitOffsetPagination()
    result_page = paginator.paginate_queryset(messages, request)
    reversed_page = list(reversed(result_page))
    serializer = room_message_serializer(reversed_page, many=True)
    return paginator.get_paginated_response(serializer.data)




def set_new_admin(room):
    members = Membership.objects.filter(room=room).order_by("joined_at")
    if not members.filter(role="admin").exists() and members.exists():
        new_admin = members.first()
        new_admin.role = "admin"
        new_admin.save()
        return new_admin.user_id
    return None
  


@authentication_required
@api_view(["POST"])
def leave_chat_room(request, **kwargs):
    # get the user by username
    try:
        user = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": {"Opps!, User not found"}}, status=404)
    # get the room by name
    try:
        room = Room.objects.get(id=request.data.get("roomId"))
    except Room.DoesNotExist:
        return Response({"error": {"Opps!, Chat room not found"}}, status=404)

    roomId = room.id
    # get the room memeber query by username
    try:
        member_to_kick = Membership.objects.get(user=user, room=room)
    except Membership.DoesNotExist:
        return Response({"error": {"Opps!, you're Not a member of this chat room"}}, status=404)
    member_to_kick.delete()
    new_admin_id = set_new_admin(room)
    room.members_count -= 1
    if room.members_count == 0:
        if (
            room.icon.path
            and room.icon.url != "/media/uploads_default/roomIcon.png"
            and default_storage.exists(room.icon.path)
        ):
            default_storage.delete(room.icon.path)
        if (
            room.cover.path
            and room.cover.url != "/media/uploads_default/roomCover.png"
            and default_storage.exists(room.cover.path)
        ):
            default_storage.delete(room.cover.path)
        room.delete()
    else:
        room.save()
    channel_layer = get_channel_layer()
    user_channels_name = user_channels.get(user.id)
    protocol = os.getenv("PROTOCOL")
    ip_address = os.getenv("IP_ADDRESS")
    if user_channels_name is not None:
        for channel in user_channels_name:
            async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type' : 'chatRoomLeft',"roomId": roomId}})
            async_to_sync(channel_layer.group_discard(f"chat_room_{room.id}", channel))
    new_admin_id_channels = user_channels.get(new_admin_id)
    if new_admin_id_channels is not None:
        for channel in new_admin_id_channels:
                async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type' : 'chatRoomAdminAdded',"message": {"name": room.name}}})
    async_to_sync(channel_layer.group_send)(f"chat_room_{room.id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomMemberLeft', "roomId": room.id, "newCount": room.members_count}})
    return Response(
        {
            "success": "You left chat room successfully",
        },
        status=200,
    )



@authentication_required
@api_view(["POST"])
def chat_room_update_icon(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        is_admin = Membership.objects.filter(user=user, room=room, role="admin").exists()
        if not is_admin:
            return Response({"error": "You are not an admin of this chat room"}, status=400)
        if (
            room.icon.path
            and room.icon.url != "/media/uploads_default/roomIcon.png"
            and default_storage.exists(room.icon.path)
        ):
            default_storage.delete(room.icon.path)
        try:
            icon = request.data.get("icon")
        except:
            return Response({"error": "Invalid chat room icon!"}, status=400)
        # room.icon = request.data.get("icon")
        try:
            room.icon = icon
            room.save()
        except:
            return Response({"error": "Invalid chat room icon!"}, status=400)
        # TODO: I WILL SEND THE NEW COVER TO ALL MEMBERS USING SOCKET
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        #print the channel names of the group
        # print("group: channels: ",channel_layer.group_channels(f"chat_room_{room.id}"))
        print(f"chat_room_{room.id}")
        async_to_sync(channel_layer.group_send)(f"chat_room_{room.id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomIconChanged', "roomId": room.id, "newIcon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.icon.url}"}})
        return Response({"success": "chat room icon changed successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def chat_room_update_cover(request, **kwargs):
    # TODO: i need to send the room updater
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        is_admin = Membership.objects.filter(user=user, room=room, role="admin").exists()
        if not is_admin:
            return Response({"error": "You are not an admin of this chat room"}, status=400)
        try:
            cover = request.data.get("cover")
        except:
            return Response({"error": "Invalid chat room cover!"}, status=400)
        if cover is None or cover == "null":
            return Response({"error": "invalid chat room cover!"}, status=400)
        if (
            room.cover.path
            and room.cover.url != "/media/uploads_default/roomCover.png"
            and default_storage.exists(room.cover.path)
        ):
            default_storage.delete(room.cover.path)
        try:
            room.cover = cover
            room.save()
        except:
            return Response({"error": "Invalid chat room cover!"}, status=400)
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        # TODO: I WILL SEND THE NEW COVER TO ALL MEMBERS USING SOCKET
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f"chat_room_{room.id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomCoverChanged', "roomId": room.id, "newCover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.cover.url}"}})
        return Response(
            {
                "success": "chat room cover changed successfully",
                "data": {"id": room.id, "cover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.cover.url}"},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["PATCH"])
def chat_room_update_name(request,id ,**kwargs):
    if request.method == "PATCH":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        try:
            Membership.objects.get(user=user, room__id=id, role="admin")
        except Membership.DoesNotExist:
            return Response({"error": "You are not an admin of this chat room"}, status=400)
        if (Room.objects.filter(name=request.data.get("name"))).exists():
            return Response({"return": "Name Already in Use"})
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"})
        new_name = request.data.get("name")
        if new_name == room.name or new_name is None or len(new_name) == 0 or len(new_name) > 18:
            return Response({"error": "Opps! invalid name"}, status=400)
        try:
            room.name = request.data.get("name")
            room.save()
        except:
            return Response({"error": "Opps! something went wrong"}, status=400)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f"chat_room_{room.id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomNameChanged', "roomId": room.id, "newName": room.name}})
        return Response(
            {
                "success": "chat room name changed successfully",
                "data": {"id": id, "newName": room.name},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def create_chat_room(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        room = Room.objects.filter(name=request.data.get("name")).first()
        if not room:
            try:
                icon = request.data.get("icon")
            except:
                return Response({"error": "Invalid chat room icon!"}, status=400)
            if (
                request.data.get("name") is None
                or len(request.data.get("name")) == 0
                or len(request.data.get("name")) > 18
            ):
                return Response({"error": "Opps! invalid name"}, status=400)
            # topic len > 0 and len < 80
            if (
                request.data.get("topic") is None
                or len(request.data.get("topic")) == 0
                or len(request.data.get("topic")) > 80
            ):
                return Response({"error": "Opps! invalid topic"}, status=400)
            if request.data.get("visibility") is None or request.data.get("visibility") not in ["public", "private"]:
                return Response({"error": "Opps! invalid visibility"}, status=400)
            if icon is None or icon == "null" or len(icon) == 0:
                new_room = Room.objects.create(
                    name=request.data.get("name"),
                    topic=request.data.get("topic"),
                    visiblity=request.data.get("visibility"),
                )
            else:
                try:
                    new_room = Room.objects.create(
                        name=request.data.get("name"),
                        topic=request.data.get("topic"),
                        icon=request.data.get("icon"),
                        visiblity=request.data.get("visibility"),
                    )
                except:
                    return Response({"error": "Opps! invalid data"}, status=400)
            try:
                new_room.members_count = 1
                new_room.save()
            except:
                return Response({"error": "Opps! something went wrong"}, status=400)
        elif room:
            return Response(
                {"error": "Chat room name is taken. Try a different one."}, status=400
            )
        try:
            Membership.objects.create(user=user, room=new_room, role="admin")
        except:
            return Response({"error": "Opps! something went wrong"}, status=400)
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(user.id)
        if user_channels_name is not None:
            for channel in user_channels_name:
                async_to_sync(channel_layer.group_add)(f"chat_room_{new_room.id}", channel)
                async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type': 'chatRoomJoined', "room": {
                            "id": new_room.id,
                            "role": "admin",
                            "name": new_room.name,
                            "topic": new_room.topic,
                            "icon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{new_room.icon.url}",
                            "cover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{new_room.cover.url}",
                            "membersCount": new_room.members_count,
                        },}})
        return Response(
            {
                "type": "chatRoomCreated",
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)

def delete_file(file, default_file):
    if file.path and file.url != default_file and default_storage.exists(file.path):
        default_storage.delete(file.path)

@authentication_required
@api_view(["DELETE"])
def delete_chat_room(request, id,**kwargs):
    if request.method == "DELETE":
        # TODO: i need to send the room updater
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        try:
            Membership.objects.get(user=user, room__id=id, role="admin")
        except Membership.DoesNotExist:
            return Response({"error": "You are not an admin of this chat room"}, status=400)
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({"error": "chat room name not found!"}, status=400)
        try:
            Membership.objects.filter(room=room).delete()
        except Membership.DoesNotExist:
            return Response({"error": "Opps! something went wrong"}, status=400)
        delete_file(room.icon, "/media/uploads_default/roomIcon.png")
        delete_file(room.cover, "/media/uploads_default/roomCover.png")
        try:
            room.delete()
        except:
            return Response({"error": "Opps! something went wrong"}, status=400)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f"chat_room_{id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomDeleted', "roomId": id}})
        return Response(
            {
                "success": "chat room has been deleted successfully",
                "data": {"roomId": id},
            },
            status=200,
        )
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["GET"])
def all_chat_room_memebers(request, chat_room_name, **kwargs):
    # TODO: i need to send the room updater
    try:
        user = customuser.objects.get(id=kwargs.get("user_id"))
    except customuser.DoesNotExist:
        return Response({"error": "User not found"}, status=400)
    try:
        Membership.objects.get(user=user, room__name=chat_room_name)
    except Membership.DoesNotExist:
        return Response({"error": "You are not a member of this chat room"}, status=400)
    try:
        room = Room.objects.get(name=chat_room_name)
    except Room.DoesNotExist:
        return Response({"error": "chat room name not found!"}, status=400)

    members = Membership.objects.filter(room=room)
    data = []
    for member in members:
        if member.role == "member":
            try:
                user = customuser.objects.get(id=member.user_id)
            except customuser.DoesNotExist:
                return Response({"error": "Opps! something went wrong"}, status=400)
            member_data = {"name": user.username, "avatar": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.avatar.url}"}
            data.append(member_data)
    return Response(data)

@authentication_required
@api_view(["POST"])
def list_all_friends(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        try:
            Membership.objects.get(user=user, room__id=request.data.get("id"), role="admin")
        except Membership.DoesNotExist:
            return Response({"error": "You are not an admin of this chat room"}, status=400)
        try:
            friends = Friendship.objects.filter(user=user, block_status = Friendship.BLOCK_NONE)
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
            is_member = Membership.objects.filter(room=room, user=friend_object)
            if not is_member:
                friend_data = {
                    "name": friend_object.username,
                    "avatar": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{friend_object.avatar.url}",
                }
                all_friend.append(friend_data)
        return Response(all_friend)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["GET"])
def rooms_invitations(request, **kwargs):
    if request.method == "GET":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        invitations = RoomInvitation.objects.filter(user=user)
        all_invitations = []
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        for invitaion in invitations:
            room = Room.objects.get(id=invitaion.room_id)
            invitaion_data = {
                'id' : room.id,
                "name": room.name,
                "topic": room.topic,
                "icon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.icon.url}",
                'status': invitaion.status,
                "membersCount": room.members_count,
            }
            all_invitations.append(invitaion_data)
        return Response(all_invitations)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["GET"])
def suggested_chat_rooms(request, **kwargs):
    if request.method == "GET":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        # Get memberships for the user
        user_memberships = Membership.objects.filter(user=user).values_list(
            "room_id", flat=True
        )
        # Exclude rooms that the user has already joined
        suggested_memberships = Membership.objects.exclude(room_id__in=user_memberships)
        rooms = []
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        for membership in suggested_memberships:
            if membership.room.visiblity == "public":
                room_data = {
                    "id": membership.room.id,
                    "role": membership.role,
                    "name": membership.room.name,
                    "topic": membership.room.topic,
                    "icon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{membership.room.icon.url}",
                    "cover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{membership.room.cover.url}",
                    "membersCount": membership.room.members_count,
                }
                rooms.append(room_data)
        return Response(rooms)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def chat_room_members_list(request, **kwargs):
    # TODO: i need to send the room updater
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        try:
            Membership.objects.get(user=user, room__id=request.data.get("id"))
        except Membership.DoesNotExist:
            return Response({"error": "you are not a member of this chat room"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("id"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        memberships = Membership.objects.filter(room=room)
        data = []
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        for member in memberships:
            member_data = {
                "username": member.user.username,
                "avatar": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{member.user.avatar.url}",
            }
            data.append(member_data)
        return Response(data, status=200)

    return Response({"error": "Invalid request method"}, status=400)

# IM HERE

@authentication_required
@api_view(["POST"])
def accept_chat_room_invite(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        room = request.data.get("room")
        if room is None or type(room) is not int:
            return Response({"error": "Invalid chat room id"}, status=400)
        try:
            invitation = RoomInvitation.objects.get(user=user, room__id=request.data.get("room"))
        except RoomInvitation.DoesNotExist:
            return Response({"error": "opps, something went wrong"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        if Membership.objects.filter(user=user, room=room).exists():
            return Response({"error": "you already joined chat room"}, status=400)
        try:
            Membership.objects.create(user=user, room=room, role="member")
            room.members_count += 1
            invitation.delete()
            room.save()
        except:
            return Response({"error": "opps, something went wrong"}, status=400)
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(user.id)
        if user_channels_name is not None:
            for channel in user_channels_name:
                async_to_sync(channel_layer.group_add)(f"chat_room_{room.id}", channel)
                async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type': 'chatRoomJoined', "room": {
                            "id": room.id,
                            "role": "member",
                            "name": room.name,
                            "topic": room.topic,
                            "icon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.icon.url}",
                            "cover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.cover.url}",
                            "membersCount": room.members_count,
                        },}})
        return Response(
            {
                "success": f"You have joined {room.name} chat room",
            }
        )

    return Response({"error": "Invalid request method"}, status=400)

# IM HERE BEFORE DEINER

@authentication_required
@api_view(["POST"])
def cancel_chat_room_invite(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        room = request.data.get("room")
        if room is None or type(room) is not int:
            return Response({"error": "Invalid chat room id"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("room"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        try:
            invitation = RoomInvitation.objects.get(user=user, room=room)
        except RoomInvitation.DoesNotExist:
            return Response({"error": "opps, something went wrong"}, status=400)
        try:
            invitation.delete()
        except:
            return Response({"error": "opps, something went wrong"}, status=400)
        user_channels_name = user_channels.get(user.id)
        channel_layer = get_channel_layer()
        if user_channels_name is not None:
            for channel in user_channels_name:
                async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type': 'chatRoomInviteCanceled', "roomId": room.id}})
        return Response({"success": "invitation has been canceled successfully", 'roomId': room.id}, status=200)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def reset_chat_room_unread_messages(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        room = request.data.get("roomId")
        if room is None or type(room) is not int:
            return Response({"error": "Invalid chat room id"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("roomId"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        Membership.objects.filter(user=user, room=room).update(unreadCount=0)
        return Response({"success": "reset unread message successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def reset_unread_messages(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        receiver = request.data.get("receiver")
        if receiver is None or type(receiver) is not int:
            return Response({"error": "Invalid receiver id"}, status=400)
        try:
            receiver = customuser.objects.get(id=request.data.get("receiver"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        unread = Directs.objects.filter(sender=receiver, receiver=user, is_read=False)
        if unread:
            unread.update(is_read=True)
        return Response({"success": "reset unread message successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def join_chat_room(request, **kwargs):
    if request.method == "POST":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        room = request.data.get("roomId")
        if room is None or type(room) is not int:
            return Response({"error": "Invalid chat room id"}, status=400)
        try:
            room = Room.objects.get(id=request.data.get("roomId"))
        except Room.DoesNotExist:
            return Response({"error": "chat room not found"}, status=400)
        if Membership.objects.filter(user=user, room=room).exists():
            return Response({"error": "you already joined chat room"}, status=400)
        try:
            Membership.objects.create(user=user, room=room, role="member")
            room.members_count += 1
            room.save()
        except:
            return Response({"error": "opps, something went wrong"}, status=400)
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        channel_layer = get_channel_layer()
        user_channels_name = user_channels.get(kwargs.get("user_id"))
        if user_channels_name is not None:
            for channel in user_channels_name:
                async_to_sync(channel_layer.group_add)(f"chat_room_{room.id}", channel)
                print(f"chat_room_{room.id}")
            for channel in user_channels_name:
                async_to_sync(channel_layer.send)(channel, {"type": "broadcast_message", 'data': {'type': 'chatRoomJoined', "room": {
                            "id": room.id,
                            "role": "member",
                            "name": room.name,
                            "topic": room.topic,
                            "icon": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.icon.url}",
                            "cover": f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{room.cover.url}",
                            "membersCount": room.members_count,
                        },}})
        async_to_sync(channel_layer.group_send)(f"chat_room_{room.id}", {"type": "broadcast_message", 'data': {'type': 'chatRoomMemberJoined', "roomId": room.id, "newCount": room.members_count}})
        return Response(
            {
                "success": f"You have joined {room.name} chat room",
                "room" : room.id
            }
        )

    return Response({"error": "Invalid request method"}, status=400)



# DONE:
@authentication_required
@api_view(["GET"])
def directs_search(request, **kwargs):
    if (request.method == 'GET'):
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        frienships = Friendship.objects.filter(user=user, friend__username__icontains=request.GET.get('searchUsername'), block_status = Friendship.BLOCK_NONE)
        serializer = friends_with_directs_serializer(frienships, many=True, context={
            'username': user.username,
            'user': user
        })
        return Response(serializer.data)
        
    return Response({"error": "Invalid request method"}, status=400)
#DONE
@authentication_required
@api_view(["GET"])
def chat_rooms_search(request, **kwargs):
    if request.method == "GET":
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        rooms = Membership.objects.filter(user=user, room__name__icontains=request.GET.get("searchRoomName"))
        serializer = room_serializer(rooms, many=True, context={"user": user})
        return Response(serializer.data)
    return Response({"error": "Invalid request method"}, status=400)

@authentication_required
@api_view(["POST"])
def update_status_of_invitations(request, **kwargs):
    if request.method == 'POST':
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        RoomInvitation.objects.filter(user=user).update(status="ACC")
        return Response({"success": "status updated successfully"}, status=200)
    return Response({"error": "Invalid request method"}, status=400)
#DONE
@authentication_required
@api_view(["GET"])
def unrecieved_room_invitee(request, **kwargs):
    if request.method == 'GET':
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        count = RoomInvitation.objects.filter(user=user, status="pending").count()
        return Response({"count": count}, status=200)

    return Response({"error": "Invalid request method"}, status=400)
#DONE
@authentication_required
@api_view(["GET"])
def unread_conversations_count(request, **kwargs):
    if request.method == 'GET':
        try:
            user = customuser.objects.get(id=kwargs.get("user_id"))
        except customuser.DoesNotExist:
            return Response({"error": "user not found"}, status=400)
        count = Directs.objects.filter(receiver=user, is_read=False).values('sender').distinct().count()
        count += Room.objects.filter(membership__user=user, membership__unreadCount__gt=0).count()
        return Response({"count": count}, status=200)
    return Response({"error": "Invalid request method"}, status=400)
