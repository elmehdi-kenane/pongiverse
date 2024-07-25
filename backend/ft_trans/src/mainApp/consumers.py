import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from . import gameConsumers
from . import gameMultiplayerConsumers
from . import tournament_consumers
from channels.layers import get_channel_layer
from chat import chat_consumers
from asgiref.sync import sync_to_async
from myapp.models import customuser
from chat.models import Friends
import socket

# from mainApp.models import Match
# from mainApp.models import ActiveMatch
# from mainApp.models import NotifPlayer
# from mainApp.models import GameNotifications
# -model- .objects.all().delete()

# from myapp.models import customuser
# all = customuser.objects.all()
# for user in all:
# 	user.is_playing = False
# 	user.save()

rooms = {}
user_channels = {}

async def get_friends(username):
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
	return friends

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# self.address = '127.0.0.1'
		# self.port = 8000
		# self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		# self.socket.connect((self.address, self.port))
		# await self.accept()
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('token')
		decoded_token = AccessToken(token)
		payload_data = decoded_token.payload
		user_id = payload_data.get('user_id')
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		if user is not None:
			await self.accept()
			username = user.username
			tmp_username = username
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
				if channel_name and friend_is_online and not user.is_playing:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'connected_again',
							'message': {
									'user': username,
									'userInfos': {
										'id': user.id,
										'name': user.username,
										'level': 2,
										'image': user.avatar.path,
									}
								}
						}
					)
				if channel_name and friend_is_online:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'connected_again_tourn',
							'message': {
									'user': username,
									'userInfos': {
										'id': user.id,
										'name': user.username,
										'level': 2,
										'image': user.avatar.path,
									}
								}
						}
					)
			for username, channel_name in user_channels.items():
				user = await sync_to_async(customuser.objects.filter(username=username).first)()
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'connected_again_tourn',
						'message': {
							'user': tmp_username,
							'userInfos': {
								'id': user.id,
								'name': user.username,
								'level': 2,
								'image': user.avatar.path,
							}
						}
					}
				)
		else:
			print("YESSSSSSSSSSS")
			# self.socket.close()

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
		elif data['type'] == 'inviteFriendGame': await game_consumers.invite_friend(self, data, rooms, user_channels)
		elif data['type'] == 'acceptInvitation': await game_consumers.accept_game_invite(self, data, rooms, user_channels)
		elif data['type'] == 'refuseInvitation': await game_consumers.refuse_game_invite(self, data, rooms, user_channels)
		elif data['type'] == 'createRoom': await game_consumers.create_new_room(self, data, rooms, user_channels)
		elif data['type'] == 'checkingRoomCode': await game_consumers.join_new_room(self, data, rooms, user_channels)
		elif data['type'] == 'joinMp': await gameMultiplayerConsumers.join_room_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'quitMp': await gameMultiplayerConsumers.quit_room_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'isPlayerInRoomMp': await gameMultiplayerConsumers.validate_player_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'moveKeyMp': await gameMultiplayerConsumers.move_paddle_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'moveMouseMp':await gameMultiplayerConsumers.move_mouse_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'playerChangedPageMp': await gameMultiplayerConsumers.changed_page_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'playerMovedOutMp': await gameMultiplayerConsumers.moved_out_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'userExitedMp': await gameMultiplayerConsumers.user_exited_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'inviteFriendGameMp': await gameMultiplayerConsumers.invite_friend_mp(self, data, rooms, user_channels)
		elif data['type'] == 'acceptInvitationMp': await gameMultiplayerConsumers.accept_game_invite_mp(self, data, rooms, user_channels)
		elif data['type'] == 'createRoomMp': await gameMultiplayerConsumers.create_new_room_mp(self, data, rooms, user_channels)
		elif data['type'] == 'checkingRoomCodeMp': await gameMultiplayerConsumers.join_new_room_mp(self, data, rooms, user_channels)
		#chat
		elif data['type'] == 'createChatRoom': await chat_consumers.create_chat_room(self, data)
		elif data['type'] == 'joinChatRoom': await chat_consumers.join_chat_room(self, data)
		elif data['type'] == 'leaveRoom': await chat_consumers.leave_chat_room(self, data, user_channels)
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
		###
		elif data['type'] == 'createTournament': await tournament_consumers.create_tournament(self, data, user_channels)
		elif data['type'] == 'invite-friend': await tournament_consumers.invite_friend(self, data, user_channels)
		elif data['type'] == 'accept-tournament-invitation': await tournament_consumers.accept_invite(self, data, user_channels)
		elif data['type'] == 'deny-tournament-invitation': await tournament_consumers.deny_invite(self, data, user_channels)
		elif data['type'] == 'tournament-member-loged-again': await tournament_consumers.loged_again(self, data, user_channels)
		elif data['type'] == 'kick-player-out': await tournament_consumers.kick_player(self, data, user_channels)
		elif data['type'] == 'destroy-tournament': await tournament_consumers.destroy_tournament(self, data, user_channels)
		elif data['type'] == 'leave-tournament': await tournament_consumers.leave_tournament(self, data, user_channels)
		elif data['type'] == 'start-tournament': await tournament_consumers.start_tournament(self, data, user_channels)
		elif data['type'] == 'Round-16-timer': await tournament_consumers.Round_16_timer(self, data, user_channels)
		elif data['type'] == 'check-round-16-players': await tournament_consumers.check_round_16_players(self, data, user_channels)

	async def disconnect(self, close_code):
		await tournament_consumers.disconnected(self, user_channels)

	##################################### 1vs1 (GAME) #####################################

	async def gameReady(self, event):
		await self.send(text_data=json.dumps({
			'type': 'gameReady',
			'message': event['message']
		}))

	async def playerOut(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playerOut',
			'message': event['message']
		}))

	async def gameOnHold(self, event):
		await self.send(text_data=json.dumps({
			'type': 'gameOnHold',
			'message': event['message']
		}))

	async def playersInfos(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playersInfos',
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

	async def creatorOut(self, event):
		await self.send(text_data=json.dumps({
			'type': 'creatorOut',
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

	async def tournament_created(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_created',
			'message' : event['message']
		}))

	async def connected_again(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again',
			'message': event['message']
		}))
	##################################### (CHAT) #####################################
	async def broadcast_message(self, event):
		await self.send(text_data=json.dumps(event['data']))
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
		print(message)
		await self.send(text_data=json.dumps(message))




	# async def receiveFriendGame(self, event):
	# 	await self.send(text_data=json.dumps({
	# 		'type': 'receiveFriendGame',
	# 		'message': event['message']
	# 	}))

	# async def sendPlayerNo(self, event):
	# 	await self.send(text_data=json.dumps({
	# 		'type': 'playerNo',
	# 		'message': event['message']
	# 	}))

	# async def playingStatus(self, event):
	# 	await self.send(text_data=json.dumps({
	# 		'type': 'playingStatus',
	# 		'message': event['message']
	# 	}))

	# async def goToGamingPage(self, event):
	# 	await self.send(text_data=json.dumps({
	# 		'type': 'goToGamingPage',
	# 		'message': event['message']
	# 	}))



# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         await self.send(text_data=json.dumps({
#             'type': 'connection_established',
#             'message': 'You are now connected!'
#         }))
    
#     async def receive(self, text_data):
#         data = json.loads(text_data)

#         if data['type'] == 'handShake': user_channels[data['message']['user']] = self.channel_name
#         elif data['type'] == 'isPlayerInAnyRoom': await game_consumers.isPlayerInAnyRoom(self, data, rooms, user_channels)
#         elif data['type'] == 'dataBackUp': await game_consumers.backUpData(self, data, rooms)
#         elif data['type'] == 'join': await game_consumers.joinRoom(self, data, rooms, user_channels)
#         elif data['type'] == 'quit': await game_consumers.quitRoom(self, data, rooms, user_channels)
#         elif data['type'] == 'start': await game_consumers.startPlayer(self, data, rooms)
#         elif data['type'] == 'cancel': await game_consumers.cancelPlayer(self, data, rooms)
#         elif data['type'] == 'getOut': await game_consumers.clearRoom1(self, data, rooms)
#         elif data['type'] == 'OpponentIsOut': await game_consumers.clearRoom2(self, data, rooms)
#         elif data['type'] == 'isPlayerInRoom': await game_consumers.validatePlayer(self, data, rooms, user_channels)
#         elif data['type'] == 'playerChangedPage': await game_consumers.changedPage(self, data, rooms)
#         elif data['type'] == 'moveKey': await game_consumers.move_paddle(self, data, rooms)
#         elif data['type'] == 'moveMouse':await game_consumers.move_mouse(self, data, rooms)
#         elif data['type'] == 'userExited': await game_consumers.user_exited(self, data, rooms)
#         elif data['type'] == 'inviteFriend': await game_consumers.invite_friend(self, data, rooms, tmp_rooms)
#         elif data['type'] == 'acceptInvitation': await game_consumers.accept_game_invite(self, data, rooms, user_channels)
#         #chat
#         elif data['type'] == 'join-channel': await chat_consumers.join_channel(self, data)
#         elif data['type'] == 'message': await chat_consumers.message(self, data)
#         elif data['type'] == 'inviteFriendGame': await game_consumers.invite_friend(self, data, rooms, tmp_rooms, user_channels)
#         elif data['type'] == 'directMessages': await game_consumers.invite_friend(self, data, rooms, tmp_rooms, user_channels)

#     ##################################### 1vs1 (GAME) #####################################

#     async def gameReady(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'gameReady',
#             'message': event['message']
#         }))

#     async def finishedGame(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'finishedGame',
#             'message': event['message']
#         }))

#     async def abortedGame(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'abortedGame',
#             'message': event['message']
#         }))
    
#     async def playersReady(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'playersReady',
#             'message': event['message']
#         }))

#     async def removeRoom(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'removeRoom',
#             'message': event['message']
#         }))

#     async def leave_room(self, data):
#         await self.channel_layer.group_discard(
#             str(data['message']['roomID']),
#             self.channel_name
#         )

#     async def startingGameSignal(self, room):
#         await self.channel_layer.group_send(str(room['id']), {
#                 'type': 'startingGame',
#                 'message':'startingGame'
#             }
#         )

#     async def startingGame(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'startingGame',
#             'message': event['message']
#         }))

#     async def endingGame(self, room):
#         await self.channel_layer.group_send(str(room['id']), {
#             'type': 'endGame',
#             'message': room
#         })

#     async def endGame(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'endGame',
#             'message': event['message']
#         }))

#     async def updateGame(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'updateGame',
#             'message': event['message']
#         }))

	async def connected_again_tourn(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again_tourn',
			'message': event['message']
		}))

	async def invited_to_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'invited_to_tournament',
			'message': event['message']
		}))

	async def accepted_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accepted_invitation',
			'message': event['message']
		}))
	async def user_kicked_out(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_kicked_out',
			'message' : event['message']
		}))

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'leave_tournament',
			'message' : event['message']
		}))

	async def tournament_destroyed(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_destroyed'
		}))
	async def friend_created_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'friend_created_tournament',
			'message' : event['message']
		}))

	async def friend_distroyed_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'friend_distroyed_tournament',
			'message' : event['message']
		}))

	async def tournament_created_by_user(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_created_by_user',
			'message' : event['message']
		}))

	async def tournament_destroyed_by_user(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_destroyed_by_user',
			'message' : event['message']
		}))

	async def user_leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_leave_tournament',
			'message' : event['message']
		}))

	async def user_join_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_join_tournament',
			'message' : event['message']
		}))

	async def user_kicked_from_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_kicked_from_tournament',
			'message' : event['message']
		}))
	async def tournament_started(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_started',
		}))
	async def warn_members(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'warn_members',
		}))

	async def user_eliminated(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_eliminated',
		}))

	async def you_and_your_user(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'you_and_your_user',
			'message' : event['message']
		}))
