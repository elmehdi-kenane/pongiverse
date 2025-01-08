import math
import json
import random
import base64
import asyncio
import datetime
from friends.models import Friendship
from myapp.models import customuser
from asgiref.sync import sync_to_async
from .gameMultiplayerConsumers import waited_game
from .models import Match, ActiveMatch, PlayerState, NotifPlayer, GameNotifications, MatchStatistics, UserMatchStatics
from Notifications.common import notifs_user_channels
from .common import tournaments
import os

async def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username and member['is_eliminated'] == False and (tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)):
				return tournament_id
	return 0

async def isPlayerInAnyRoom(self, data, rooms, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	message = data['message']
	userRoom = {
		key: value
		for key, value in rooms.items()
		if (
			((len(value.get('players')) == 2 and
			(value['players'][0].get('user') == message['user'] or
			value['players'][1].get('user') == message['user'])) or
			(len(value.get('players')) == 4 and
			((value['players'][0].get('user') == message['user'] and value['players'][0]['inside'] == True) or
			(value['players'][1].get('user') == message['user'] and value['players'][1]['inside'] == True) or
			(value['players'][2].get('user') == message['user'] and value['players'][2]['inside'] == True) or
			(value['players'][3].get('user') == message['user'] and value['players'][3]['inside'] == True))))
		)
	}
	if userRoom:
		value = list(userRoom.values())[0]
		await self.channel_layer.group_add(str(value['id']), self.channel_name)
		if ((len(value['players']) == 2 and value['status'] == 'started') or
			(len(value['players']) == 4 and value['status'] == 'started')):
			await self.send(text_data=json.dumps({
				'type': 'roomAlreadyStarted',
				'message': {
					'roomID': value['id'],
					'mode': value['mode']
				}
			}))
		elif ((len(value['players']) == 2 and value['status'] == 'notStarted') or
			(len(value['players']) == 4 and value['status'] == 'notStarted')):
			user1 = await sync_to_async(customuser.objects.filter(username=value['players'][0]['user']).first)()
			user2 = await sync_to_async(customuser.objects.filter(username=value['players'][1]['user']).first)()
			channel_1 = user_channels.get(user1.id).channel_name  if user1.id in user_channels else None
			await self.channel_layer.send(channel_1, {
				'type': 'sendPlayerNo',
				'message': {
					'playerNo': 1,
					'id': value['id']
				}
			})
			channel_2 = user_channels.get(user2.id).channel_name  if user2.id in user_channels else None
			await self.channel_layer.send(channel_2, {
				'type': 'sendPlayerNo',
				'message': {
					'playerNo': 2,
					'id': value['id']
				}
			})
			if len(value['players']) == 4:
				user3 = await sync_to_async(customuser.objects.filter(username=value['players'][2]['user']).first)()
				user4 = await sync_to_async(customuser.objects.filter(username=value['players'][3]['user']).first)()
				channel_3 = user_channels.get(user3.id).channel_name  if user3.id in user_channels else None
				await self.channel_layer.send(channel_3, {
					'type': 'sendPlayerNo',
					'message': {
						'playerNo': 3,
						'id': value['id']
					}
				})
				channel_4 = user_channels.get(user4.id).channel_name  if user4.id in user_channels else None
				await self.channel_layer.send(channel_4, {
					'type': 'sendPlayerNo',
					'message': {
						'playerNo': 4,
						'id': value['id']
					}
				})
			users = []
			player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
			player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=user2).first)()
			users.append({
				'name': user1.username,
				'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}",
				'level': player1_match_statistics.level
			})
			users.append({
				'name': user2.username,
				'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user2.avatar.url}",
				'level': player2_match_statistics.level
			})
			if len(value['players']) == 4:
				player3_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=user3).first)()
				player4_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=user4).first)()
				users.append({
					'name': user3.username,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user3.avatar.url}",
					'level': player3_match_statistics.level
				})
				users.append({
					'name': user4.username,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user4.avatar.url}",
					'level': player4_match_statistics.level
				})
			# ##printf"ALL USERS ARE : {len(users)}")
			asyncio.create_task(set_game(self, value, users))

	else:
		tournament_id = await is_user_joining_tournament(message['user'])
		if tournament_id:
			await self.send(text_data=json.dumps({
				'type': 'roomAlreadyStarted',
				'message': {
					'roomID': 0,
					'mode': 'tournament'
				}
			}))
			return
		player = await sync_to_async(customuser.objects.filter(username=message['user']).first)()
		active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
		for active_match in active_matches:
			playerInRoom = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=player).first)()
			if playerInRoom:
				await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
				if active_match.mode == message['mode'] and active_match.room_type == message['type']:
					# ##print"PLAYER FOUND IN A ROOM OF ONE (1) PLAYER")
					creator = None
					if await sync_to_async(lambda: active_match.creator)():
						username = await sync_to_async(lambda: active_match.creator.username)()
						if username == message['user']:
							creator = True
						else:
							creator = False
					await self.send(text_data=json.dumps({
						'type': 'alreadySearching',
						'message': {
							'id': active_match.room_id,
							'playerNo': playerInRoom.playerNo,
							'creator': creator
						}
					}))
					if active_match.mode == '2vs2':
						player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
						users = []
						for player_state in player_states:
							player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
							player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
							users.append({
								'name': player.username,
								'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
								'level': player_match_statistics.level
							})
						asyncio.create_task(waited_game(self, active_match.room_id, users))
					return
				else:
					playersInRoom = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
					if len(playersInRoom) == 1:
						await sync_to_async(active_match.delete)()
						##printf"is_player is false : {player.username}")
						player.is_playing = False
						await sync_to_async(player.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player))
						for friend in friends:
							friend_id = await sync_to_async(lambda: friend.friend.id)()
							friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
							if friend_channel:
								await self.channel_layer.send(friend_channel.channel_name, {
									'type': 'playingStatus',
									'message': {
										'user': player.username,
										'is_playing': False,
										'userInfos': {
											'id': player.id,
											'name': player.username,
											'level': 2,
											'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}"
										}
									}
								})
					elif len(playersInRoom) > 1:
						player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=player).first)()
						player_no = player_state.playerNo
						await sync_to_async(player_state.delete)()
						player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
						if len(player_states):
							users = []
							for player_state in player_states:
								if player_state.playerNo > player_no:
									player_state_name = await sync_to_async(lambda: player_state.player.username)()
									player_state_channel = user_channels[player_state_name].channel_name
									await self.channel_layer.send(player_state_channel, {
										'type': 'sendPlayerNo',
										'message': {
											'playerNo': (player_state.playerNo - 1),
											'id': active_match.room_id
										}
									})
									player_state.playerNo -= 1
									await sync_to_async(player_state.save)()
								player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
								player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
								users.append({
									'name': player.username,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
									'level': player_match_statistics.level
								})
							asyncio.create_task(waited_game(self, active_match.room_id, users))
									# await sync_to_async(playerInRoom.delete)()
						##printf"is_player is false")
						player.is_playing = False
						await sync_to_async(player.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player))
						for friend in friends:
							friend_id = await sync_to_async(lambda: friend.friend.id)()
							friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
							if friend_channel:
								await self.channel_layer.send(friend_channel, {
									'type': 'playingStatus',
									'message': {
										'user': player.username,
										'is_playing': False,
										'userInfos': {
											'id': player.id,
											'name': player.username,
											'level': 2,
											'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}"
										}
									}
								})
						notify_player = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=player).first)()
						if notify_player:
							await sync_to_async(notify_player.delete)()
					await self.send(text_data=json.dumps({
						'type': 'noRoomFound',
						'message': 'noRoomFound'
					}))
					return
		await self.send(text_data=json.dumps({
			'type': 'noRoomFound',
			'message': 'noRoomFound'
		}))

#### adding the user to any room he is already join to if his socket changed ##### =====> /play/:id
async def backUpData(self, data, rooms):
	# ##printf"I REACH THE DESTINATION : ${rooms}")
	if rooms:
		for key, roomValue in rooms.items():
			if ((len(roomValue['players']) == 2 and (roomValue['players'][0]['user'] == data['message']['user'] or roomValue['players'][1]['user'] == data['message']['user']) and roomValue['status'] == 'started') or (len(roomValue['players']) == 4 and (roomValue['players'][0]['user'] == data['message']['user'] or roomValue['players'][1]['user'] == data['message']['user'] or roomValue['players'][2]['user'] == data['message']['user'] or roomValue['players'][3]['user'] == data['message']['user']) and roomValue['status'] == 'started')):
				# ##print"FOUND THE ROOM")
				await self.channel_layer.group_add(str(roomValue['id']), self.channel_name)
				return
	player = await sync_to_async(customuser.objects.get)(username=data['message']['user'])
	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	for active_match in active_matches:
		player_ready = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=player).first)()
		# ##printf'SEARCHING FOR BACKUP ROOMS')
		if player_ready:
			# ##printf'FOUND THIS PLAYER IN AN ACTIVE MATCH {player.username}')
			await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
			return


##### join to a an existing room or a new one ##### =====> /game
@sync_to_async
def generate_unique_room_id(self):
	while True:
		room_id = random.randint(1000000, 1000000000)  # Adjust the range as needed
		if not ActiveMatch.objects.filter(room_id=room_id).exists() and not Match.objects.filter(id=room_id).exists():
			return room_id

@sync_to_async
def set_to_true(self, user):
	user.is_playing = True
	user.save()

async def joinRoom(self, data, rooms, user_channels):
	room = None
	isEmpty = True
	# global rooms
	ip_address = os.getenv("IP_ADDRESS")
	# ##print"inside join")
	# ##printf"INSIDDDDE THE JOINNN ROOOM")
	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	for active_match in active_matches:
		player_state_count = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
		if player_state_count == 1 and active_match.mode == '1vs1' and active_match.room_type == 'random':
			player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match).first)()
			player_username = await sync_to_async(lambda: player_state.player.username)()
			if player_username == data['message']['user']:
				return
			isEmpty = False
			user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
			await set_to_true(self, user)
			##printf"PLAYER 1 IS : {user.username} {user.is_playing}")
			# user.is_playing = True
			# await sync_to_async(user.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
				# ##printfriend_channel)
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'playingStatus',
						'message': {
							'user': user.username,
							'is_playing': True
						}
					})
			await sync_to_async(PlayerState.objects.create)(
				active_match = active_match,
				player = user,
				state = 'inactive',
				playerNo = 2,
				paddleX = 685,
				paddleY = 165,
				score = 0
			)
			player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
			players = []
			users = []
			for player_state in player_states:
				player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
				player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
				players.append({
					'user': player.username,
					'state': player_state.state,
					'playerNo': player_state.playerNo,
					'paddleX': player_state.paddleX,
					'paddleY': player_state.paddleY,
					'score': player_state.score,
					'status': '',
					'hit': 0, ####### added
					'self_scored': 0, ####### added
					'tmp_scored': 0 ####### added
				})
				users.append({
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
					'level': player_match_statistics.level
				})
			room = {
				'id': active_match.room_id,
				'players': players,
				'ball': {
					'ballX': active_match.ballX,
					'ballY': active_match.ballY
				},
				'winner': 0,
				'status': active_match.status,
				'mode': active_match.mode,
				'type': active_match.room_type,
				'date_started': datetime.datetime.now().isoformat(),
				'time': 0 #####
			}
			rooms[str(room['id'])] = room
			await self.channel_layer.group_add(str(room['id']), self.channel_name)
			await self.send(text_data=json.dumps({
				'type': 'playerNo',
				'message': {
					'playerNo': 2,
					'id': room['id']
				}
			}))
			await sync_to_async(active_match.delete)()
			asyncio.create_task(set_game(self, room, users))
			waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
			for waited_invite in waited_invites:
				await sync_to_async(waited_invite.delete)()
			player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
			for player_notif in player_notifs:
				await sync_to_async(player_notif.delete)()
			user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
			##printf"PLAYER 1 IS : {user.username} {user.is_playing}")
	if isEmpty:
		for key, value in rooms.items():
			# ##printf"values in the rooms are : {value}")
			if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
				await self.send(text_data=json.dumps({
					'type': 'alreadyPlaying',
					'message': 'alreadyPlaying'
				}))
				return
		room_id = await generate_unique_room_id(self)
		active_match = await sync_to_async(ActiveMatch.objects.create)(
			mode = '1vs1',
			room_type = 'random',
			room_id = room_id,
			status = 'notStarted',
			ballX = 300,
			ballY = 200
		)
		# try:
		user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
		await set_to_true(self, user)
		##printf"PLAYER 1 IS : {user.username} {user.is_playing}")
		# user.is_playing = True
		# await sync_to_async(user.save)()
		friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
		for friend in friends:
			friend_id = await sync_to_async(lambda: friend.friend.id)()
			friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
			# ##printfriend_channel)
			if friend_channel:
				await self.channel_layer.send(friend_channel, {
					'type': 'playingStatus',
					'message': {
						'user': user.username,
						'is_playing': True
					}
				})
		await sync_to_async(PlayerState.objects.create)(
			active_match = active_match,
			player = user,
			state = 'inactive',
			playerNo = 1,
			paddleX = 15,
			paddleY = 165,
			score = 0
		)
		await self.channel_layer.group_add(str(room_id), self.channel_name)
		await self.send(text_data=json.dumps({
			'type': 'playerNo',
			'message': {
				'playerNo': 1,
				'id': room_id
			}
		}))
		waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
		for waited_invite in waited_invites:
			await sync_to_async(waited_invite.delete)()
		player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
		for player_notif in player_notifs:
			await sync_to_async(player_notif.delete)()
		user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
		##printf"PLAYER 1 IS : {user.username} {user.is_playing}")

async def set_game(self, room, users):
	await asyncio.create_task(startedGameSignal(self, room, users))

async def startedGameSignal(self, room, users):
	await self.channel_layer.group_send(str(room['id']), {
			'type': 'gameReady',
			'message': {
				'room' : room,
				'users': users
			}
		}
	)

async def quitRoom(self, data, rooms, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	# ##printf"INSIDE THE QUIT THE RANDOM GAME : {data['message']}")
	room = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['id']).first)()
	if room:
		if (data['message']).get('user'):
			user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
			if user:
				# ##printf"INSIDE QUIT ROOM : {data['message']['id']}")
				# ##print"SETTING THE PLAYER TO IS NOT PLAYING")
				##printf"is_player is false")
				user.is_playing = False
				await sync_to_async(user.save)()
				channel_name = user_channels.get(user.id).channel_name  if user.id in user_channels else None
				self.channel_layer.group_discard(str(room.room_id), channel_name)
				friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': user.username,
								'is_playing': False,
								'userInfos': {
									'id': user.id,
									'name': user.username,
									'level': 2,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}"
									# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
								}
							}
						})

		await sync_to_async(room.delete)()

async def startPlayer(self, data, rooms):
	playersReady = 0
	message = data['message']
	room = rooms.get(message['roomID'])

	# ##print"inside start_player")
	if room:
		for player in rooms[room['id']]['players']:
			if player['user'] == message['user']:
				player['status'] = 1
			if player['status'] == 1:
				playersReady += 1
		if playersReady == 2:
			asyncio.create_task(allPlayersReady(self, room['id']))

async def allPlayersReady(self, roomID):
	await self.channel_layer.group_send(roomID, {
			'type': 'playersReady',
			'message': 'playersReady'
		}
	)

##### cancel ready for a player ##### =====> /game
async def cancelPlayer(self, data, rooms):
	message = data['message']
	room = rooms.get(message['roomID'])

	# ##print"inside cancel_player")
	if room:
		for player in rooms[room['id']]['players']:
			if player['user'] == message['user']:
				player['status'] = 0

##### remove the player from the room if he exit bofore it started ##### =====> /game
async def clearRoom1(self, data, rooms):
	message = data['message']
	room = rooms.get(message['roomID'])

	# ##print"inside clear_room1")
	if room:
		asyncio.create_task(clearRoom(self, room['id']))
		self.channel_layer.group_discard(room['id'], self.channel_name)

async def clearRoom(self, roomID):
	await self.channel_layer.group_send(roomID, {
			'type': 'removeRoom',
			'message': 'removeRoom'
		}
	)

##### remove the player from the room if he exit bofore it started ##### =====> /game
async def clearRoom2(self, data, rooms):
	message = data['message']
	room = rooms.get(message['roomID'])

	# ##print"inside clear_room2")
	# ##printmessage)
	if room:
		self.channel_layer.group_discard(room['id'], self.channel_name)
		rooms.pop(room['id'])

#### check if player is in this room provided by id ##### =====> /play/:id

async def users_infos(self, room_id, users):
	await asyncio.create_task(send_users_infos(self, room_id, users))

async def send_users_infos(self, room_id, users):
	await self.channel_layer.group_send(str(room_id), {
			'type': 'playersInfos',
			'message': {
				'users': users
			}
		}
	)

async def starttimer(self, room):
	while True:
		if room and room['status'] != 'started':
			break
		room['time'] += 1
		await asyncio.sleep(1)

async def validatePlayer(self, data, rooms, user_channels):
	message = data['message']
	ip_address = os.getenv("IP_ADDRESS")
	room = rooms.get(str(message['roomID']))
	# ##printf"ROOM ID TO SEARCH IS : {rooms}")
	playersReady = 0
	playerIsIn = False
	playerNo = 0
	if room:
		for player in room['players']:
			if player['user'] == message['user']:
				playerIsIn = True
				await self.channel_layer.group_add(str(room['id']), self.channel_name)
				if room['status'] == 'notStarted':
					rooms[str(room['id'])]['status'] = 'started'
					await self.send(text_data=json.dumps({
						'type': 'setupGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'time': 0
						}
					}))
					asyncio.create_task(starttimer(self, room))
					asyncio.create_task(startGame(self, data, rooms, user_channels))
					player['state'] = 'playing'
					users = []
					for player in room['players']:
						player = await sync_to_async(customuser.objects.filter(username=player['user']).first)()
						player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
						if (player):
							users.append({
								'name': player.username,
								'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
								'level': player_match_statistics.level
							})
					await self.send(text_data=json.dumps({
						'type': 'playersInfos',
						'message': {
							'users': users
						}
					}))
					asyncio.create_task(users_infos(self, room['id'], users))
					return
				elif room['status'] == 'started':
					if player['state'] == 'inactive':
						player['state'] = 'playing'
					# ##printroom)
					await self.send(text_data=json.dumps({
						'type': 'setupGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'time': room['time']
						}
					}))
					users = []
					for player in room['players']:
						player = await sync_to_async(customuser.objects.filter(username=player['user']).first)()
						player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
						if (player):
							users.append({
								'name': player.username,
								'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
								'level': player_match_statistics.level
							})
					await self.send(text_data=json.dumps({
						'type': 'playersInfos',
						'message': {
							'users': users
						}
					}))
					asyncio.create_task(users_infos(self, room['id'], users))
					return
				elif room['status'] == 'aborted':
					player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
					player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
					# ##print"GAME IS ALREADY ABORTED")
					await self.send(text_data=json.dumps({
						'type': 'abortedGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'time': room['time'],
							'score': [room['players'][0]['score'], room['players'][1]['score']],
							'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
							'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
							'accuracy': [player1_accuracy, player2_accuracy],
							'rating': [0, 0]
						}
					}))
					return
				elif room['status'] == 'finished':
					if room['players'][0]['score'] > room['players'][1]['score']:
						player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
						player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
					else:
						player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
						player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
					player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
					player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
					await self.send(text_data=json.dumps({
						'type': 'finishedGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'time': room['time'],
							'score': [room['players'][0]['score'], room['players'][1]['score']],
							'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
							'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
							'accuracy': [player1_accuracy, player2_accuracy],
							'rating': [player1_rating, player2_rating],
							'status': [room['players'][0]['status'], room['players'][1]['status']]
						}
					}))
					return
		if playerIsIn == False:
			await self.send(text_data=json.dumps({
				'type': 'notAuthorized',
				'message': 'notAuthorized'
			}))
			return

	else:
		try:
			match_played = await sync_to_async(Match.objects.get)(room_id=message['roomID'])
			match_statistics = await sync_to_async(MatchStatistics.objects.get)(match=match_played)
			player1_username = await sync_to_async(lambda:match_played.team1_player1.username)()
			player2_username = await sync_to_async(lambda:match_played.team2_player1.username)()
			player1 = await sync_to_async(customuser.objects.filter(username=player1_username).first)()
			player2 = await sync_to_async(customuser.objects.filter(username=player2_username).first)()
			player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
			player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
			users = []
			if match_played.match_status == 'aborted':
				player1_accuracy = (match_statistics.team1_player1_score * match_statistics.team1_player1_hit) / 100
				player2_accuracy = (match_statistics.team2_player1_score * match_statistics.team2_player1_hit) / 100
				await self.send(text_data=json.dumps({
					'type': 'abortedGame',
					'message': {
						'user1' : player1_username,
						'user2' : player2_username,
						'playerScore1' : match_played.team1_score,
						'playerScore2' : match_played.team2_score,
						'time': match_played.duration,
						'score': [match_played.team1_score, match_played.team2_score],
						'selfScore': [match_statistics.team1_player1_score, match_statistics.team2_player1_score,],
						'hit': [match_statistics.team1_player1_hit, match_statistics.team2_player1_hit],
						'accuracy': [player1_accuracy, player2_accuracy],
						'rating': [0, 0]
					}
				}))
				users.append({
					'name': player1_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}",
					'level': player1_match_statistics.level
				})
				users.append({
					'name': player2_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}",
					'level': player2_match_statistics.level
				})
				await self.send(text_data=json.dumps({
					'type': 'playersInfos',
					'message': {
						'users': users
					}
				}))
			elif match_played.match_status == 'finished':
				if match_played.team1_score > match_played.team2_score:
					player1_rating = (match_statistics.team1_player1_score * 20) + (match_statistics.team1_player1_score * 0.5)
					player2_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * -0.5)
				else:
					player1_rating = (match_statistics.team1_player1_score * 20) + (match_statistics.team1_player1_score * -0.5)
					player2_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * 0.5)
				player1_accuracy = (match_statistics.team1_player1_score * match_statistics.team1_player1_hit) / 100
				player2_accuracy = (match_statistics.team2_player1_score * match_statistics.team2_player1_hit) / 100
				await self.send(text_data=json.dumps({
					'type': 'finishedGame',
					'message': {
						'user1' : player1_username,
						'user2' : player2_username,
						'playerScore1' : match_played.team1_score,
						'playerScore2' : match_played.team2_score,
						'time': match_played.duration,
						'score': [match_played.team1_score, match_played.team2_score],
						'selfScore': [match_statistics.team1_player1_score, match_statistics.team2_player1_score],
						'hit': [match_statistics.team1_player1_hit, match_statistics.team2_player1_hit],
						'accuracy': [player1_accuracy, player2_accuracy],
						'rating': [player1_rating, player2_rating],
						'status': [match_played.team1_status, match_played.team2_status]
					}
				}))
				users.append({
					'name': player1_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}",
					'level': player1_match_statistics.level
				})
				users.append({
					'name': player2_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}",
					'level': player2_match_statistics.level
				})
				await self.send(text_data=json.dumps({
					'type': 'playersInfos',
					'message': {
						'users': users
					}
				}))
		except Match.DoesNotExist:
			await self.send(text_data=json.dumps({
				'type': 'roomNotExist',
				'message': 'roomNotExist'
			}))

async def updatingGame(self, room):
	await self.channel_layer.group_send(str(room['id']), {
		'type': 'updateGame',
		'message': {
			'playerY1': room['players'][0]['paddleY'],
			'playerY2': room['players'][1]['paddleY'],
			'playerScore1': room['players'][0]['score'],
			'playerScore2': room['players'][1]['score'],
			'ballX': room['ball']['ballX'],
			'ballY': room['ball']['ballY'],
		}
	})

async def gameFinished(self, room):
	if room['players'][0]['score'] > room['players'][1]['score']:
		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
	else:
		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
	player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
	player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
	await self.channel_layer.group_send(str(room['id']), {
			'type': 'finishedGame',
			'message': {
				'user1' : room['players'][0]['user'],
				'user2' : room['players'][1]['user'],
				'playerScore1' : room['players'][0]['score'],
				'playerScore2' : room['players'][1]['score'],
				'time': room['time'],
				'score': [room['players'][0]['score'], room['players'][1]['score']],
				'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
				'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
				'accuracy': [player1_accuracy, player2_accuracy],
				'rating': [player1_rating, player2_rating],
				'status': [room['players'][0]['status'], room['players'][1]['status']]
			}
		}
)

async def gameAborted(self, room):
	player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
	player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
	await self.channel_layer.group_send(str(room['id']), {
			'type': 'abortedGame',
			'message': {
				'user1' : room['players'][0]['user'],
				'user2' : room['players'][1]['user'],
				'playerScore1' : room['players'][0]['score'],
				'playerScore2' : room['players'][1]['score'],
				'time': room['time'],
				'score': [room['players'][0]['score'], room['players'][1]['score']],
				'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
				'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
				'accuracy': [player1_accuracy, player2_accuracy],
				'rating': [0, 0]
			}
		}
	)

def collision(self, ball, player, room):
	ballTop = ball['ballY'] - 7 ## 15
	ballButtom = ball['ballY'] + 7 ## 15
	ballLeft = ball['ballX'] - 7 ## 15
	ballRight = ball['ballX'] + 7 ## 15
	playerTop = player[0]['paddleY']
	playerButtom = player[0]['paddleY'] + 70
	playerLeft = player[0]['paddleX']
	playerRight = player[0]['paddleX'] + 10
	if (ballRight > playerLeft and ballButtom > playerTop and
			ballLeft < playerRight and ballTop < playerButtom):
		room['players'][0]['tmp_scored'] = 0
		room['players'][1]['tmp_scored'] = 0
		room['players'][player[1]]['hit'] += 1
		room['players'][player[1]]['tmp_scored'] = 1
		return 1
	return 0
	
async def runOverGame(self, room, ballProps, rooms, user_channels):
	# global rooms
	ip_address = os.getenv("IP_ADDRESS")

	while True:
		room["ball"]["ballX"] += ballProps["velocityX"]
		room["ball"]["ballY"] += ballProps["velocityY"]

		if room['status'] == 'finished' or room['status'] == 'aborted':
			room["ball"]["ballX"] = 355
			room["ball"]["ballY"] = 200
			room['players'][0]['paddleX'] = 15
			room['players'][0]['paddleY'] = 165
			room['players'][1]['paddleX'] = 685
			room['players'][1]['paddleY'] = 165
			await asyncio.create_task(updatingGame(self, room))
			if room['status'] == 'finished':
				await gameFinished(self, room)
			else:
				await gameAborted(self, room)
			del rooms[str(room['id'])]
			# ##printf"GAME OVER AND THE UPDATED ROOMS ARE : {rooms}")
			player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
			player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
			##printf"is_player is false")
			player1.is_playing = False
			await sync_to_async(player1.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=player1))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'playingStatus',
						'message': {
							'user': player1.username,
							'is_playing': False,
							'userInfos': {
								'id': player1.id,
								'name': player1.username,
								'level': 2,
								'image':  f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}"
								# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
							}
						}
					})
			##printf"is_player is false")
			player2.is_playing = False
			await sync_to_async(player2.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=player2))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'playingStatus',
						'message': {
							'user': player2.username,
							'is_playing': False,
							'userInfos': {
								'id': player2.id,
								'name': player2.username,
								'level': 2,
								'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}"
								# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
							}
						}
					})
			match = await sync_to_async(Match.objects.create)(
				mode = room['mode'],
				room_id = room['id'],
				team1_player1 = player1,
				team2_player1 = player2,
				team1_score = room['players'][0]['score'],
				team2_score =  room['players'][1]['score'],
				team1_status = room['players'][0]['status'],
				team2_status = room['players'][1]['status'],
				date_started = room['date_started'],
				date_ended = datetime.datetime.now().isoformat(),
				match_status = room['status'],
				duration=room['time']
			)
			player1_rating = 0
			player2_rating = 0
			if room['players'][0]['score'] > room['players'][1]['score']:
				if room['status'] == 'finished':
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
				else:
					player1_rating = 0
					player2_rating = 0
			else:
				if room['status'] == 'finished':
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
				else:
					player1_rating = 0
					player2_rating = 0
			await sync_to_async(MatchStatistics.objects.create)(
				match=match,
				team1_player1_score=room['players'][0]['self_scored'],
				team2_player1_score=room['players'][1]['self_scored'],
				team1_player1_hit=room['players'][0]['hit'],
				team2_player1_hit=room['players'][1]['hit'],
				team1_player1_rating=player1_rating,
				team2_player1_rating=player2_rating,
			)
			if room['status'] == 'finished':
				player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
				player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
				if room['players'][0]['score'] > room['players'][1]['score']:
					if player1_match_statistics:
						player1_match_statistics.wins += 1
						player1_totalXP = player1_match_statistics.total_xp + player1_rating
						player1_match_statistics.level += (player1_totalXP / 1000)
						player1_match_statistics.total_xp = (player1_totalXP % 1000)
						player1_match_statistics.goals += room['players'][0]['score']
						await sync_to_async(player1_match_statistics.save)()
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=1,
							losts=0,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
				else:
					if player2_match_statistics:
						player2_match_statistics.wins += 1
						player2_totalXP = player2_match_statistics.total_xp + player2_rating
						player2_match_statistics.level += (player2_totalXP / 1000)
						player2_match_statistics.total_xp = (player2_totalXP % 1000)
						player2_match_statistics.goals += room['players'][1]['score']
						await sync_to_async(player2_match_statistics.save)()
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=1,
							losts=0,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
			user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
			user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
			self.channel_layer.group_discard(str(room['id']), user1_channel)
			self.channel_layer.group_discard(str(room['id']), user2_channel)
			return
		if room["ball"]["ballY"] + 7 > 390 or room["ball"]["ballY"] - 7 < 10: ## was 10 now 11 just for the stucking
			ballProps["velocityY"] *= -1
		if room["ball"]["ballY"] - 7 < 10:
			room["ball"]["ballY"] += 5
		if room["ball"]["ballY"] + 7 > 390:
			room["ball"]["ballY"] -= 5
			# ballProps["velocityX"] *= -1
		player = [room["players"][0], 0] if room["ball"]["ballX"] < 355 else [room['players'][1], 1]
		# ##printf"speed : {ballProps['speed']}")
		if collision(self, room["ball"], player, room):
			hitPoint = room["ball"]["ballY"] - (player[0]["paddleY"] + 35) #### player["height"] / 2 => 50
			hitPoint = hitPoint / 35 #### player["height"] / 2 => 50
			angle = hitPoint * math.pi / 4
			direction = 1 if (room["ball"]["ballX"] < 355) else -1
			ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
			ballProps["velocityY"] = ballProps["speed"] * math.sin(angle) ######## maybe no direction
			if ballProps["speed"] < 15:
				ballProps["speed"] += 0.5
			elif ballProps["speed"] != 16:
				ballProps["speed"] += 0.001
		if room["ball"]["ballX"] - 7 < 0 or room["ball"]["ballX"] + 7 > 710:
			if room["ball"]["ballX"] - 7 < 0:
				room["players"][1]["score"] += 1
				room['players'][1]['self_scored'] += room['players'][1]['tmp_scored']
			elif room["ball"]["ballX"] + 7 > 710:
				room["players"][0]["score"] += 1
				room['players'][0]['self_scored'] += room['players'][0]['tmp_scored']
			serveX = random.randint(1, 2)
			serveY = random.randint(1, 2)
			room["ball"]["ballX"] = 355
			room["ball"]["ballY"] = 200
			ballProps["speed"] = 5
			ballProps["velocityX"] = 5 if (serveX == 1) else -5
			ballProps["velocityY"] = 5 if (serveY == 1) else -5
			await asyncio.create_task(updatingGame(self, room))
			if room['players'][0]['score'] == 5:
				room['winner'] = 1
				room['status'] = 'finished'
				room['players'][0]['status'] = 'winner'
				room['players'][1]['status'] = 'loser'
				await gameFinished(self, room)
				del rooms[str(room['id'])]
				player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
				player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
				##printf"is_player is false")
				player1.is_playing = False
				await sync_to_async(player1.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=player1))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': player1.username,
								'is_playing': False,
								'userInfos': {
									'id': player1.id,
									'name': player1.username,
									'level': 2,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}"
									# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
								}
							}
						})
				##printf"is_player is false")
				player2.is_playing = False
				await sync_to_async(player2.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=player2))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': player2.username,
								'is_playing': False,
								'userInfos': {
									'id': player2.id,
									'name': player2.username,
									'level': 2,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}"
								}
							}
						})
				match = await sync_to_async(Match.objects.create)(
					mode = room['mode'],
					room_id = room['id'],
					team1_player1 = player1,
					team2_player1 = player2,
					team1_score = room['players'][0]['score'],
					team2_score =  room['players'][1]['score'],
					team1_status = room['players'][0]['status'],
					team2_status = room['players'][1]['status'],
					date_started = room['date_started'],
					date_ended = datetime.datetime.now().isoformat(),
					match_status = room['status'],
					duration=room['time']
				)
				player1_rating = 0
				player2_rating = 0
				if room['players'][0]['score'] > room['players'][1]['score']:
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
				else:
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
				await sync_to_async(MatchStatistics.objects.create)(
					match=match,
					team1_player1_score=room['players'][0]['self_scored'],
					team2_player1_score=room['players'][1]['self_scored'],
					team1_player1_hit=room['players'][0]['hit'],
					team2_player1_hit=room['players'][1]['hit'],
					team1_player1_rating=player1_rating,
					team2_player1_rating=player2_rating,
				)
				player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
				player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
				if room['players'][0]['score'] > room['players'][1]['score']:
					if player1_match_statistics:
						player1_match_statistics.wins += 1
						player1_totalXP = player1_match_statistics.total_xp + player1_rating
						player1_match_statistics.level += (player1_totalXP / 1000)
						player1_match_statistics.total_xp = (player1_totalXP % 1000)
						player1_match_statistics.goals += room['players'][0]['score']
						await sync_to_async(player1_match_statistics.save)()
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=1,
							losts=0,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
				else:
					if player2_match_statistics:
						player2_match_statistics.wins += 1
						player2_totalXP = player2_match_statistics.total_xp + player2_rating
						player2_match_statistics.level += (player2_totalXP / 1000)
						player2_match_statistics.total_xp = (player2_totalXP % 1000)
						player2_match_statistics.goals += room['players'][1]['score']
						await sync_to_async(player2_match_statistics.save)()
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=1,
							losts=0,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
				user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
				user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
				self.channel_layer.group_discard(str(room['id']), user1_channel)
				self.channel_layer.group_discard(str(room['id']), user2_channel)
				return
			elif room['players'][1]['score'] == 5:
				room['winner'] = 2
				room['status'] = 'finished'
				room['players'][1]['status'] = 'winner'
				room['players'][0]['status'] = 'loser'
				await gameFinished(self, room)
				del rooms[str(room['id'])]
				player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
				player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
				##printf"is_player is false")
				player1.is_playing = False
				await sync_to_async(player1.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=player1))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': player1.username,
								'is_playing': False,
								'userInfos': {
									'id': player1.id,
									'name': player1.username,
									'level': 2,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}"
									# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
								}
							}
						})
				##printf"is_player is false")
				player2.is_playing = False
				await sync_to_async(player2.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=player2))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': player2.username,
								'is_playing': False,
								'userInfos': {
									'id': player2.id,
									'name': player2.username,
									'level': 2,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}"
									# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
								}
							}
						})
				match = await sync_to_async(Match.objects.create)(
					mode = room['mode'],
					room_id = room['id'],
					team1_player1 = player1,
					team2_player1 = player2,
					team1_score = room['players'][0]['score'],
					team2_score =  room['players'][1]['score'],
					team1_status = room['players'][0]['status'],
					team2_status = room['players'][1]['status'],
					date_started = room['date_started'],
					date_ended = datetime.datetime.now().isoformat(),
					match_status = room['status'],
					duration=room['time']
				)
				player1_rating = 0
				player2_rating = 0
				if room['players'][0]['score'] > room['players'][1]['score']:
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
				else:
					player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
					player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
				await sync_to_async(MatchStatistics.objects.create)(
					match=match,
					team1_player1_score=room['players'][0]['self_scored'],
					team2_player1_score=room['players'][1]['self_scored'],
					team1_player1_hit=room['players'][0]['hit'],
					team2_player1_hit=room['players'][1]['hit'],
					team1_player1_rating=player1_rating,
					team2_player1_rating=player2_rating,
				)
				player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
				player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
				if room['players'][0]['score'] > room['players'][1]['score']:
					if player1_match_statistics:
						player1_match_statistics.wins += 1
						player1_totalXP = player1_match_statistics.total_xp + player1_rating
						player1_match_statistics.level += (player1_totalXP / 1000)
						player1_match_statistics.total_xp = (player1_totalXP % 1000)
						player1_match_statistics.goals += room['players'][0]['score']
						await sync_to_async(player1_match_statistics.save)()
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=1,
							losts=0,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
						if player2_match_statistics:
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=0,
							losts=1,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
				else:
					if player2_match_statistics:
						player2_match_statistics.wins += 1
						player2_totalXP = player2_match_statistics.total_xp + player2_rating
						player2_match_statistics.level += (player2_totalXP / 1000)
						player2_match_statistics.total_xp = (player2_totalXP % 1000)
						player2_match_statistics.goals += room['players'][1]['score']
						await sync_to_async(player2_match_statistics.save)()
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
					else:
						await sync_to_async(UserMatchStatics.objects.create)(
							player=player2,
							wins=1,
							losts=0,
							level=0,
							total_xp=player2_rating,
							goals=room['players'][1]['score']
						)
						if player1_match_statistics:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
						else:
							await sync_to_async(UserMatchStatics.objects.create)(
							player=player1,
							wins=0,
							losts=1,
							level=0,
							total_xp=player1_rating,
							goals=room['players'][0]['score']
						)
				user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
				user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
				self.channel_layer.group_discard(str(room['id']), user1_channel)
				self.channel_layer.group_discard(str(room['id']), user2_channel)
				return
			break
		await asyncio.create_task(updatingGame(self, room))
		await asyncio.sleep(0.020)
	await runOverGame(self, room, ballProps, rooms, user_channels)

async def startGame(self, data, rooms, user_channels):
	room = rooms.get(str(data['message']['roomID']))
	if room:
		ballProps = {
			"velocityX": 5,
			"velocityY": 5,
			"speed": 5
		}
		await asyncio.create_task(runOverGame(self, room, ballProps, rooms, user_channels))

##### when the game already started and some or all players getout from the playing page ##### =====> /play/:id

async def changedPage(self, data, rooms):
	message = data['message']
	room = rooms.get(str(message['roomID']))
	inactivePlayers = 0

	if room:
		if room['status'] == 'started':
			for player in room['players']:
				if player['user'] == message['user']:
					player['state'] = 'inactive'
				if player['state'] == 'inactive':
					inactivePlayers += 1
			if inactivePlayers == 2:
				room['status'] = 'aborted'
				for player in room['players']:
					player['state'] = 'finished'
			else:
				asyncio.create_task(cdBeforeEndingGame(self, message['roomID'], rooms))

async def cdBeforeEndingGame(self, roomID, rooms):
	room = rooms.get(str(roomID))
	countdown = 10
	if room:
		for i in range(60):
			await asyncio.sleep(1)
			countdown -= 1
			if room['status'] == 'started' and (room['players'][0]['state'] == 'inactive' or room['players'][1]['state'] == 'inactive'):
				if countdown == 0:
					room['status'] = 'finished'
					if room['players'][0]['state'] == 'inactive':
						room['players'][0]['status'] = 'loser'
						room['players'][1]['status'] = 'winner'
					elif room['players'][1]['state'] == 'inactive':
						room['players'][1]['status'] = 'loser'
						room['players'][0]['status'] = 'winner'
					await asyncio.create_task(gameFinished(self, room))
					break
			else:
				break


async def move_paddle(self, data, rooms):
	room = rooms.get(data['message']['roomID'])
	if room:
		player = room['players'][data['message']['playerNo'] - 1]
		if data['message']['direction'] == 'up':
			player['paddleY'] -= 8
			if player['paddleY'] < 10:
				player['paddleY'] = 10
		elif data['message']['direction'] == 'down':
			player['paddleY'] += 8
			if player['paddleY'] + 70 > 390:
				player['paddleY'] = 320

async def move_mouse(self, data, rooms):
	room = rooms.get(data['message']['roomID'])
	if room:
		player = room['players'][data['message']['playerNo'] - 1]
		player['paddleY'] = data['message']['distance'] - 35
		if player['paddleY'] < 10:
			player['paddleY'] = 10
		elif player['paddleY'] + 70 > 390:
			player['paddleY'] = 320

async def user_exited(self, data, rooms):
	message = data['message']
	room = rooms.get(str(message['roomID']))

	if room:
		room['status'] = 'finished'
		if room['players'][0]['user'] == message['user']:
			room['players'][0]['status'] = 'loser'
			room['players'][1]['status'] = 'winner'
		elif room['players'][1]['user'] == message['user']:
			room['players'][1]['status'] = 'loser'
			room['players'][0]['status'] = 'winner'

##### invite a friend from the friends to play with #####
async def invite_friend(self, data, rooms, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	# ##print"ENTER 14")
	for active_match in active_matches:
		sender = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=user1).first)()
		# ##print"ENTER 13")
		if sender:
			user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
			# ##print"ENTER 12")
			if not receiver:
				# ##print"ENTER 100")
				await sync_to_async(NotifPlayer.objects.create)(
					active_match = active_match,
					player = user2,
				)
				await sync_to_async(GameNotifications.objects.create)(
					active_match = active_match,
					user = user1,
					target = user2,
					mode="1vs1"
				)
				target_user = await sync_to_async(customuser.objects.get)(username=data['message']['target'])
				friend_channel_list = notifs_user_channels.get(target_user.id)
				# if friend_channel:
				if friend_channel_list:
					usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
					for friend_channel in friend_channel_list:
						await self.channel_layer.send(friend_channel, {
							'type': 'receiveFriendGame',
							'message': {
								'user': data['message']['user'],
								'level': usermatchstats.level,
								'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}",
								'roomID': active_match.room_id,
								'mode': '1vs1'
							}
						})
			return
	# ##print"ENTER 2")
	room_id = await generate_unique_room_id(self)
	# ##printf'ROOM_ID WHEN CREATING IS : {room_id}')
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.create)(
		mode = '1vs1',
		room_type = 'friends',
		room_id = room_id,
		status = 'notStarted',
		ballX = 355,
		ballY = 200
	)
	user1.is_playing = True
	await sync_to_async(user1.save)()
	await sync_to_async(PlayerState.objects.create)(
		active_match = active_match,
		player = user1,
		state = 'inactive',
		playerNo = 1,
		paddleX = 15,
		paddleY = 165,
		score = 0
	)
	# ##print"ENTER 3")
	await self.send(text_data=json.dumps({
		'type': 'playerNo',
		'message': {
			'playerNo': 1,
			'id': room_id
		}
	}))
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user1))
	for friend in friends:
		friend_id = await sync_to_async(lambda: friend.friend.id)()
		#print"************ WAS HEEERE BACKK")
		friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
		if friend_channel:
			await self.channel_layer.send(friend_channel, {
				'type': 'playingStatus',
				'message': {
					'user': user1.username,
					'is_playing': True
				}
			})
	receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
	# ##print"ENTER 4")
	if not receiver:
		await sync_to_async(NotifPlayer.objects.create)(
			active_match = active_match,
			player = user2,
		)
		await sync_to_async(GameNotifications.objects.create)(
			active_match = active_match,
			user = user1,
			target = user2,
			mode="1vs1"
		)
		# ##print"ENTER 5")
		# if receiver and receiver.is_online and not receiver.is_playing:
		# ##print"ENTER 6")
		target_user = await sync_to_async(customuser.objects.get)(username=data['message']['target'])
		friend_channel_list = notifs_user_channels.get(target_user.id)
		if friend_channel_list:
			usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
			for friend_channel in friend_channel_list:
				await self.channel_layer.send(friend_channel, {
					'type': 'receiveFriendGame',
					'message': {
						'user': data['message']['user'],
						'level': usermatchstats.level,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}",
						'roomID': active_match.room_id,
						'mode': '1vs1'
					}
				})
	waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user1))
	for waited_invite in waited_invites:
		await sync_to_async(waited_invite.delete)()
	player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user1))
	for player_notif in player_notifs:
		await sync_to_async(player_notif.delete)()

async def create_new_room(self, data, rooms, user_channels):
	room_id = await generate_unique_room_id(self)
	# ##printf'ROOM_ID WHEN CREATING IS : {room_id}')
	user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.create)(
		mode = '1vs1',
		room_type = 'create_join',
		room_id = room_id,
		status = 'notStarted',
		ballX = 355,
		ballY = 200,
		creator = user
	)
	user.is_playing = True
	await sync_to_async(user.save)()
	await sync_to_async(PlayerState.objects.create)(
		active_match = active_match,
		player = user,
		state = 'inactive',
		playerNo = 1,
		paddleX = 15,
		paddleY = 165,
		score = 0
	)
	# ##print"ENTER 3")
	await self.channel_layer.group_add(str(room_id), self.channel_name)
	await self.send(text_data=json.dumps({
		'type': 'playerInfos',
		'message': {
			'playerNo': 1,
			'id': room_id,
			'creator': True
		}
	}))
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	for friend in friends:
		friend_id = await sync_to_async(lambda: friend.friend.id)()
		friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
		# ##printfriend_channel)
		if friend_channel:
			await self.channel_layer.send(friend_channel, {
				'type': 'playingStatus',
				'message': {
					'user': user.username,
					'is_playing': True
				}
			})
	waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
	for waited_invite in waited_invites:
		await sync_to_async(waited_invite.delete)()
	player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
	for player_notif in player_notifs:
		await sync_to_async(player_notif.delete)()

async def join_new_room(self, data, rooms, user_channels):
	room_code = (data['message']).get('roomCode')
	ip_address = os.getenv("IP_ADDRESS")
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=room_code).first)()
	if active_match:
		print("ACTIVE MATCH FOUND*********************YES")
		user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
		user.is_playing = True
		await sync_to_async(user.save)()
		await sync_to_async(PlayerState.objects.create)(
			active_match = active_match,
			player = user,
			state = 'inactive',
			playerNo = 2,
			paddleX = 685,
			paddleY = 165,
			score = 0
		)
		player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
		players = []
		users = []
		for player_state in player_states:
			player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
			player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
			players.append({
				'user': player.username,
				'state': player_state.state,
				'playerNo': player_state.playerNo,
				'paddleX': player_state.paddleX,
				'paddleY': player_state.paddleY,
				'score': player_state.score,
				'status': '',
				'hit': 0, #######
				'self_scored': 0, ####### added
				'tmp_scored': 0 ####### added
			})
			users.append({
				'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
				'level': player_match_statistics.level
			})
		room = {
			'id': active_match.room_id,
			'players': players,
			'ball': {
				'ballX': active_match.ballX,
				'ballY': active_match.ballY
			},
			'winner': 0,
			'status': active_match.status,
			'mode': active_match.mode,
			'type': active_match.room_type,
			'date_started': datetime.datetime.now().isoformat(),
			'time': 0
		}
		rooms[str(room['id'])] = room
		await self.channel_layer.group_add(str(room['id']), self.channel_name)
		await self.send(text_data=json.dumps({
			'type': 'playerInfos',
			'message': {
				'playerNo': 2,
				'id': room['id'],
				'creator': False
			}
		}))
		await sync_to_async(active_match.delete)()
		asyncio.create_task(set_game(self, room, users))
		friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
		for friend in friends:
			friend_id = await sync_to_async(lambda: friend.friend.id)()
			friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
			# ##printfriend_channel)
			if friend_channel:
				await self.channel_layer.send(friend_channel, {
					'type': 'playingStatus',
					'message': {
						'user': user.username,
						'is_playing': True
					}
				})
		waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
		for waited_invite in waited_invites:
			await sync_to_async(waited_invite.delete)()
		player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
		for player_notif in player_notifs:
			await sync_to_async(player_notif.delete)()
	else:
		await self.send(text_data=json.dumps({
			'type': 'invalidCode',
			'message': 'invalidCode'
		}))
