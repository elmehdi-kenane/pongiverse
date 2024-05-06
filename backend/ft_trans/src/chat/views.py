from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Membership, Message

@api_view(['GET'])
def channel_list(request, username):
    if request.method == 'GET':
        memberships = Membership.objects.filter(user__username=username)  # Filter memberships by username
        channel_ids = memberships.values_list('room_id', flat=True)  # Get the room IDs

        channels = Room.objects.filter(id__in=channel_ids)
        data = []

        for channel in channels:
            channel_data = {
                'id': channel.id,
                'name': channel.name,
            }
            data.append(channel_data)

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
