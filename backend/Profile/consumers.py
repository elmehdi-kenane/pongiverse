# from channels.generic.websocket import AsyncWebsocketConsumer
# from friends.models import Friendship
# from myapp.models import customuser
# from asgiref.sync import sync_to_async
# from rest_framework_simplejwt.tokens import TokenError, AccessToken
# import json

# class NotifConsumer(AsyncWebsocketConsumer):
# 	async def connect(self):
# 		await self.accept()
# 		# message = {
# 		# 		'type': 'connected',
# 		# 		'message': 'connection established'
# 		# 	}
# 		if (self.scope['cookies']).get('access_token'):
# 			# ##print"TOKEEEEEEEEEEN EXISTTTTTTTT")
# 			try:
# 				decoded_token = AccessToken(self.scope['cookies']['token'])
# 				data = decoded_token.payload
# 				if not data.get('user_id'):
# 					return
# 				else:
# 					user = await sync_to_async(customuser.objects.filter(id=data['user_id']).first)()
# 					if user is not None:
# 						user.is_online = True
# 						await sync_to_async(user.save)()
# 						await self.channel_layer.group_add(user.username + "_friends", self.channel_name)
# 			except TokenError as e:
# 				##print"TOKEN ERROR")
# 		# await self.send(json.dumps(message))
	
# 	async def receive(self, text_data):
# 		data = json.loads(text_data)

# 		# if data['type'] == 'inviteFriend':
# 		# 	await self.invite_friend(data['message'])

# 	# async def invite_friend(self, message):

	
# 	async def disconnect(self, code):
# 		# ##printf"DISCONNECTED : {self.scope}")
# 		if (self.scope['cookies']).get('access_token'):
# 			try:
# 				decoded_token = AccessToken(self.scope['cookies']['token'])
# 				data = decoded_token.payload
# 				if not data.get('user_id'):
# 					return
# 				else:
# 					user = await sync_to_async(customuser.objects.filter(id=data['user_id']).first)()
# 					if user is not None:
# 						user.is_online = False
# 						await sync_to_async(user.save)()
# 			except TokenError as e:
# 				#print"TOKEN ERROR")
# # 