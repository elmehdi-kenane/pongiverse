import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from . import game_consumers
from . import tournament_consumers
from channels.layers import get_channel_layer
from chat import chat_consumers
from asgiref.sync import sync_to_async
from myapp.models import customuser
from chat.models import Friends

rooms = {}
user_channels = {}

async def get_friends(username):
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
	return friends

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('token')
		decoded_token = AccessToken(token)
		payload_data = decoded_token.payload
		user_id = payload_data.get('user_id')
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		username = user.username
		user.is_online = True
		await sync_to_async(user.save)()
		user_channels[username] = self.channel_name
		channel_layer = get_channel_layer()
		friends = await sync_to_async(list)(Friends.objects.filter(user=user))
		print(f"ALL THE USERS CHANNEL_NAMES : {user_channels}")
		for friend in friends:
			friend_username = await sync_to_async(lambda: friend.friend.username)()
			friend_is_online = await sync_to_async(lambda: friend.friend.is_online)()
			channel_name = user_channels.get(friend_username)
			print(f"USER CHANNEL ON CONNECT IS : {channel_name}")
			if channel_name and friend_is_online:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'connected_again',
						# 'user': username
						'message': {
								'user': username,
								'is_playing': False,
								'userInfos': {
									'id': user.id,
									'name': user.username,
									'level': 2,
									'image': user.avatar.path
									# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
								}
							}
					}
				)

	async def receive(self, text_data):
		data = json.loads(text_data)

		if data['type'] == 'isPlayerInAnyRoom': await game_consumers.isPlayerInAnyRoom(self, data, rooms, user_channels)
		elif data['type'] == 'dataBackUp': await game_consumers.backUpData(self, data, rooms)
		elif data['type'] == 'join': await game_consumers.joinRoom(self, data, rooms, user_channels)
		elif data['type'] == 'quit': await game_consumers.quitRoom(self, data, rooms, user_channels)
		elif data['type'] == 'start': await game_consumers.startPlayer(self, data, rooms)
		elif data['type'] == 'cancel': await game_consumers.cancelPlayer(self, data, rooms)
		elif data['type'] == 'getOut': await game_consumers.clearRoom1(self, data, rooms)
		elif data['type'] == 'OpponentIsOut': await game_consumers.clearRoom2(self, data, rooms)
		elif data['type'] == 'isPlayerInRoom': await game_consumers.validatePlayer(self, data, rooms, user_channels)
		elif data['type'] == 'playerChangedPage': await game_consumers.changedPage(self, data, rooms)
		elif data['type'] == 'moveKey': await game_consumers.move_paddle(self, data, rooms)
		elif data['type'] == 'moveMouse':await game_consumers.move_mouse(self, data, rooms)
		elif data['type'] == 'userExited': await game_consumers.user_exited(self, data, rooms)
		elif data['type'] == 'inviteFriendGame': await game_consumers.invite_friend(self, data, rooms, tmp_rooms, user_channels)
		elif data['type'] == 'acceptInvitation': await game_consumers.accept_game_invite(self, data, rooms, user_channels)
		elif data['type'] == 'refuseInvitation': await game_consumers.refuse_game_invite(self, data, rooms, user_channels)
		elif data['type'] == 'createRoom': await game_consumers.create_new_room(self, data, rooms, user_channels)
		elif data['type'] == 'checkingRoomCode': await game_consumers.join_new_room(self, data, rooms, user_channels)

	async def disconnect(self, close_code):
		await tournament_consumers.disconnected(self, user_channels)

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

	async def receiveFriendGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receiveFriendGame',
			'message': event['message']
		}))

	async def sendPlayerNo(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playerNo',
			'message': event['message']
		}))

	async def playingStatus(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playingStatus',
			'message': event['message']
		}))

	async def goToGamingPage(self, event):
		await self.send(text_data=json.dumps({
			'type': 'goToGamingPage',
			'message': event['message']
		}))

	##################################### Tournament (GAME) #####################################

	async def user_disconnected(self, event):
		await self.send(text_data=json.dumps({
			'type': 'user_disconnected',
			'message': event['message']
		}))

	async def connected_again(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again',
			'message': event['message']
		}))
