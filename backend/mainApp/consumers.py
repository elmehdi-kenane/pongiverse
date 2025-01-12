import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from . import gameConsumers
from . import gameMultiplayerConsumers, tournamentGameConsumer
from . import tournament_consumers
from channels.layers import get_channel_layer
from chat import chat_consumers
from asgiref.sync import sync_to_async
from myapp.models import customuser
from friends.models import Friendship
from mainApp.models import TournamentMembers
from .common import rooms, user_channels, tournament_rooms

async def get_friends(username):
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	return friends

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		if token:
			try:
				decoded_token = await sync_to_async(RefreshToken)(token)
				payload_data = await sync_to_async(lambda: decoded_token.payload)()
				user_id = payload_data.get('user_id')
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
				if user is not None:
					await self.accept()
					channel_namee = user_channels.get(user_id)
					if channel_namee:
						await channel_namee.close()
					user_channels[user_id] = self
				else:
					self.socket.close()
			except Exception as e:
				self.socket.close()

	async def receive(self, text_data):
		data = json.loads(text_data)

		if data['type'] == 'isPlayerInAnyRoom': await gameConsumers.isPlayerInAnyRoom(self, data, rooms, user_channels)
		elif data['type'] == 'dataBackUp': await gameConsumers.backUpData(self, data, rooms)
		elif data['type'] == 'join': await gameConsumers.joinRoom(self, data, rooms, user_channels)
		elif data['type'] == 'quit': await gameConsumers.quitRoom(self, data, rooms, user_channels)
		elif data['type'] == 'start': await gameConsumers.startPlayer(self, data, rooms)
		elif data['type'] == 'cancel': await gameConsumers.cancelPlayer(self, data, rooms)
		elif data['type'] == 'getOut': await gameConsumers.clearRoom1(self, data, rooms)
		elif data['type'] == 'OpponentIsOut': await gameConsumers.clearRoom2(self, data, rooms)
		elif data['type'] == 'isPlayerInRoom': await gameConsumers.validatePlayer(self, data, rooms, user_channels)
		elif data['type'] == 'playerChangedPage': await gameConsumers.changedPage(self, data, rooms)
		elif data['type'] == 'moveKey': await gameConsumers.move_paddle(self, data, rooms)
		elif data['type'] == 'moveMouse':await gameConsumers.move_mouse(self, data, rooms)
		elif data['type'] == 'userExited': await gameConsumers.user_exited(self, data, rooms)
		elif data['type'] == 'inviteFriendGame': await gameConsumers.invite_friend(self, data, rooms, user_channels)
		# elif data['type'] == 'acceptInvitation': await gameConsumers.accept_game_invite(self, data, rooms, user_channels)
		# elif data['type'] == 'refuseInvitation': await gameConsumers.refuse_game_invite(self, data, rooms, user_channels)
		elif data['type'] == 'createRoom': await gameConsumers.create_new_room(self, data, rooms, user_channels)
		elif data['type'] == 'checkingRoomCode': await gameConsumers.join_new_room(self, data, rooms, user_channels)
		elif data['type'] == 'joinMp': await gameMultiplayerConsumers.join_room_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'quitMp': await gameMultiplayerConsumers.quit_room_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'isPlayerInRoomMp': await gameMultiplayerConsumers.validate_player_mp(self, data, rooms, user_channels)    #### 2V2
		elif data['type'] == 'moveKeyMp': await gameMultiplayerConsumers.move_paddle_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'moveMouseMp':await gameMultiplayerConsumers.move_mouse_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'playerChangedPageMp': await gameMultiplayerConsumers.changed_page_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'playerMovedOutMp': await gameMultiplayerConsumers.moved_out_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'userExitedMp': await gameMultiplayerConsumers.user_exited_mp(self, data, rooms)    #### 2V2
		elif data['type'] == 'inviteFriendGameMp': await gameMultiplayerConsumers.invite_friend_mp(self, data, rooms, user_channels)
		# elif data['type'] == 'acceptInvitationMp': await gameMultiplayerConsumers.accept_game_invite_mp(self, data, rooms, user_channels)
		elif data['type'] == 'createRoomMp': await gameMultiplayerConsumers.create_new_room_mp(self, data, rooms, user_channels)
		elif data['type'] == 'checkingRoomCodeMp': await gameMultiplayerConsumers.join_new_room_mp(self, data, rooms, user_channels)
		elif data['type'] == 'createTournament': await tournament_consumers.create_tournament(self, data, user_channels)
		elif data['type'] == 'invite-friend': await tournament_consumers.invite_friend(self, data)
		elif data['type'] == 'accept-tournament-invitation': await tournament_consumers.accept_invite(self, data, user_channels)
		# elif data['type'] == 'deny-tournament-invitation': await tournament_consumers.deny_invite(self, data, user_channels)
		elif data['type'] == 'tournament-member-loged-again': await tournament_consumers.loged_again(self, data, user_channels)
		elif data['type'] == 'kick-player-out': await tournament_consumers.kick_player(self, data, user_channels)
		elif data['type'] == 'destroy-tournament': await tournament_consumers.destroy_tournament(self, data, user_channels)
		elif data['type'] == 'leave-tournament': await tournament_consumers.leave_tournament(self, data, user_channels)
		elif data['type'] == 'start-tournament': await tournament_consumers.start_tournament(self, data, user_channels)
		# elif data['type'] == 'Round-16-timer': await tournament_consumers.Round_16_timer(self, data)
		elif data['type'] == 'check-round-16-players': await tournament_consumers.check_round_16_players(self, data, user_channels)
		elif data['type'] == 'moveKeyTournamentGame': await tournamentGameConsumer.move_paddle_tournament_game(self, data, tournament_rooms)
		elif data['type'] == 'moveMouseTournamentGame':await tournamentGameConsumer.move_mouse_tournament_game(self, data, tournament_rooms)
		elif data['type'] == 'isPlayerInRoomTournamentGame': await tournamentGameConsumer.validatePlayerTournamentGame(self, data, tournament_rooms, user_channels)
		elif data['type'] == 'userExitedTournamentGame': await tournamentGameConsumer.user_exited_tournament_game(self, data, tournament_rooms)

	async def disconnect(self, close_code):
		await tournament_consumers.disconnected(self, user_channels)

	##################################### 1vs1 (GAME) #####################################

	async def gameReady(self, event):
		##print"======== HANDLING GAMEREADY EVENT ========")
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

	async def accepted_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accepted_invitation',
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
	async def hmed(self, event):
		await self.send(text_data=json.dumps({
			'type': 'hmed'
		}))

	async def youWinTheGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'youWinTheGame',
			'message': event['message']
		}))

	async def youLoseTheGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'youLoseTheGame'
		}))

	async def new_user_win(self, event):
		await self.send(text_data=json.dumps({
			'type': 'new_user_win',
			'message': event['message']
		}))

	async def connected_again_tourn(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again_tourn',
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


	async def user_kicked_from_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_kicked_from_tournament',
			'message' : event['message']
		}))

	async def tournament_started(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_started',
			'message' : event['message']
		}))

	async def tournament_started_by_user(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_started_by_user',
			'message' : event['message']
		}))

	async def warn_members(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'warn_members',
			'message' : event['message']
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
	async def blocked_friend(self, event):
		await self.send(text_data=json.dumps({
			'type': 'blocked-friend',
			'message': event['message']
		}))
	
	async def remove_friendship(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove-friendship',
			'message': event['message']
		}))