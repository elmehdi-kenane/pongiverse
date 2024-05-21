import json
from channels.generic.websocket import AsyncWebsocketConsumer
from . import game_consumers
from . import tournament_consumers
from chat import chat_consumers
from asgiref.sync import sync_to_async
from myapp.models import customuser
from chat.models import Friends


rooms = {}
tmp_rooms = {}
connected_channels = {}
class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.send(text_data=json.dumps({
			'type': 'connection_established',
			'message': 'You are now connected!'
		}))

	async def receive(self, text_data):
		data = json.loads(text_data)
		print('data recived: ',data)
		if data['type'] == 'isPlayerInAnyRoom': await game_consumers.isPlayerInAnyRoom(self, data, rooms)
		elif data['type'] == 'dataBackUp': await game_consumers.backUpData(self, data, rooms)
		elif data['type'] == 'join': await game_consumers.joinRoom(self, data, rooms)
		elif data['type'] == 'quit': await game_consumers.quitRoom(self, data, rooms)
		elif data['type'] == 'start': await game_consumers.startPlayer(self, data, rooms)
		elif data['type'] == 'cancel': await game_consumers.cancelPlayer(self, data, rooms)
		elif data['type'] == 'getOut': await game_consumers.clearRoom1(self, data, rooms)
		elif data['type'] == 'OpponentIsOut': await game_consumers.clearRoom2(self, data, rooms)
		elif data['type'] == 'isPlayerInRoom': await game_consumers.validatePlayer(self, data, rooms)
		elif data['type'] == 'playerChangedPage': await game_consumers.changedPage(self, data, rooms)
		elif data['type'] == 'moveKey': await game_consumers.move_paddle(self, data, rooms)
		elif data['type'] == 'moveMouse':await game_consumers.move_mouse(self, data, rooms)
		elif data['type'] == 'userExited': await game_consumers.user_exited(self, data, rooms)
		elif data['type'] == 'inviteFriend': await game_consumers.invite_friend(self, data, rooms, tmp_rooms)
		#chat
		elif data['type'] == 'join-channel': await chat_consumers.join_channel(self, data)
		elif data['type'] == 'message': await chat_consumers.message(self, data)
		#tournament
		elif data['type'] == 'connected':
			username = data["message"]["user"]
			user = await sync_to_async(customuser.objects.filter(username=username).first)()
			user_id = user.id
			connected_channels[user_id] = self.channel_name
			print(f"ALL THE USERS CHANNEL_NAMES : {connected_channels}")

	async def disconnect(self, close_code):
		# user_name = username
		await tournament_consumers.disconnected(self, connected_channels)
		# async def get_friends(username):
		# 	user = await sync_to_async(customuser.objects.filter(username=username).first)()
		# 	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
		# 	return friends
		# print(username)
		# friends = await get_friends(username)
		# for friend in friends:
		# 	namee = await sync_to_async(lambda:friend.friend.username)()
		# 	print(namee)
		# del user_sockets[user_id]
		# 	socket = user_sockets.get(friend.friend.id)
		# 	if socket:
		# 		await self.channel_layer.send(
		# 			socket,
		# 			{
		# 				'type': 'user_disconnected',
		# 				'user_id': user_id
		# 			}
		# 		)
		# await self.send(text_data=json.dumps({
		# 	'type': 'disconnected'
		# }))



	##################################### TOURNAMENT #####################################

	async def user_disconnected(self, event):
		user = event['user']
		await self.send(text_data=json.dumps({
			'type': 'user_disconnected',
			'username': user
		}))
	##################################### 1vs1 (GAME) #####################################

	async def gameReady(self, event):
		await self.send(text_data=json.dumps({
			'type': 'gameReady',
			'message': event['message']
		}))

	async def finishedGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'finishedGame',
			'message': event['message']
		}))

	async def abortedGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'abortedGame',
			'message': event['message']
		}))

	async def playersReady(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playersReady',
			'message': event['message']
		}))

	async def removeRoom(self, event):
		await self.send(text_data=json.dumps({
			'type': 'removeRoom',
			'message': event['message']
		}))

	async def leave_room(self, data):
		await self.channel_layer.group_discard(
			str(data['message']['roomID']),
			self.channel_name
		)

	async def startingGameSignal(self, room):
		await self.channel_layer.group_send(str(room['id']), {
				'type': 'startingGame',
				'message':'startingGame'
			}
		)

	async def startingGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'startingGame',
			'message': event['message']
		}))

	async def endingGame(self, room):
		await self.channel_layer.group_send(str(room['id']), {
			'type': 'endGame',
			'message': room
		})

	async def endGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'endGame',
			'message': event['message']
		}))

	async def updateGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'updateGame',
			'message': event['message']
		}))

	##################################### (CHAT) #####################################

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
