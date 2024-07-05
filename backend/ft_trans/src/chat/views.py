from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message, Directs
from myapp.models import customuser ###########


@api_view(['GET'])
def channel_list(request, username):
    if request.method == 'GET':
        memberships = Membership.objects.filter(user__username=username)  # Filter memberships by username
        channel_ids = memberships.values_list('room_id', flat=True)  # Get the room IDs

        channels = Room.objects.filter(id__in=channel_ids)
        data = []

        for channel in channels:
            messages = Message.objects.filter(room_id=channel.id)
            # if(messages):
            channel_data = {
                'id': channel.id,
                'name': channel.name,
                'topic': channel.topic,
                'icon_url':channel.icon.path,
                'membersCount': channel.members_count,
            }
            data.append(channel_data)
        print('channel data: ',data)
        return Response(data)

    return Response({'error': 'Invalid request method'}, status=400)

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
