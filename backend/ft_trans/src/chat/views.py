from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message, Directs, Friends, RoomInvitation
from myapp.models import customuser ###########


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
                'role' : membership.roles,
                'name': membership.room.name,
                'topic': membership.room.topic,
                'icon_url':membership.room.icon.path,
                'membersCount': membership.room.members_count,
            }
            rooms.append(room_data)
        print(user.username," rooms: ",rooms)
        return Response(rooms)

    return Response({'error': 'Invalid request method'}, status=400)

@api_view(['GET'])
def all_chat_room_memebers (request, chat_room_name) :
    room = Room.objects.get(name=chat_room_name)
    members = Membership.objects.filter(room=room)
    data = []
    for member in members:
        if member.roles == 'member':
            user = customuser.objects.get(id=member.user_id)
            member_data = {
                'name' : user.username,
                'avatar' : user.avatar.path
            }
            data.append(member_data)
    print(data)
    return Response(data)


@api_view (['GET'])
def channel_messages(request, room_id):
    if request.method == 'GET':
        messages = Message.objects.filter(room_id=room_id)
        data = []
        for message in messages:
            message_data = {
                'id':message.id,
                'content': message.content,
                'sender' : message.sender.username,
                'date' : message.timestamp
            }
            data.append(message_data)
        return Response (data)
    return Response({'error': 'Invalid request method'}, status=400)

@api_view (['POST'])
def direct_messages(request):
    if request.method == 'POST':
        username = customuser.objects.get(username = (request.data).get('user'))
        friend = customuser.objects.get(username = (request.data).get('friend'))
        messages = Directs.objects.filter(Q(sender=username, reciver=friend) | Q(sender=friend, reciver=username))
        data = []
        for message in messages:
            message_data = {
                'id':message.id,
                'sender' : message.sender.username,
                'reciver' : message.reciver.username,
                'content': message.message,
                'date' : message.timestamp
            }
            data.append(message_data)
        sorted_by_date = sorted(data, key=lambda x: x['date'])
        return Response (sorted_by_date)
    return Response({'error': 'Invalid request method'}, status=400)

@api_view(['POST'])
def list_all_friends(request):
    if request.method == 'POST' :
        user = customuser.objects.get(username=(request.data).get('user'))
        friends = Friends.objects.filter(user=user)
        room = Room.objects.get(name= request.data.get('room'))
        all_friend = []
        for friend in friends:
            print("the friend: ",friend)
            friend_object = customuser.objects.get(id=friend.friend_id)
            if not Membership.objects.filter(room=room, user=friend_object).exists():
                friend_data = {
                    'name' : friend_object.username,
                    'avatar' : friend_object.avatar.path
                }
                all_friend.append(friend_data)
        return Response (all_friend)
    return Response({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def rooms_invitations(request, username):
    if request.method == 'GET':
        user = customuser.objects.get(username=username)
        invitations = RoomInvitation.objects.filter(user=user)
        all_invitations = []
        for invitaion in invitations :
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