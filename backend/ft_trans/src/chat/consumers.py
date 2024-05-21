from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser ###########
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message
import json

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		message = {
				'type': 'connected',
				'message': 'connection established'
			}
		self.channel_layer.group_add("tst",self.channel_layer)
		await self.send(json.dumps(message))

	async def receive(self, text_data):
		data = json.loads(text_data)
		print("recived: ", data)
		if data['type'] == 'join-channel':
			user_name = data['message']['user']
			room_name = data['message']['room_name']
			print("room name:",room_name)
			try:
				user = await self.get_user_by_name(user_name)
			except customuser.DoesNotExist:
				print("User not found:", user_name)
			room = await sync_to_async(Room.objects.filter(name=room_name).first)()
			if not room:
				print("room does not exist")
				room = await sync_to_async(Room.objects.create)(name=room_name)
			elif room:
				print("room already exists")
			membership = await sync_to_async(Membership.objects.filter(user=user, room=room).exists)()
			if membership:
				print("User already in the room")
				return
			await sync_to_async(Membership.objects.create)(user=user, room=room)
			print("the name for group name:",room_name)
			await self.channel_layer.group_add(room_name, self.channel_name)
			message = {
				'type': 'channel-created',
				'room' : {
					'id': room.id,
					'name': room.name,
				}
			}
			await self.send(json.dumps(message))
		elif data['type'] == 'message':
			room_id = data['data']['room_id']
			user_name = data['data']['sender']
			message = data['data']['message']
			room  = await sync_to_async(Room.objects.filter(id=room_id).get)()
			sender = await self.get_user_by_name(user_name)
			newMessage = await sync_to_async(Message.objects.create)(sender=sender,room=room, content=message)
			event = {
				'type': 'send_message',
				'message': newMessage,
			}
			await self.channel_layer.group_add(room.name, self.channel_name)
			await self.channel_layer.group_send(room.name, event)

	async def send_message(self, event):
		data = event['message']
		timestamp = data.timestamp.isoformat()
		message  = {
			'type':'newMessage',
			'data': {
				'id':data.id,
				'content':data.content,
				'sender' : data.sender.username,
				'date' : timestamp,
			}
		}
		await self.send(text_data=json.dumps(message))

	@sync_to_async
	def get_user_by_name(self, user_name):
		return customuser.objects.get(username=user_name)
