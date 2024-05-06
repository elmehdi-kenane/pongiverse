from channels.generic.websocket import AsyncWebsocketConsumer
from chat.models import Friends
from asgiref.sync import sync_to_async
import json

class NotifConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        message = {
                'type': 'connected',
                'message': 'connection established'
            }
        await self.send(json.dumps(message))
    
    async def receive(self, text_data):
        pass