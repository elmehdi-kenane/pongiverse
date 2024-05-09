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
		# if len(self.scope['cookies']):
		print(f"IS TOKEN EXIST : {(self.scope['cookies']).get('token')}")
		if (self.scope['cookies']).get('token'):
			print(f"INSIIIIIIIIIIIIDEEEE : {self.scope}")
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
		# if len(self.scope['cookies']):
		# print(f"INSIIIIIIIIIIIIDEEEE : {self.scope}")
		if (self.scope['cookies']).get('token'):
			try:
				decoded_token = AccessToken(self.scope['cookies']['token'])
				data = decoded_token.payload
				if not data.get('user_id'):
					return
				else:
					user = await sync_to_async(customuser.objects.filter(id=data['user_id']).first)()
					# print(f'USER GET OUT OF THE APP {user}')
					if user is not None:
						user.is_online = False
						await sync_to_async(user.save)()
						pass
					else:
						pass
			except TokenError as e:
				print("TOKEN ERROR")