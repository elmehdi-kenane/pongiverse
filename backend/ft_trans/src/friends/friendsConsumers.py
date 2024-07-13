import json
from myapp.models import customuser
from .models import FriendRequest
from .serializers import friendRequestSerializer
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    async def disconnect(self, close_code):
        pass
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        username = text_data_json['username']
        # action = text_data_json['action']
        # if (action == "get_sent_requests")
        user = customuser.objects.get(username=username)
        sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
        request_list_ser = friendRequestSerializer(sent_requests_objs, many=True)
        sent_request_list = list(set(d['to_user'] for d in request_list_ser.data))
        sent_request_usernames = []
        for sent_request_id in sent_request_list:
            sent_request = customuser.objects.get(id=sent_request_id)
            sent_request_usernames.append(sent_request.username)
        await self.send(text_data=json.dumps({
        'sent_requests': sent_request_usernames
        }))
