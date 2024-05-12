from channels.generic.websocket import AsyncWebsocketConsumer
from chat.models import Friends
from myapp.models import customuser
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.tokens import TokenError, AccessToken
import json

class NotifConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		message = {
				'type': 'connected',
				'message': 'connection established'
			}
		try:
			decoded_token = AccessToken(self.scope['cookies']['token'])
			data = decoded_token.payload
			if not data.get('user_id'):
				return
			else:
				user = await sync_to_async(customuser.objects.filter(id=data['user_id']).first)()
				if user is not None:
					user.is_online = True
					await sync_to_async(user.save)()
					pass
				else:
					pass
		except TokenError as e:
			print("TOKEN ERROR")
		await self.send(json.dumps(message))
	
	async def receive(self, text_data):
		pass
	
	async def disconnect(self, code):
		try:
			decoded_token = AccessToken(self.scope['cookies']['token'])
			data = decoded_token.payload
			if not data.get('user_id'):
				return
			else:
				user = await sync_to_async(customuser.objects.filter(id=data['user_id']).first)()
				if user is not None:
					user.is_online = False
					await sync_to_async(user.save)()
					pass
				else:
					pass
		except TokenError as e:
			print("TOKEN ERROR")