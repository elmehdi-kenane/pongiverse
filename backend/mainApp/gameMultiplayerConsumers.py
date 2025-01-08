import math
import json
import random
import base64
import asyncio
import datetime
from myapp.models import customuser
from asgiref.sync import sync_to_async
from .models import Match, ActiveMatch, PlayerState, NotifPlayer, GameNotifications, MatchStatistics, UserMatchStatics
from friends.models import Friendship
from Notifications.common import notifs_user_channels
import os


######################### JOIN TO A AN EXISTING ROOM OR A NEW ONE -MULTIPLAYER- ##############################

@sync_to_async
def generate_unique_room_id(self):
	while True:
		room_id = random.randint(1000000, 1000000000)  # Adjust the range as needed
		if not ActiveMatch.objects.filter(room_id=room_id).exists() and not Match.objects.filter(id=room_id).exists():
			return room_id

async def waited_game(self, room_id, users):
	await asyncio.create_task(waitedGameSignal(self, room_id, users))

async def waitedGameSignal(self, room_id, users):
	await self.channel_layer.group_send(str(room_id), {
			'type': 'gameOnHold',
			'message': {
				'users': users
			}
		}
	)

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

async def join_room_mp(self, data, rooms, user_channels):
	room = None
	isEmpty = True
	ip_address = os.getenv("IP_ADDRESS")
	# global rooms

	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	for active_match in active_matches:
		if active_match.mode == '2vs2' and active_match.room_type == 'random':
			##print"FOUND AN ACTIVE MATCH")
			player_state_count = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
			isEmpty = False
			user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
			user.is_playing = True
			await sync_to_async(user.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
				##printfriend_channel)
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'playingStatus',
						'message': {
							'user': user.username,
							'is_playing': True
						}
					})
			if player_state_count == 1:
				await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'Ready',
					playerNo = 2,
					paddleX = 15,
					paddleY = 265,
					score = 0
				)
			elif player_state_count == 2:
				await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'Ready',
					playerNo = 3,
					paddleX = 685,
					paddleY = 65,
					score = 0
				)
			elif player_state_count == 3:
				await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'Ready',
					playerNo = 4,
					paddleX = 685,
					paddleY = 265,
					score = 0
				)
			if player_state_count + 1 < 4:
				player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
				users = []
				user_no = 1
				for player_state in player_states:
					player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
					player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
					users.append({
						'name': player.username,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
						'level': player_match_statistics.level,
						'playerNo': user_no
					})
					user_no += 1
				await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
				await self.send(text_data=json.dumps({
					'type': 'playerNo',
					'message': {
						'playerNo': (player_state_count + 1),
						'id': active_match.room_id
					}
				}))
				asyncio.create_task(waited_game(self, active_match.room_id, users))
				waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
				for waited_invite in waited_invites:
					await sync_to_async(waited_invite.delete)()
				player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
				for player_notif in player_notifs:
					await sync_to_async(player_notif.delete)()
				return
			player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
			players = []
			users = []
			user_no = 1
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
					'inside': True,
					'total_hit': 0, ####### added
					'self_scored': 0, ####### added
					'tmp_scored': 0 ####### added
				})
				users.append({
					'name': player.username,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
					'level': player_match_statistics.level,
					'playerNo': user_no
				})
				user_no += 1
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
					'playerNo': 4,
					'id': room['id']
				}
			}))
			await sync_to_async(active_match.delete)()
			asyncio.create_task(set_game(self, room, users))    #######=========>NEXT INSHAALAH
			waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user))
			for waited_invite in waited_invites:
				await sync_to_async(waited_invite.delete)()
			player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user))
			for player_notif in player_notifs:
				await sync_to_async(player_notif.delete)()
	if isEmpty:
		for key, value in rooms.items():
			##printf"values in the rooms are : {value}")
			if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
				await self.send(text_data=json.dumps({
					'type': 'alreadyPlaying',
					'message': 'alreadyPlaying'
				}))
				return
		room_id = await generate_unique_room_id(self)
		##print"ACTIVE MATCH CREATED")
		active_match = await sync_to_async(ActiveMatch.objects.create)(
			mode = '2vs2',
			room_type = 'random',
			room_id = room_id,
			status = 'notStarted',
			ballX = 355,
			ballY = 200
		)
		user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
		user.is_playing = True
		await sync_to_async(user.save)()
		friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
		for friend in friends:
			friend_id = await sync_to_async(lambda: friend.friend.id)()
			friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
			##printfriend_channel)
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
			state = 'Ready',
			playerNo = 1,
			paddleX = 15,
			paddleY = 65,
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

async def quit_room_mp(self, data, rooms, user_channels):
	##printf"INSIDE THE QUIT THE RANDOM GAME : {data['message']}")
	room = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['id']).first)()
	ip_address = os.getenv("IP_ADDRESS")
	if room:
		if (data['message']).get('user'):
			user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
			if user:
				player_state = await sync_to_async(PlayerState.objects.filter(active_match=room, player=user).first)()
				if player_state:
					player_no = player_state.playerNo
					await sync_to_async(player_state.delete)()
					player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=room))
					if len(player_states):
						creator = await sync_to_async(lambda: room.creator)()
						creator_username = None
						if creator:
							creator_username = await sync_to_async(lambda: creator.username)()
						if creator_username == data['message']['user']:
							users = []
							await self.channel_layer.group_send(str(data['message']['id']), {
								'type': 'creatorOut',
								'message': 'creatorOut'
							})
							for player_state in player_states:
								player_state_name = await sync_to_async(lambda: player_state.player.username)()
								users.append(player_state_name)
							user_channel = user_channels.get(user.id).channel_name  if user.id in user_channels else None 
							self.channel_layer.group_discard(str(room.room_id), user_channel)
							await sync_to_async(room.delete)()
							for user in users:
								user = await sync_to_async(customuser.objects.filter(username=user).first)()
								user.is_playing = False
								await sync_to_async(user.save)()
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
						else:
							users = []
							for player_state in player_states:
								if player_state.playerNo > player_no:
									player_state_name = await sync_to_async(lambda: player_state.player.id)()
									player_state_channel = user_channels.get(player_state_name).channel_name  if player_state_name in user_channels else None
									##printf"INFOS : {player_state_name} --- {player_state.playerNo - 1} --- {room.room_id}")
									await self.channel_layer.send(player_state_channel, {
										'type': 'sendPlayerNo',
										'message': {
											'playerNo': (player_state.playerNo - 1),
											'id': room.room_id
										}
									})
									# await self.send(text_data=json.dumps({
									#     'type': 'playerNo',
									#     'message': {
									#         'playerNo': (player_state.playerNo - 1),
									#         'id': room.room_id
									#     }
									# }))
									if player_state.playerNo - 1 == 1:
										player_state.paddleX = 15
										player_state.paddleY = 65
									elif player_state.playerNo - 1 == 2:
										player_state.paddleX = 15
										player_state.paddleY = 265
									elif player_state.playerNo - 1 == 3:
										player_state.paddleX = 685
										player_state.paddleY = 65
									else:
										player_state.paddleX = 685
										player_state.paddleY = 265
									player_state.playerNo -= 1
									await sync_to_async(player_state.save)()

								player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
								player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
								users.append({
									'name': player.username,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
									'level': player_match_statistics.level
								})
							asyncio.create_task(waited_game(self, room.room_id, users))
							user_channel = user_channels.get(user.id).channel_name  if user.id in user_channels else None 
							self.channel_layer.group_discard(str(room.room_id), user_channel)
					else:
						user_channel = user_channels.get(user.id).channel_name  if user.id in user_channels else None 
						self.channel_layer.group_discard(str(room.room_id), user_channel)
						await sync_to_async(room.delete)()
					user.is_playing = False
					await sync_to_async(user.save)()
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
		# await sync_to_async(room.delete)()

#### check if player is in this room provided by id ##### =====> /play/:id

async def starttimer(self, room):
	while True:
		if room and room['status'] != 'started':
			break
		room['time'] += 1
		await asyncio.sleep(1)


async def validate_player_mp(self, data, rooms, user_channels):
	message = data['message']
	room = rooms.get(str(message['roomID']))
	# ##printf"ROOM ID TO SEARCH IS : {rooms}")
	ip_address = os.getenv("IP_ADDRESS")
	playersReady = 0
	playerIsIn = False
	playerNo = 0

	if room:
		for player in room['players']:
			if player['user'] == message['user'] and player['inside'] == True:
				playerIsIn = True
				await self.channel_layer.group_add(str(room['id']), self.channel_name)
				if room['status'] == 'notStarted':
					rooms[str(room['id'])]['status'] = 'started'
					await self.send(text_data=json.dumps({
						'type': 'setupGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1': room['players'][0]['user'],
							'user2': room['players'][1]['user'],
							'user3': room['players'][2]['user'],
							'user4': room['players'][3]['user'],
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
							# if player.username != message['user']:
							#     data = {
							#         'user': player.username,
							#         'roomID': room['id']
							#     }
							#     asyncio.create_task(changed_page_mp(self, data, rooms))
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
					playersOut = []
					for eachPlayer in room['players']:
						if eachPlayer['inside'] == False:
							playersOut.append(eachPlayer['playerNo'])
					await self.send(text_data=json.dumps({
						'type': 'setupGame',
						'message': {
							'playerNo': player['playerNo'],
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'user3' : room['players'][2]['user'],
							'user4' : room['players'][3]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'playerScore3' : room['players'][2]['score'],
							'playerScore4' : room['players'][3]['score'],
							'userOut': playersOut,
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
					player3_accuracy = (room['players'][2]['self_scored'] * room['players'][2]['hit']) / 100
					player4_accuracy = (room['players'][3]['self_scored'] * room['players'][3]['hit']) / 100
					##print"GAME IS ALREADY ABORTED")
					await self.send(text_data=json.dumps({
						'type': 'abortedGame',
						'message': {
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'user3' : room['players'][2]['user'],
							'user4' : room['players'][3]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'playerScore3' : room['players'][2]['score'],
							'playerScore4' : room['players'][3]['score'],
							'time': room['time'],
							'score': [room['players'][0]['score'], room['players'][1]['score'], room['players'][2]['score'], room['players'][3]['score']],
							'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored'], room['players'][2]['self_scored'], room['players'][3]['self_scored']],
							'hit': [room['players'][0]['hit'], room['players'][1]['hit'], room['players'][2]['hit'], room['players'][3]['hit']],
							'accuracy': [player1_accuracy, player2_accuracy, player3_accuracy, player4_accuracy],
							'rating': [0, 0, 0, 0]
						}
					}))
					return
				elif room['status'] == 'finished':
					if room['players'][0]['score'] > room['players'][2]['score']:
						player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
						player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
						player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * -0.5)
						player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * -0.5)
					else:
						player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
						player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
						player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * 0.5)
						player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * 0.5)
					player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
					player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
					player3_accuracy = (room['players'][2]['self_scored'] * room['players'][2]['hit']) / 100
					player4_accuracy = (room['players'][3]['self_scored'] * room['players'][3]['hit']) / 100
					await self.send(text_data=json.dumps({
						'type': 'finishedGame',
						'message': {
							'user1' : room['players'][0]['user'],
							'user2' : room['players'][1]['user'],
							'user3' : room['players'][2]['user'],
							'user4' : room['players'][3]['user'],
							'playerScore1' : room['players'][0]['score'],
							'playerScore2' : room['players'][1]['score'],
							'playerScore3' : room['players'][2]['score'],
							'playerScore4' : room['players'][3]['score'],
							'time': room['time'],
							'score': [room['players'][0]['score'], room['players'][1]['score'], room['players'][2]['score'], room['players'][3]['score']],
							'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored'], room['players'][2]['self_scored'], room['players'][3]['self_scored']],
							'hit': [room['players'][0]['hit'], room['players'][1]['hit'], room['players'][2]['hit'], room['players'][3]['hit']],
							'accuracy': [player1_accuracy, player2_accuracy, player3_accuracy, player4_accuracy],
							'rating': [player1_rating, player2_rating, player3_rating, player4_rating],
							'status': [room['players'][0]['status'], room['players'][1]['status'], room['players'][2]['status'], room['players'][3]['status']]
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
			player2_username = await sync_to_async(lambda:match_played.team1_player2.username)()
			player3_username = await sync_to_async(lambda:match_played.team2_player1.username)()
			player4_username = await sync_to_async(lambda:match_played.team2_player2.username)()
			player1 = await sync_to_async(customuser.objects.filter(username=player1_username).first)()
			player2 = await sync_to_async(customuser.objects.filter(username=player2_username).first)()
			player3 = await sync_to_async(customuser.objects.filter(username=player3_username).first)()
			player4 = await sync_to_async(customuser.objects.filter(username=player4_username).first)()
			player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
			player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
			player3_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player3).first)()
			player4_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player4).first)()
			users = []
			if match_played.match_status == 'aborted':
				await self.send(text_data=json.dumps({
					'type': 'abortedGame',
					'message': {
						'user1' : player1_username,
						'user2' : player2_username,
						'user3' : player3_username,
						'user4' : player4_username,
						'playerScore1' : match_played.team1_score,
						'playerScore2' : match_played.team1_score,
						'playerScore3' : match_played.team2_score,
						'playerScore4' : match_played.team2_score,
						'time': match_played.duration,
						'playersScore': [match_statistics.team1_player1_score, match_statistics.team1_player2_score, match_statistics.team2_player1_score, match_statistics.team2_player2_score],
						'playersHit': [match_statistics.team1_player1_hit, match_statistics.team1_player2_hit, match_statistics.team2_player1_hit, match_statistics.team2_player2_hit],
						'playersRating': [match_statistics.team1_player1_rating, match_statistics.team1_player2_rating, match_statistics.team2_player1_rating, match_statistics.team2_player2_rating]
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
				users.append({
					'name': player3_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player3.avatar.url}",
					'level': player3_match_statistics.level
				})
				users.append({
					'name': player4_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player4.avatar.url}",
					'level': player4_match_statistics.level
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
					player2_rating = (match_statistics.team1_player2_score * 20) + (match_statistics.team1_player2_score * 0.5)
					player3_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * -0.5)
					player4_rating = (match_statistics.team2_player2_score * 20) + (match_statistics.team2_player2_score * -0.5)
				else:
					player1_rating = (match_statistics.team1_player1_score * 20) + (match_statistics.team1_player1_score * -0.5)
					player2_rating = (match_statistics.team1_player2_score * 20) + (match_statistics.team1_player2_score * -0.5)
					player3_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * 0.5)
					player4_rating = (match_statistics.team2_player2_score * 20) + (match_statistics.team2_player2_score * 0.5)
				player1_accuracy = (match_statistics.team1_player1_score * match_statistics.team1_player1_hit) / 100
				player2_accuracy = (match_statistics.team1_player2_score * match_statistics.team1_player2_hit) / 100
				player3_accuracy = (match_statistics.team2_player1_score * match_statistics.team2_player1_hit) / 100
				player4_accuracy = (match_statistics.team2_player2_score * match_statistics.team2_player2_hit) / 100
				#print"****************************, ", {match_played.team1_status}, {match_played.team2_status})
				await self.send(text_data=json.dumps({
					'type': 'finishedGame',
					'message': {
						'user1' : player1_username,
						'user2' : player2_username,
						'user3' : player3_username,
						'user4' : player4_username,
						'playerScore1' : match_played.team1_score,
						'playerScore2' : match_played.team1_score,
						'playerScore3' : match_played.team2_score,
						'playerScore4' : match_played.team2_score,
						'time': match_played.duration,
						'score': [match_played.team1_score, match_played.team1_score, match_played.team2_score, match_played.team2_score],
						'selfScore': [match_statistics.team1_player1_score, match_statistics.team1_player2_score, match_statistics.team2_player1_score, match_statistics.team2_player2_score],
						# 'playersScore': [match_statistics.team1_player1_score, match_statistics.team1_player2_score, match_statistics.team2_player1_score, match_statistics.team2_player2_score],
						'hit': [match_statistics.team1_player1_hit, match_statistics.team1_player2_hit, match_statistics.team2_player1_hit, match_statistics.team2_player2_hit],
						'accuracy': [player1_accuracy, player2_accuracy, player3_accuracy, player4_accuracy],
						'rating': [player1_rating, player2_rating, player3_rating, player4_rating],
						'status': [match_played.team1_status, match_played.team1_status, match_played.team2_status, match_played.team2_status],
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
				users.append({
					'name': player3_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player3.avatar.url}",
					'level': player3_match_statistics.level
				})
				users.append({
					'name': player4_username,
					'avatar': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player4.avatar.url}",
					'level': player4_match_statistics.level
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
			'playerY3': room['players'][2]['paddleY'],
			'playerY4': room['players'][3]['paddleY'],
			'playerScore1': room['players'][0]['score'],
			'playerScore2': room['players'][1]['score'],
			'playerScore3': room['players'][2]['score'],
			'playerScore4': room['players'][3]['score'],
			'ballX': room['ball']['ballX'],
			'ballY': room['ball']['ballY'],
		}
	})

async def gameFinished(self, room):
	if room['players'][0]['score'] > room['players'][2]['score']:
		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
		player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * -0.5)
		player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * -0.5)
	else:
		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
		player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * 0.5)
		player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * 0.5)
	player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['total_hit']) / 100
	player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['total_hit']) / 100
	player3_accuracy = (room['players'][2]['self_scored'] * room['players'][2]['total_hit']) / 100
	player4_accuracy = (room['players'][3]['self_scored'] * room['players'][3]['total_hit']) / 100
	await self.channel_layer.group_send(str(room['id']), {
			'type': 'finishedGame',
			'message': {
				'user1' : room['players'][0]['user'],
				'user2' : room['players'][1]['user'],
				'user3' : room['players'][2]['user'],
				'user4' : room['players'][3]['user'],
				'playerScore1' : room['players'][0]['score'],
				'playerScore2' : room['players'][1]['score'],
				'playerScore3' : room['players'][2]['score'],
				'playerScore4' : room['players'][3]['score'],
				'time': room['time'],
				'score': [room['players'][0]['score'], room['players'][1]['score'], room['players'][2]['score'], room['players'][3]['score']],
				'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored'], room['players'][2]['self_scored'], room['players'][3]['self_scored']],
				'hit': [room['players'][0]['total_hit'], room['players'][1]['total_hit'], room['players'][2]['total_hit'], room['players'][3]['total_hit']],
				'accuracy': [player1_accuracy, player2_accuracy, player3_accuracy, player4_accuracy],
				'rating': [player1_rating, player2_rating, player3_rating, player4_rating],
				'status': [room['players'][0]['status'], room['players'][1]['status'], room['players'][2]['status'], room['players'][3]['status']]
			}
		}
	)

async def gameAborted(self, room):
	player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
	player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
	player3_accuracy = (room['players'][2]['self_scored'] * room['players'][2]['hit']) / 100
	player4_accuracy = (room['players'][3]['self_scored'] * room['players'][3]['hit']) / 100
	await self.channel_layer.group_send(str(room['id']), {
			'type': 'abortedGame',
			'message': {
				'user1' : room['players'][0]['user'],
				'user3' : room['players'][1]['user'],
				'user2' : room['players'][2]['user'],
				'user4' : room['players'][3]['user'],
				'playerScore1' : room['players'][0]['score'],
				'playerScore2' : room['players'][1]['score'],
				'playerScore3' : room['players'][2]['score'],
				'playerScore4' : room['players'][3]['score'],
				'time': room['time'],
				'score': [room['players'][0]['score'], room['players'][1]['score'], room['players'][2]['score'], room['players'][3]['score']],
				'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored'], room['players'][2]['self_scored'], room['players'][3]['self_scored']],
				'hit': [room['players'][0]['total_hit'], room['players'][1]['total_hit'], room['players'][2]['total_hit'], room['players'][3]['total_hit']],
				'accuracy': [player1_accuracy, player2_accuracy, player3_accuracy, player4_accuracy],
				'rating': [0, 0, 0, 0]
			}
		}
	)

def collision(self, ball, player1, room):
	ballTop = ball['ballY'] - 7
	ballButtom = ball['ballY'] + 7
	ballLeft = ball['ballX'] - 7
	ballRight = ball['ballX'] + 7
	playerTop2 = player1[1]['paddleY']
	playerButtom2 = player1[1]['paddleY'] + 70
	playerLeft2 = player1[1]['paddleX']
	playerRight2 = player1[1]['paddleX'] + 10
	playerTop1 = player1[0]['paddleY']
	playerButtom1 = player1[0]['paddleY'] + 70
	playerLeft1 = player1[0]['paddleX']
	playerRight1 = player1[0]['paddleX'] + 10
	if (player1[0]['inside'] and ballRight > playerLeft1 and ballButtom > playerTop1 and
		ballLeft < playerRight1 and ballTop < playerButtom1):
		room['players'][0]['tmp_scored'] = 0
		room['players'][1]['tmp_scored'] = 0
		room['players'][2]['tmp_scored'] = 0
		room['players'][3]['tmp_scored'] = 0
		room['players'][player1[2]]['total_hit'] += 1
		room['players'][player1[2]]['tmp_scored'] = 1
		return 1
	elif (player1[1]['inside'] and ballRight > playerLeft2 and ballButtom > playerTop2 and
		ballLeft < playerRight2 and ballTop < playerButtom2):
		room['players'][0]['tmp_scored'] = 0
		room['players'][1]['tmp_scored'] = 0
		room['players'][2]['tmp_scored'] = 0
		room['players'][3]['tmp_scored'] = 0
		room['players'][player1[3]]['total_hit'] += 1
		room['players'][player1[3]]['tmp_scored'] = 1
		return 2
	else:
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
					room['players'][0]['paddleY'] = 65
					room['players'][1]['paddleX'] = 15
					room['players'][1]['paddleY'] = 265
					room['players'][0]['paddleX'] = 685
					room['players'][0]['paddleY'] = 65
					room['players'][1]['paddleX'] = 685
					room['players'][1]['paddleY'] = 265
					await asyncio.create_task(updatingGame(self, room))
					if room['status'] == 'finished':
							await gameFinished(self, room)
					else:
							await gameAborted(self, room)
					del rooms[str(room['id'])]
					##printf"GAME OVER AND THE UPDATED ROOMS ARE : {rooms}")
					player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
					player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
					player3 = await sync_to_async(customuser.objects.get)(username=room['players'][2]['user'])
					player4 = await sync_to_async(customuser.objects.get)(username=room['players'][3]['user'])
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
															'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}"
															# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
													}
											}
									})
					player3.is_playing = False
					await sync_to_async(player3.save)()
					friends = await sync_to_async(list)(Friendship.objects.filter(user=player3))
					for friend in friends:
							friend_id = await sync_to_async(lambda: friend.friend.id)()
							friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
							if friend_channel:
									await self.channel_layer.send(friend_channel, {
											'type': 'playingStatus',
											'message': {
													'user': player3.username,
													'is_playing': False,
													'userInfos': {
															'id': player3.id,
															'name': player3.username,
															'level': 2,
															'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player3.avatar.url}"
															# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
													}
											}
									})
					player4.is_playing = False
					await sync_to_async(player4.save)()
					friends = await sync_to_async(list)(Friendship.objects.filter(user=player4))
					for friend in friends:
							friend_id = await sync_to_async(lambda: friend.friend.id)()
							friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
							if friend_channel:
									await self.channel_layer.send(friend_channel, {
											'type': 'playingStatus',
											'message': {
													'user': player4.username,
													'is_playing': False,
													'userInfos': {
															'id': player4.id,
															'name': player4.username,
															'level': 2,
															'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player4.avatar.url}"
															# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
													}
											}
									})
					match = await sync_to_async(Match.objects.create)(
							mode = room['mode'],
							room_id = room['id'],
							team1_player1 = player1,
							team1_player2 = player2,
							team2_player1 = player3,
							team2_player2 = player4,
							team1_score = room['players'][0]['score'],
							team2_score =  room['players'][2]['score'],
							team1_status = room['players'][0]['status'],
							team2_status = room['players'][2]['status'],
							date_started = room['date_started'],
							date_ended = datetime.datetime.now().isoformat(),
							match_status = room['status'],
							duration=room['time']
					)
					player1_rating = 0
					player2_rating = 0
					player3_rating = 0
					player4_rating = 0
					if room['players'][0]['score'] > room['players'][2]['score']:
						if room['status'] == 'finished':
							player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
							player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
							player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * -0.5)
							player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * -0.5)
						else:
							player1_rating = 0
							player2_rating = 0
							player3_rating = 0
							player4_rating = 0
					else:
						if room['status'] == 'finished':
							player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
							player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
							player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * 0.5)
							player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * 0.5)
						else:
							player1_rating = 0
							player2_rating = 0
							player3_rating = 0
							player4_rating = 0
					await sync_to_async(MatchStatistics.objects.create)(
						match=match,
						team1_player1_score=room['players'][0]['self_scored'],
						team1_player2_score=room['players'][1]['self_scored'],
						team2_player1_score=room['players'][2]['self_scored'],
						team2_player2_score=room['players'][3]['self_scored'],
						team1_player1_hit=room['players'][0]['total_hit'],
						team1_player2_hit=room['players'][1]['total_hit'],
						team2_player1_hit=room['players'][2]['total_hit'],
						team2_player2_hit=room['players'][3]['total_hit'],
						team1_player1_rating=player1_rating,
						team1_player2_rating=player2_rating,
						team2_player1_rating=player3_rating,
						team2_player2_rating=player4_rating,
                    )
					if room['status'] == 'finished':
						player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
						player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
						player3_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player3).first)()
						player4_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player4).first)()
						if room['players'][0]['score'] > room['players'][2]['score']:
							player1_match_statistics.wins += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
							player2_match_statistics.wins += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
							player3_match_statistics.losts += 1
							player3_totalXP = player3_match_statistics.total_xp + player3_rating
							player3_match_statistics.level += (player3_totalXP / 1000)
							player3_match_statistics.total_xp = (player3_totalXP % 1000)
							player3_match_statistics.goals += room['players'][2]['score']
							await sync_to_async(player3_match_statistics.save)()
							player4_match_statistics.losts += 1
							player4_totalXP = player4_match_statistics.total_xp + player4_rating
							player4_match_statistics.level += (player4_totalXP / 1000)
							player4_match_statistics.total_xp = (player4_totalXP % 1000)
							player4_match_statistics.goals += room['players'][3]['score']
							await sync_to_async(player4_match_statistics.save)()
						else:
							player1_match_statistics.losts += 1
							player1_totalXP = player1_match_statistics.total_xp + player1_rating
							player1_match_statistics.level += (player1_totalXP / 1000)
							player1_match_statistics.total_xp = (player1_totalXP % 1000)
							player1_match_statistics.goals += room['players'][0]['score']
							await sync_to_async(player1_match_statistics.save)()
							player2_match_statistics.losts += 1
							player2_totalXP = player2_match_statistics.total_xp + player2_rating
							player2_match_statistics.level += (player2_totalXP / 1000)
							player2_match_statistics.total_xp = (player2_totalXP % 1000)
							player2_match_statistics.goals += room['players'][1]['score']
							await sync_to_async(player2_match_statistics.save)()
							player3_match_statistics.wins += 1
							player3_totalXP = player3_match_statistics.total_xp + player3_rating
							player3_match_statistics.level += (player3_totalXP / 1000)
							player3_match_statistics.total_xp = (player3_totalXP % 1000)
							player3_match_statistics.goals += room['players'][2]['score']
							await sync_to_async(player1_match_statistics.save)()
							player4_match_statistics.wins += 1
							player4_totalXP = player4_match_statistics.total_xp + player4_rating
							player4_match_statistics.level += (player4_totalXP / 1000)
							player4_match_statistics.total_xp = (player4_totalXP % 1000)
							player4_match_statistics.goals += room['players'][3]['score']
							await sync_to_async(player4_match_statistics.save)()
					user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
					user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
					user3_channel = user_channels.get(player3.id).channel_name if player3.id in user_channels else None
					user4_channel = user_channels.get(player4.id).channel_name if player4.id in user_channels else None
					self.channel_layer.group_discard(str(room['id']), user1_channel)
					self.channel_layer.group_discard(str(room['id']), user2_channel)
					self.channel_layer.group_discard(str(room['id']), user3_channel)
					self.channel_layer.group_discard(str(room['id']), user4_channel)
					return
			if room["ball"]["ballY"] + 10 > 390 or room["ball"]["ballY"] - 10 < 10: ## was 10 now 11 just for the stucking
					ballProps["velocityY"] *= -1
			if room["ball"]["ballY"] - 10 < 10:
					room["ball"]["ballY"] += 5
			if room["ball"]["ballY"] + 10 > 390:
					room["ball"]["ballY"] -= 5
					# ballProps["velocityX"] *= -1
			player1 = [room["players"][0], room["players"][1], 0, 1] if room["ball"]["ballX"] < 355 else [room['players'][2], room['players'][3], 2, 3]
			selected = collision(self, room["ball"], player1, room)
			if selected:
					hitPoint = 0
					if selected == 1:
							hitPoint = room["ball"]["ballY"] - (player1[0]["paddleY"] + 35) #### player["height"] / 2 => 50
					elif selected == 2:
							##printselected)
							hitPoint = room["ball"]["ballY"] - (player1[1]["paddleY"] + 35) #### player["height"] / 2 => 50
					hitPoint = hitPoint / 35 #### player["height"] / 2 => 50
					angle = hitPoint * math.pi / 4
					direction = 1 if (room["ball"]["ballX"] < 355) else -1
					ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
					ballProps["velocityY"] = ballProps["speed"] * math.sin(angle) ######## maybe no direction
					if ballProps["speed"] < 15:
							ballProps["speed"] += 0.5
					elif ballProps["speed"] != 16:
							ballProps["speed"] += 0.001
			if room["ball"]["ballX"] - 10 < 0 or room["ball"]["ballX"] + 10 > 710:
					if room["ball"]["ballX"] - 10 < 0:
							room["players"][2]["score"] += 1
							room["players"][3]["score"] += 1
							room['players'][2]['self_scored'] += room['players'][2]['tmp_scored']
							room['players'][3]['self_scored'] += room['players'][3]['tmp_scored']
					elif room["ball"]["ballX"] + 10 > 600:
							room["players"][0]["score"] += 1
							room["players"][1]["score"] += 1
							room['players'][0]['self_scored'] += room['players'][0]['tmp_scored']
							room['players'][1]['self_scored'] += room['players'][1]['tmp_scored']
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
						room['players'][1]['status'] = 'winner'
						room['players'][2]['status'] = 'loser'
						room['players'][3]['status'] = 'loser'
						await gameFinished(self, room)
						del rooms[str(room['id'])]
						player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
						player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
						player3 = await sync_to_async(customuser.objects.get)(username=room['players'][2]['user'])
						player4 = await sync_to_async(customuser.objects.get)(username=room['players'][3]['user'])
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
																'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player1.avatar.url}" 
														}
												}
										})
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
																'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player2.avatar.url}"
														}
												}
										})
						player3.is_playing = False
						await sync_to_async(player3.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player3))
						for friend in friends:
								friend_id = await sync_to_async(lambda: friend.friend.id)()
								friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
								if friend_channel:
										await self.channel_layer.send(friend_channel, {
												'type': 'playingStatus',
												'message': {
														'user': player3.username,
														'is_playing': False,
														'userInfos': {
																'id': player3.id,
																'name': player3.username,
																'level': 2,
																'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player3.avatar.url}"
														}
												}
										})
						player4.is_playing = False
						await sync_to_async(player4.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player4))
						for friend in friends:
								friend_id = await sync_to_async(lambda: friend.friend.id)()
								friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
								if friend_channel:
										await self.channel_layer.send(friend_channel, {
												'type': 'playingStatus',
												'message': {
														'user': player4.username,
														'is_playing': False,
														'userInfos': {
																'id': player4.id,
																'name': player4.username,
																'level': 2,
																'image':f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player4.avatar.url}"
														}
												}
										})
						match = await sync_to_async(Match.objects.create)(
								mode = room['mode'],
								room_id = room['id'],
								team1_player1 = player1,
								team1_player2 = player2,
								team2_player1 = player3,
								team2_player2 = player4,
								team1_score = room['players'][0]['score'],
								team2_score = room['players'][2]['score'],
								team1_status = room['players'][0]['status'],
								team2_status = room['players'][2]['status'],
								date_started = room['date_started'],
								date_ended = datetime.datetime.now().isoformat(),
								match_status = room['status'],
								duration=room['time']
						)
						player1_rating = 0
						player2_rating = 0
						player3_rating = 0
						player4_rating = 0
						if room['players'][0]['score'] > room['players'][2]['score']:
								player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
								player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
								player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * -0.5)
								player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * -0.5)
						else:
								player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
								player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
								player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * 0.5)
								player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * 0.5)
						await sync_to_async(MatchStatistics.objects.create)(
							match=match,
							team1_player1_score=room['players'][0]['self_scored'],
							team1_player2_score=room['players'][1]['self_scored'],
							team2_player1_score=room['players'][2]['self_scored'],
							team2_player2_score=room['players'][3]['self_scored'],
							team1_player1_hit=room['players'][0]['total_hit'],
							team1_player2_hit=room['players'][1]['total_hit'],
							team2_player1_hit=room['players'][2]['total_hit'],
							team2_player2_hit=room['players'][3]['total_hit'],
							team1_player1_rating=player1_rating,
							team1_player2_rating=player2_rating,
							team2_player1_rating=player3_rating,
							team2_player2_rating=player4_rating,
						)
						player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
						player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
						player3_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player3).first)()
						player4_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player4).first)()
						player1_match_statistics.wins += 1
						player1_totalXP = player1_match_statistics.total_xp + player1_rating
						player1_match_statistics.level += (player1_totalXP / 1000)
						player1_match_statistics.total_xp = (player1_totalXP % 1000)
						player1_match_statistics.goals += room['players'][0]['score']
						await sync_to_async(player1_match_statistics.save)()
						player2_match_statistics.wins += 1
						player2_totalXP = player2_match_statistics.total_xp + player2_rating
						player2_match_statistics.level += (player2_totalXP / 1000)
						player2_match_statistics.total_xp = (player2_totalXP % 1000)
						player2_match_statistics.goals += room['players'][1]['score']
						await sync_to_async(player2_match_statistics.save)()
						player3_match_statistics.losts += 1
						player3_totalXP = player3_match_statistics.total_xp + player3_rating
						player3_match_statistics.level += (player3_totalXP / 1000)
						player3_match_statistics.total_xp = (player3_totalXP % 1000)
						player3_match_statistics.goals += room['players'][2]['score']
						await sync_to_async(player3_match_statistics.save)()
						player4_match_statistics.losts += 1
						player4_totalXP = player4_match_statistics.total_xp + player4_rating
						player4_match_statistics.level += (player4_totalXP / 1000)
						player4_match_statistics.total_xp = (player4_totalXP % 1000)
						player4_match_statistics.goals += room['players'][3]['score']
						await sync_to_async(player4_match_statistics.save)()
						user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
						user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
						user3_channel = user_channels.get(player3.id).channel_name if player3.id in user_channels else None 
						user4_channel = user_channels.get(player4.id).channel_name if player4.id in user_channels else None
						self.channel_layer.group_discard(str(room['id']), user1_channel)
						self.channel_layer.group_discard(str(room['id']), user2_channel)
						self.channel_layer.group_discard(str(room['id']), user3_channel)
						self.channel_layer.group_discard(str(room['id']), user4_channel)
						return
					elif room['players'][2]['score'] == 5:
						room['winner'] = 2
						room['status'] = 'finished'
						room['players'][2]['status'] = 'winner'
						room['players'][3]['status'] = 'winner'
						room['players'][0]['status'] = 'loser'
						room['players'][1]['status'] = 'loser'
						await gameFinished(self, room)
						del rooms[str(room['id'])]
						player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
						player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
						player3 = await sync_to_async(customuser.objects.get)(username=room['players'][2]['user'])
						player4 = await sync_to_async(customuser.objects.get)(username=room['players'][3]['user'])
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
														}
												}
										})
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
						player3.is_playing = False
						await sync_to_async(player3.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player3))
						for friend in friends:
								friend_id = await sync_to_async(lambda: friend.friend.id)()
								friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
								if friend_channel:
										await self.channel_layer.send(friend_channel, {
												'type': 'playingStatus',
												'message': {
														'user': player3.username,
														'is_playing': False,
														'userInfos': {
																'id': player3.id,
																'name': player3.username,
																'level': 2,
																'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player3.avatar.url}" 
														}
												}
										})
						player4.is_playing = False
						await sync_to_async(player4.save)()
						friends = await sync_to_async(list)(Friendship.objects.filter(user=player4))
						for friend in friends:
								friend_id = await sync_to_async(lambda: friend.friend.id)()
								friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
								if friend_channel:
										await self.channel_layer.send(friend_channel, {
												'type': 'playingStatus',
												'message': {
														'user': player4.username,
														'is_playing': False,
														'userInfos': {
																'id': player4.id,
																'name': player4.username,
																'level': 2,
																'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player4.avatar.url}"
														}
												}
										})
						match = await sync_to_async(Match.objects.create)(
								mode = room['mode'],
								room_id = room['id'],
								team1_player1 = player1,
								team1_player2 = player2,
								team2_player1 = player3,
								team2_player2 = player4,
								team1_score = room['players'][0]['score'],
								team2_score =  room['players'][2]['score'],
								team1_status = room['players'][0]['status'],
								team2_status = room['players'][2]['status'],
								date_started = room['date_started'],
								date_ended = datetime.datetime.now().isoformat(),
								match_status = room['status'],
								duration=room['time']
						)
						player1_rating = 0
						player2_rating = 0
						player3_rating = 0
						player4_rating = 0
						if room['players'][0]['score'] > room['players'][2]['score']:
							player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
							player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
							player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * -0.5)
							player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * -0.5)
						else:
							player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
							player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
							player3_rating = (room['players'][2]['self_scored'] * 20) + (room['players'][2]['self_scored'] * 0.5)
							player4_rating = (room['players'][3]['self_scored'] * 20) + (room['players'][3]['self_scored'] * 0.5)
						await sync_to_async(MatchStatistics.objects.create)(
							match=match,
							team1_player1_score=room['players'][0]['self_scored'],
							team1_player2_score=room['players'][1]['self_scored'],
							team2_player1_score=room['players'][2]['self_scored'],
							team2_player2_score=room['players'][3]['self_scored'],
							team1_player1_hit=room['players'][0]['total_hit'],
							team1_player2_hit=room['players'][1]['total_hit'],
							team2_player1_hit=room['players'][2]['total_hit'],
							team2_player2_hit=room['players'][3]['total_hit'],
							team1_player1_rating=player1_rating,
							team1_player2_rating=player2_rating,
							team2_player1_rating=player3_rating,
							team2_player2_rating=player4_rating,
						)
						player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
						player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
						player3_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player3).first)()
						player4_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player4).first)()
						player1_match_statistics.losts += 1
						player1_totalXP = player1_match_statistics.total_xp + player1_rating
						player1_match_statistics.level += (player1_totalXP / 1000)
						player1_match_statistics.total_xp = (player1_totalXP % 1000)
						player1_match_statistics.goals += room['players'][0]['score']
						await sync_to_async(player1_match_statistics.save)()
						player2_match_statistics.losts += 1
						player2_totalXP = player2_match_statistics.total_xp + player2_rating
						player2_match_statistics.level += (player2_totalXP / 1000)
						player2_match_statistics.total_xp = (player2_totalXP % 1000)
						player2_match_statistics.goals += room['players'][1]['score']
						await sync_to_async(player2_match_statistics.save)()
						player3_match_statistics.wins += 1
						player3_totalXP = player3_match_statistics.total_xp + player3_rating
						player3_match_statistics.level += (player3_totalXP / 1000)
						player3_match_statistics.total_xp = (player3_totalXP % 1000)
						player3_match_statistics.goals += room['players'][2]['score']
						await sync_to_async(player1_match_statistics.save)()
						player4_match_statistics.wins += 1
						player4_totalXP = player4_match_statistics.total_xp + player4_rating
						player4_match_statistics.level += (player4_totalXP / 1000)
						player4_match_statistics.total_xp = (player4_totalXP % 1000)
						player4_match_statistics.goals += room['players'][3]['score']
						await sync_to_async(player4_match_statistics.save)()
						user1_channel = user_channels.get(player1.id).channel_name  if player1.id in user_channels else None
						user2_channel = user_channels.get(player2.id).channel_name  if player2.id in user_channels else None
						user3_channel = user_channels.get(player3.id).channel_name if player3.id in user_channels else None 
						user4_channel = user_channels.get(player4.id).channel_name if player4.id in user_channels else None
						self.channel_layer.group_discard(str(room['id']), user1_channel)
						self.channel_layer.group_discard(str(room['id']), user2_channel)
						self.channel_layer.group_discard(str(room['id']), user3_channel)
						self.channel_layer.group_discard(str(room['id']), user4_channel)
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

async def move_paddle_mp(self, data, rooms):
	room = rooms.get(data['message']['roomID'])
	if room:
		player = room['players'][data['message']['playerNo'] - 1]
		if data['message']['direction'] == 'up':
			player['paddleY'] -= 8
			if data['message']['playerNo'] == 1 or data['message']['playerNo'] == 3:
				if player['paddleY'] < 10:
					player['paddleY'] = 10
			else:
				if data['message']['playerNo'] == 2 and room['players'][0]['inside'] == True:
					if player['paddleY'] < 200:
						player['paddleY'] = 200
				elif data['message']['playerNo'] == 2 and room['players'][0]['inside'] == False:
					if player['paddleY'] < 10:
						player['paddleY'] = 10
				elif data['message']['playerNo'] == 4 and room['players'][2]['inside'] == True:
					if player['paddleY'] < 200:
						player['paddleY'] = 200
				elif data['message']['playerNo'] == 4 and room['players'][2]['inside'] == False:
					if player['paddleY'] < 10:
						player['paddleY'] = 10
		else:
			player['paddleY'] += 8
			if data['message']['playerNo'] == 2 or data['message']['playerNo'] == 4:
				if player['paddleY'] + 70 > 390:
					player['paddleY'] = 320
			else:
				if data['message']['playerNo'] == 1 and room['players'][1]['inside'] == True:
					if player['paddleY'] + 70 > 200:
						player['paddleY'] = 130
				elif data['message']['playerNo'] == 1 and room['players'][1]['inside'] == False:
					if player['paddleY'] + 70 > 390:
						player['paddleY'] = 320
				elif data['message']['playerNo'] == 3 and room['players'][3]['inside'] == True:
					if player['paddleY'] + 70 > 200:
						player['paddleY'] = 130
				elif data['message']['playerNo'] == 3 and room['players'][3]['inside'] == False:
					if player['paddleY'] + 70 > 390:
						player['paddleY'] = 320

async def move_mouse_mp(self, data, rooms):
	room = rooms.get(data['message']['roomID'])
	if room:
		player = room['players'][data['message']['playerNo'] - 1]
		player['paddleY'] = data['message']['distance'] - 35
		if data['message']['playerNo'] == 1 or data['message']['playerNo'] == 3:
			if player['paddleY'] < 10:
				player['paddleY'] = 10
			else:
				if data['message']['playerNo'] == 1:
					if room['players'][1]['inside']:
						if player['paddleY'] + 70 > 200:
							player['paddleY'] = 130
					else:
						if player['paddleY'] + 70 > 390:
							player['paddleY'] = 320
				else:
					if room['players'][3]['inside']:
						if player['paddleY'] + 70 > 200:
							player['paddleY'] = 130
					else:
						if player['paddleY'] + 70 > 390:
							player['paddleY'] = 320
		else:
			if player['paddleY'] + 70 > 390:
				player['paddleY'] = 320
			else:
				if data['message']['playerNo'] == 2:
					if room['players'][0]['inside']:
						if player['paddleY'] < 200:
							player['paddleY'] = 200
					else:
						if player['paddleY'] < 10:
							player['paddleY'] = 10
				else:
					if room['players'][2]['inside']:
						if player['paddleY'] < 200:
							player['paddleY'] = 200
					else:
						if player['paddleY'] < 10:
							player['paddleY'] = 10

async def changed_page_mp(self, data, rooms):
	message = data['message']
	room = rooms.get(str(message['roomID']))
	inactivePlayers = 0
	count = 0
	player_index = 0

	##printf"user received is : {message['user']}")
	if room:
		if room['status'] == 'started':
			for player in room['players']:
				if player['user'] == message['user']:
					##printf"room result is : {room}, user is : {message['user']}")
					player['state'] = 'inactive'
					player_index = count
				if player['state'] == 'inactive':
					inactivePlayers += 1
				count += 1
			if inactivePlayers == 4:
				room['status'] = 'aborted'
				for player in room['players']:
					player['state'] = 'finished'
			else:
				# if (room['players'][0]['state'] == 'inactive' and room['players'][1]['state'] == 'inactive') or (room['players'][2]['state'] == 'inactive' and room['players'][3]['state'] == 'inactive'):
				asyncio.create_task(cdBeforeEndingGame(self, message['roomID'], rooms, player_index))
				# else:
				#     return

async def cdBeforeEndingGame(self, roomID, rooms, player_index):
	room = rooms.get(str(roomID))
	countdown = 10
	if room:
		for i in range(60):
			await asyncio.sleep(1)
			countdown -= 1
			if room['status'] == 'started' and ((room['players'][0]['state'] == 'inactive' and room['players'][1]['state'] == 'inactive') or (room['players'][2]['state'] == 'inactive' and room['players'][3]['state'] == 'inactive')):
				if countdown == 0:
					room['status'] = 'finished'
					if room['players'][0]['state'] == 'inactive' and room['players'][1]['state'] == 'inactive':
						room['players'][0]['status'] = 'loser'
						room['players'][1]['status'] = 'loser'
						room['players'][2]['status'] = 'winner'
						room['players'][3]['status'] = 'winner'
					elif room['players'][2]['state'] == 'inactive' and room['players'][3]['state'] == 'inactive':
						room['players'][0]['status'] = 'winner'
						room['players'][1]['status'] = 'winner'
						room['players'][2]['status'] = 'loser'
						room['players'][3]['status'] = 'loser'
					await asyncio.create_task(gameFinished(self, room))
					break
			elif room['players'][player_index]['state'] == 'inactive':
				if countdown == 0:
					room['players'][player_index]['inside'] = False
					await self.channel_layer.group_send(roomID, {
							'type': 'playerOut',
							'message': {
								'userNo': room['players'][player_index]['playerNo']
							}
						}
					)
			else:
				break

async def user_exited_mp(self, data, rooms):
	message = data['message']
	room = rooms.get(str(message['roomID']))

	index = 0
	if room:
		for player in room['players']:
			if player['user'] == message['user']:
				if (player['playerNo'] == 1 and room['players'][1]['inside'] == True or
					player['playerNo'] == 2 and room['players'][0]['inside'] == True or
					player['playerNo'] == 3 and room['players'][3]['inside'] == True or
					player['playerNo'] == 4 and room['players'][2]['inside'] == True):
					player['inside'] = False
					await self.channel_layer.group_discard(str(room['id']), self.channel_name)
					await self.channel_layer.group_send(str(room['id']), {
							'type': 'playerOut',
							'message': {
								'userNo': player['playerNo']
							}
						}
					)
				else:
					room['status'] = 'finished'
					if player['playerNo'] == 1 or player['playerNo'] == 2:
						room['winner'] = 2
						room['players'][0]['status'] = 'loser'
						room['players'][1]['status'] = 'loser'
						room['players'][2]['status'] = 'winner'
						room['players'][3]['status'] = 'winner'
					else:
						room['winner'] = 1
						room['players'][0]['status'] = 'winner'
						room['players'][1]['status'] = 'winner'
						room['players'][2]['status'] = 'loser'
						room['players'][3]['status'] = 'loser'
				return
			index += 1

async def invite_friend_mp(self, data, rooms, user_channels):
	##print"ENTER 1")
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	ip_address = os.getenv("IP_ADDRESS")
	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	##print"ENTER 14")
	for active_match in active_matches:
		sender = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=user1).first)()
		##print"ENTER 13")
		if sender:
			user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
			##print"ENTER 12")
			if not receiver:
				##print"ENTER 100")
				await sync_to_async(NotifPlayer.objects.create)(
					active_match = active_match,
					player = user2,
				)
				await sync_to_async(GameNotifications.objects.create)(
					active_match = active_match,
					user = user1,
					target = user2,
					mode="2vs2"
				)
				##print"ENTER 12")
				# if receiver and receiver.is_online and not receiver.is_playing:
				##print"ENTER 11")
				friend_channel_list = notifs_user_channels.get(user2.id)
				if friend_channel_list:
					usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
					for friend_channel in friend_channel_list:
						if friend_channel:
							##print"ENTER 10")
							# with user1.avatar.open('rb') as f:f
							#     image_data = base64.b64encode(f.read()).decode('utf-8')
							await self.channel_layer.send(friend_channel, {
								'type': 'receiveFriendGame',
								'message': {
									'user': data['message']['user'],
									'level': usermatchstats.level,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}",
									'roomID': active_match.room_id,
									'mode': '2vs2'
								}
							})
			return
	##print"ENTER 2")
	room_id = await generate_unique_room_id(self)
	await self.channel_layer.group_add(str(room_id), self.channel_name)
	##printf'ROOM_ID WHEN CREATING IS : {room_id}')
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.create)(
		mode = '2vs2',
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
		paddleY = 65,
		score = 0
	)
	##print"ENTER 3")
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
		friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
		##printfriend_channel)
		if friend_channel:
			await self.channel_layer.send(friend_channel, {
				'type': 'playingStatus',
				'message': {
					'user': user1.username,
					'is_playing': True
				}
			})
	receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
	##print"ENTER 4")
	if not receiver:
		await sync_to_async(NotifPlayer.objects.create)(
			active_match = active_match,
			player = user2,
		)
		await sync_to_async(GameNotifications.objects.create)(
			active_match = active_match,
			user = user1,
			target = user2,
			mode="2vs2"
		)
		##print"ENTER 5")
		# if receiver and receiver.is_online and not receiver.is_playing:
		##print"ENTER 6")
		friend_channel = user_channels.get(user2.id).channel_name if user2.id in user_channels else None
		friend_channel_list = notifs_user_channels.get(user2.id)
		if friend_channel_list:
			usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
			for friend_channel in friend_channel_list:
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'receiveFriendGame',
						'message': {
							'user': data['message']['user'],
							'level': usermatchstats.level,
							'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}" , 
							'roomID': room_id,
							'mode': '2vs2'
						}
					})
	waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user1))
	for waited_invite in waited_invites:
		await sync_to_async(waited_invite.delete)()
	player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user1))
	for player_notif in player_notifs:
		await sync_to_async(player_notif.delete)()

async def accept_game_invite_mp(self, data, rooms, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	for key, value in rooms.items():
		if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
			await self.send(text_data=json.dumps({
				'type': 'alreadyPlaying',
				'message': 'alreadyPlaying'
			}))
			return
		if value['players'][0]['user'] == data['message']['target'] or value['players'][1]['user'] == data['message']['target']:
			await self.send(text_data=json.dumps({
				'type': 'alreadyPlaying',
				'message': 'alreadyPlaying'
			}))
			return
	##print"ACCEPT 1")
	creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['roomID']).first)()
	# ##printf'DATA INFORMATIONS ARE : {data['message']}')
	if active_match:
		##print"ACCEPT 2")
		is_invited = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=friend).first)()
		# friend_match = await sync_to_async(FriendMatch.objects.filter(creator=creator).first)()
		if is_invited:
			##print"ACCEPT 3")
			player_states = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
			player = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			if player_states == 3:
				await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 4,
						paddleX = 685,
						paddleY = 265,
						score = 0
					)
				player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
				players = []
				users = []
				user_no = 1
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
						'inside': True,
						'total_hit': 0, ####### added
						'self_scored': 0, ####### added
						'tmp_scored': 0 ####### added
					})
					users.append({
						'name': player.username,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
						'level': player_match_statistics.level,
						'playerNo': user_no
					})
					user_no += 1
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
				##printroom)
				rooms[str(room['id'])] = room
				await self.channel_layer.group_add(str(room['id']), self.channel_name)
				await sync_to_async(active_match.delete)()
				await self.send(text_data=json.dumps({
					'type': 'goToGamingPage',
					'message': {
						'mode': '2vs2'
					}
				}))
				asyncio.create_task(set_game(self, room, users))
				friend.is_playing = True
				await sync_to_async(friend.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=friend))
				for user in friends:
					friend_id = await sync_to_async(lambda: user.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': friend.username,
								'is_playing': True
							}
						})
				waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=friend))
				for waited_invite in waited_invites:
					await sync_to_async(waited_invite.delete)()
				player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=friend))
				for player_notif in player_notifs:
					await sync_to_async(player_notif.delete)()
				return
				# player = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			else:
				if player_states == 1:
					await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 2,
						paddleX = 15,
						paddleY = 265,
						score = 0
					)
				elif player_states == 2:
					await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 3,
						paddleX = 685,
						paddleY = 65,
						score = 0
					)
				player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
				users = []
				for player_state in player_states:
					player = await sync_to_async(customuser.objects.filter(id=player_state.player_id).first)()
					player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
					users.append({
						'name': player.username,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
						'level': player_match_statistics.level,
						'playerNo': player_state.playerNo
					})
				await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
				await self.send(text_data=json.dumps({
					'type': 'goToGamingPage',
					'message': {
						'mode': '2vs2'
					}
				}))
				asyncio.create_task(waited_game(self, active_match.room_id, users))
				target = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
				target.is_playing = True
				await sync_to_async(target.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=friend))
				for user in friends:
					friend_id = await sync_to_async(lambda: user.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': friend.username,
								'is_playing': True
							}
						})
				waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=friend))
				for waited_invite in waited_invites:
					await sync_to_async(waited_invite.delete)()
				player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=friend))
				for player_notif in player_notifs:
					await sync_to_async(player_notif.delete)()

async def create_new_room_mp(self, data, rooms, user_channels):
	room_id = await generate_unique_room_id(self)
	# ##printf'ROOM_ID WHEN CREATING IS : {room_id}')
	user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.create)(
		mode = '2vs2',
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
		paddleY = 65,
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

async def join_new_room_mp(self, data, rooms, user_channels):
	room_code = (data['message']).get('roomCode')
	ip_address = os.getenv("IP_ADDRESS")
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=room_code).first)()
	if active_match:
		player_states = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
		user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
		if player_states == 3:
			await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'inactive',
					playerNo = 4,
					paddleX = 685,
					paddleY = 265,
					score = 0
				)
			player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
			players = []
			users = []
			user_no = 1
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
					'inside': True,
					'total_hit': 0, ####### added
					'self_scored': 0, ####### added
					'tmp_scored': 0 ####### added
				})
				users.append({
					'name': player.username,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
					'level': player_match_statistics.level,
					'playerNo': user_no
				})
				user_no += 1
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
			##printroom)
			rooms[str(room['id'])] = room
			await self.channel_layer.group_add(str(room['id']), self.channel_name)
			await sync_to_async(active_match.delete)()
			await self.send(text_data=json.dumps({
				'type': 'playerInfos',
				'message': {
					'playerNo': 4,
					'id': room['id'],
					'creator': False
				}
			}))
			asyncio.create_task(set_game(self, room, users))
			user.is_playing = True
			await sync_to_async(user.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
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
			return
			# player = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
		else:
			playerNo = -1
			if player_states == 1:
				await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'inactive',
					playerNo = 2,
					paddleX = 15,
					paddleY = 265,
					score = 0
				)
				playerNo = 2
			elif player_states == 2:
				await sync_to_async(PlayerState.objects.create)(
					active_match = active_match,
					player = user,
					state = 'inactive',
					playerNo = 3,
					paddleX = 685,
					paddleY = 65,
					score = 0
				)
				playerNo = 3
			player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
			users = []
			for player_state in player_states:
				player = await sync_to_async(customuser.objects.filter(id=player_state.player_id).first)()
				player_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player).first)()
				users.append({
					'name': player.username,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{player.avatar.url}",
					'level': player_match_statistics.level,
					'playerNo': player_state.playerNo
				})
			await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
			await self.send(text_data=json.dumps({
				'type': 'playerInfos',
				'message': {
					'playerNo': playerNo,
					'id': active_match.room_id,
					'creator': False
				}
			}))
			asyncio.create_task(waited_game(self, active_match.room_id, users))
			user.is_playing = True
			await sync_to_async(user.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name  if friend_id in user_channels else None
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