from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message, Directs, RoomInvitation
from friends.models import Friendship
from myapp.models import customuser
from django.core.files.storage import default_storage


@api_view(["POST"])
def leave_chat_room(request):
    if (request.method == 'POST'):
        # get the user by username
        try:
            user = customuser.objects.get(username=request.data.get('member'))
        except customuser.DoesNotExist:
            return Response({'error': {'Opps!, User not found'}}, status=404)
        # get the room by name
        try:
            room = Room.objects.get(id=request.data.get('roomId'))
        except Room.DoesNotExist:
            return Response({'error': {'Opps!, Chat room not found'}}, status=404)
        # get the room memeber query by username
        try:
            member_to_kick = Membership.objects.get(user=user, room=room)
        except Membership.DoesNotExist:
            return Response({'error': {'Opps!, Something went Wrong'}}, status=404)

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
            if room.icon.path and default_storage.exists(room.icon.path):
                default_storage.delete(room.icon.path)
            room.delete()
        else:
            room.save()
        return Response({'success': 'You left chat room successfully', 'data': {'id': request.data.get('roomId'), 'user': request.data.get('member')}}, status=200)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['DELETE'])
def delete_chat_room(request, id):
    if request.method == 'DELETE':
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({'error': 'chat room name not found!'}, status=400)
        all_members = Membership.objects.filter(room=room)
        for member in all_members:
            member.delete()
        if room.icon.path and default_storage.exists(room.icon.path):
            default_storage.delete(room.icon.path)
        room.delete()
        return Response({'success': 'chat room has been deleted successfully', 'data': {'roomId': id}}, status=200)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def chat_room_update_icon(request):
    if request.method == 'POST':
        try:
            room = Room.objects.get(id=request.data.get('room'))
        except Room.DoesNotExist:
            return Response({'error': 'chat room name not found!'}, status=400)
        room.icon = request.data.get('icon')
        room.save()
        return Response({'success': 'chat room icon changed successfully'}, status=200)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['PATCH'])
def chat_room_update_name(request, id):
    if request.method == 'PATCH':
        if (Room.objects.filter(name=request.data.get('name'))).exists():
            return Response({'return': 'Name Already in Use'})
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            return Response({'error': 'chat room name not found!'})
        room.name = request.data.get('name')
        room.save()
        return Response({'success': 'chat room name changed successfully',
                         'data': {
                             'id': id,
                             'newName': room.name
                         }}, status=200)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def create_chat_room(request):
    if request.method == 'POST':
        print(f"datatata : {request.data}")
        try:
            user = customuser.objects.get(username=request.data.get('user'))
        except customuser.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)
        room = Room.objects.filter(name=request.data.get('name')).first()
        if not room:
            new_room = Room.objects.create(name=request.data.get('name'), topic=request.data.get(
                'topic'), icon=request.FILES.get('icon'), visiblity=request.data.get('visibility'))
            new_room.members_count += 1
            new_room.save()
        elif room:
            return Response({'error': 'Chat room name is taken. Try a different one.'})
        Membership.objects.create(user=user, room=new_room, roles="admin")
        return Response({
            'type': 'chatRoomCreated',
            'room': {
                "id": new_room.id,
                "role": "admin",
                "name": new_room.name,
                "topic": new_room.topic,
                "icon_url": new_room.icon.path,
                "membersCount": new_room.members_count
            }
        })
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def channel_list(request, username):
    if request.method == 'GET':
        user = customuser.objects.get(username=username)
        memberships = Membership.objects.filter(user=user)
        print(memberships)
        rooms = []
        for membership in memberships:
            room_data = {
                'id': membership.room.id,
                'role': membership.roles,
                'name': membership.room.name,
                'topic': membership.room.topic,
                'icon_url': membership.room.icon.path,
                'membersCount': membership.room.members_count,
                'cover': membership.room.cover.path
            }
            rooms.append(room_data)
        print(user.username, " rooms: ", rooms)
        return Response(rooms)

    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def all_chat_room_memebers(request, chat_room_name):
    room = Room.objects.get(name=chat_room_name)
    members = Membership.objects.filter(room=room)
    data = []
    for member in members:
        if member.roles == 'member':
            user = customuser.objects.get(id=member.user_id)
            member_data = {
                'name': user.username,
                'avatar': user.avatar.path
            }
            data.append(member_data)
    print(data)
    return Response(data)


@api_view(['GET'])
def channel_messages(request, room_id):
    if request.method == 'GET':
        messages = Message.objects.filter(room_id=room_id)
        data = []
        for message in messages:
            message_data = {
                'id': message.id,
                'content': message.content,
                'sender': message.sender.username,
                'date': message.timestamp
            }
            data.append(message_data)
        return Response(data)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def direct_messages(request):
    if request.method == 'POST':
        username = customuser.objects.get(username=(request.data).get('user'))

        friend = customuser.objects.get(username=(request.data).get('friend'))
        messages = Directs.objects.filter(
            Q(sender=username, reciver=friend) | Q(sender=friend, reciver=username))
        data = []
        for message in messages:
            message_data = {
                'id': message.id,
                'sender': message.sender.username,
                'reciver': message.reciver.username,
                'content': message.message,
                'date': message.timestamp
            }
            data.append(message_data)
        sorted_by_date = sorted(data, key=lambda x: x['date'])
        return Response(sorted_by_date)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def list_all_friends(request):
    if request.method == 'POST':
        user = customuser.objects.get(username=(request.data).get('user'))
        friends = Friendship.objects.filter(user=user)
        room = Room.objects.get(name=request.data.get('room'))
        all_friend = []
        for friend in friends:
            print("the friend: ", friend)
            friend_object = customuser.objects.get(id=friend.friend_id)
            if not Membership.objects.filter(room=room, user=friend_object).exists():
                friend_data = {
                    'name': friend_object.username,
                    'avatar': friend_object.avatar.path
                }
                all_friend.append(friend_data)
        return Response(all_friend)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def rooms_invitations(request, username):
    if request.method == 'GET':
        user = customuser.objects.get(username=username)
        invitations = RoomInvitation.objects.filter(user=user)
        all_invitations = []
        for invitaion in invitations:
            room = Room.objects.get(id=invitaion.room_id)
            invitaion_data = {
                "name": room.name,
                "topic": room.topic,
                "icon_url": room.icon.path,
                "membersCount": room.members_count,
            }
            all_invitations.append(invitaion_data)
        return Response(all_invitations)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def suggested_chat_rooms(request, username):
    if request.method == 'GET':
        user = customuser.objects.get(username=username)
        memberships = Membership.objects.filter(user=user)
        print(memberships)
        rooms = []
        for membership in memberships:
            room_data = {
                'id': membership.room.id,
                'role': membership.roles,
                'name': membership.room.name,
                'topic': membership.room.topic,
                'icon_url': membership.room.icon.path,
                'membersCount': membership.room.members_count,
            }
            rooms.append(room_data)
        print(user.username, " rooms: ", rooms)
        return Response(rooms)

    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def direct_messages(request):
    if request.method == 'POST':
        print("THE USER IS", (request.data).get('user'))
        username = customuser.objects.get(username=(request.data).get('user'))

        friend = customuser.objects.get(username=(request.data).get('friend'))
        messages = Directs.objects.filter(
            Q(sender=username, reciver=friend) | Q(sender=friend, reciver=username))
        data = []
        for message in messages:
            message_data = {
                'id': message.id,
                'sender': message.sender.username,
                'reciver': message.reciver.username,
                'content': message.message,
                'date': message.timestamp
            }
            data.append(message_data)
        sorted_by_date = sorted(data, key=lambda x: x['date'])
        return Response(sorted_by_date)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['POST'])
def list_all_friends(request):
    if request.method == 'POST':
        user = customuser.objects.get(username=(request.data).get('user'))
        friends = Friendship.objects.filter(user=user)
        room = Room.objects.get(name=request.data.get('room'))
        all_friend = []
        for friend in friends:
            print("the friend: ", friend)
            friend_object = customuser.objects.get(id=friend.friend_id)
            if not Membership.objects.filter(room=room, user=friend_object).exists():
                friend_data = {
                    'name': friend_object.username,
                    'avatar': friend_object.avatar.path
                }
                all_friend.append(friend_data)
        return Response(all_friend)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def rooms_invitations(request, username):
    if request.method == 'GET':
        user = customuser.objects.get(username=username)
        invitations = RoomInvitation.objects.filter(user=user)
        all_invitations = []
        for invitaion in invitations:
            room = Room.objects.get(id=invitaion.room_id)
            invitaion_data = {
                "name": room.name,
                "topic": room.topic,
                "icon_url": room.icon.path,
                "membersCount": room.members_count,
            }
            all_invitations.append(invitaion_data)
        return Response(all_invitations)
    return Response({'error': 'Invalid request method'}, status=400)
