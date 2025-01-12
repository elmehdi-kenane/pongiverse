from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser ###########
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
import json
from . import chat_consumers
from datetime import datetime
from .common import user_channels
from .models import Membership

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		if token :
			try:
				decoded_token = await sync_to_async(RefreshToken)(token)
				payload_data = await sync_to_async(lambda: decoded_token.payload)()
				user_id = payload_data.get('user_id')
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
				if user is not None:
					await self.accept()
					userId = user.id
					if user_channels.get(userId):
						user_channels[userId].append(self.channel_name)
					else:
						user_channels[userId] = [self.channel_name]
					message = {
							'type': 'connected',
							'message': 'chat connection established'
						}
					await self.send(json.dumps(message))
				else:
					self.socket.close()
			except Exception as e:
				self.socket.close()

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'addUserChannelGroup': await chat_consumers.add_user_channel_group(self, data)
		elif data['type'] == 'message': await chat_consumers.message(self, data)
		elif data['type'] == 'directMessage': await chat_consumers.direct_message(self, data, user_channels)
		elif data['type'] == 'addRoomMemberAdmin' : await chat_consumers.add_chat_room_admin(self, data, user_channels)
		elif data['type'] == 'inviteChatRoomMember' : await chat_consumers.invite_member_chat_room (self, data, user_channels)
		elif data['type'] == 'roomInvitationCancelled' : await chat_consumers.chat_room_invitation_declined(self, data)
		elif data['type'] == 'addChatRoom' : await chat_consumers.add_member_to_chat_room(self, data, user_channels)
	
	async def disconnect(self, close_code):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		if token:
			try:
				decoded_token = await sync_to_async(RefreshToken)(token)
				payload_data = await sync_to_async(lambda: decoded_token.payload)()
				user_id = payload_data.get('user_id')
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
				if user is not None:
					memberships = await sync_to_async(list)(Membership.objects.filter(user=user))
					for membership in memberships:
						room_id = await sync_to_async(lambda: membership.room.id)()
						await self.channel_layer.group_discard(f"chat_room_{room_id}", self.channel_name)
				if user_id:
					user_channels_name = user_channels.get(user_id)
					filtered_channels_name = [channel_name for channel_name in user_channels_name if channel_name != self.channel_name]
					user_channels[user_id] = filtered_channels_name
			except Exception as e:
				pass

	async def broadcast_message(self, event):
		await self.send(text_data=json.dumps(event['data']))
	

	async def send_message(self, event):
		data = event['data']
		message  = {
			'type':'newMessage',
			'data': data
		}
		await self.send(text_data=json.dumps(message))
	
	async def newRoomJoin(self, event):
		data = event['data']
		message  = {
			'type':'newRoomJoin',
			'room' : data
		}
		await self.send(text_data=json.dumps(message))
	
	async def send_direct(self, event):
		data = event['data']
		message = {
			'type' : 'newDirect',
			'data' : {
				'sender': data['sender'],
				'receiver': data['receiver'],
				'content': data['message'],
				'date' :  data['date'],
				'senderId' : data['senderId'],
				'receiverId' : data['receiverId'],
				'senderAvatar' : data['senderAvatar'],

			}
		}
		await self.send(text_data=json.dumps(message))

	async def you_are_blocked(self, event):
		data = event['message']
		message = {
			'type' : 'youAreBlocked',
			'data' : data
		}
		await self.send(text_data=json.dumps(message))
