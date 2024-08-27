from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser ###########
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
import json
from . import chat_consumers
from datetime import datetime

user_channels = {}

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('token')
		decoded_token = AccessToken(token)
		payload_data = decoded_token.payload
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
			print("USER_CHANNEL_NAMES", self.channel_name)
			await self.send(json.dumps(message))

	async def receive(self, text_data):
		data = json.loads(text_data)
		print("recived: ", data)
		if data['type'] == 'leaveRoom': await chat_consumers.leave_chat_room(self, data, user_channels)
		elif data['type'] == 'changeRoomName': await chat_consumers.change_chat_room_name(self, data, user_channels)
		elif data['type'] == 'changeRoomAvatar': await chat_consumers.change_chat_room_avatar(self, data)
		elif data['type'] == 'addUserChannelGroup': await chat_consumers.add_user_channel_group(self, data)
		elif data['type'] == 'deleteChatRoom': await chat_consumers.detete_char_room(self, data, user_channels)
		elif data['type'] == 'message': await chat_consumers.message(self, data)
		elif data['type'] == 'directMessage': await chat_consumers.direct_message(self, data, user_channels)
		elif data['type'] == 'addRoomMemberAdmin' : await chat_consumers.add_chat_room_admin(self, data, user_channels)
		elif data['type'] == 'inviteChatRoomMember' : await chat_consumers.invite_member_chat_room (self, data, user_channels)
		elif data['type'] == 'roomInvitationAccepted' : await chat_consumers.chat_room_accept_invitation(self, data)
		elif data['type'] == 'roomInvitationCancelled' : await chat_consumers.chat_room_invitation_declined(self, data)
	
	async def disconnect(self, close_code):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('token')
		decoded_token = AccessToken(token)
		payload_data = decoded_token.payload
		user_id = payload_data.get('user_id')
		if user_id:
			user_channels_name = user_channels.get(user_id)
			print("user channels before the filter: ", user_channels_name)
			filtered_channels_name = [channel_name for channel_name in user_channels_name if channel_name != self.channel_name]
			print("user channels in the filter: ", filtered_channels_name)
			user_channels[user_id] = filtered_channels_name
			print("user channels after the filter: ", user_channels.get(user_id))

	async def broadcast_message(self, event):
		await self.send(text_data=json.dumps(event['data']))
	
	async def send_message(self, event):
		data = event['message']
		timestamp = data.timestamp.isoformat()
		dt = datetime.fromisoformat(timestamp)
		formatted_time = dt.strftime('%Y/%m/%d AT %I:%M %p')
		message  = {
			'type':'newMessage',
			'data': {
				'id':data.id,
				'content':data.content,
				'sender' : data.sender.username,
				'date' : formatted_time,
			}
		}
		await self.send(text_data=json.dumps(message))
	
	async def newRoomJoin(self, event):
		data = event['data']
		print(data)
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
				'reciver': data['reciver'],
				'content': data['message'],
			}
		}
		await self.send(text_data=json.dumps(message))
