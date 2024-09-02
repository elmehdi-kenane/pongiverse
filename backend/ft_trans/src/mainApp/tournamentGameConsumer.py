import math
import json
import random
import base64
import asyncio
import datetime
from chat.models import Friends
from myapp.models import customuser
from asgiref.sync import sync_to_async
from .gameMultiplayerConsumers import waited_game
from .models import Match, ActiveMatch, PlayerState, NotifPlayer, GameNotifications, MatchStatistics, UserMatchStatics, TournamentMembers, Tournament, TournamentUserInfo, Round, DisplayOpponent
from Notifications.common import notifs_user_channels
from .common import user_channels
from . import tournament_consumers
from Notifications import tournament_notifs_consumers
import os


async def move_paddle_tournament_game(self, data, tournament_rooms):
	message = data['message']
	room = {}
	user = await sync_to_async(customuser.objects.filter(username=message['user']).first)()
	tournament_id = await get_tournament_id(user)
	if tournament_id != 0:
		room = await get_right_room(tournament_id, tournament_rooms, message['user'])
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

async def move_mouse_tournament_game(self, data, tournament_rooms):
	message = data['message']
	room = {}
	user = await sync_to_async(customuser.objects.filter(username=message['user']).first)()
	tournament_id = await get_tournament_id(user)
	if tournament_id != 0:
		room = await get_right_room(tournament_id, tournament_rooms, message['user'])
	if room:
		player = room['players'][data['message']['playerNo'] - 1]
		player['paddleY'] = data['message']['distance'] - 35
		if player['paddleY'] < 10:
			player['paddleY'] = 10
		elif player['paddleY'] + 70 > 390:
			player['paddleY'] = 320

async def starttimer(self, room):
	while True:
		if room and room['status'] != 'started':
			break
		room['time'] += 1
		await asyncio.sleep(1)

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
				'rating': [player1_rating, player2_rating]
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


async def send_users_infos(self, room_id, users):
	await self.channel_layer.group_send(str(room_id), {
			'type': 'playersInfos',
			'message': {
				'users': users
			}
		}
	)

async def users_infos(self, room_id, users):
	await asyncio.create_task(send_users_infos(self, room_id, users))


async def delete_spicific_room(tournament_rooms, room, tournament_id):
	t_rooms = tournament_rooms.get(str(tournament_id))
	del t_rooms[room['id']]

async def get_next_round_reached(user, tournament):
	rounds = ['ROUND 16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'WINNER']
	my_dict = {}
	tournamentuserinfo = await sync_to_async(TournamentUserInfo.objects.filter(user=user).last)()### NOTE: to checkkkkkkkk last
	round_type = await sync_to_async(lambda: tournamentuserinfo.round.type)()
	index_of_round = rounds.index(round_type)
	if index_of_round != 4:
		prev_pos = await sync_to_async(lambda: tournamentuserinfo.position)()
		if prev_pos % 2 == 0:
			my_dict = {'round_reached': rounds[index_of_round + 1], 'position': prev_pos/2}
		else:
			my_dict = {'round_reached': rounds[index_of_round + 1], 'position': (prev_pos + 1)/2}
	else:
		my_dict = {'round_reached': rounds[index_of_round]}
	return my_dict

async def get_actual_round_reached(tournament):
	round = await sync_to_async(Round.objects.filter(tournament=tournament).last)()
	round_type = await sync_to_async(lambda: round.type)()
	return round_type


async def send_playing_status_to_friends(self, user, status, user_channels):
	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
	for friend in friends:
		friend_name = await sync_to_async(lambda: friend.friend.username)()
		friend_channel = user_channels.get(friend_name)
		if friend_channel:
			await self.channel_layer.send(friend_channel, {
				'type': 'playingStatus',
				'message': {
					'user': user.username,
					'is_playing': status,
					'userInfos': {
						'id': user.id,
						'name': user.username,
						'level': 2,
						'image': user.avatar.path
						# {'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path}
					}
				}
			})
async def discard_channels_from_tournament_group(self, player, tournament):
	group_name = f'tournament_{tournament.tournament_id}'
	channel_name = user_channels.get(player.username)
	channel_name_notif_list = notifs_user_channels.get(player.username)
	if channel_name:
		await self.channel_layer.group_discard(group_name, channel_name)
	if channel_name_notif_list:
		for channel_name in channel_name_notif_list:
			await self.channel_layer.group_discard(group_name, channel_name)


async def send_winner_data(self, user, round_reached, tournament):
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	ip_address = os.getenv("IP_ADDRESS")
	for member in members:
		is_eliminated = await sync_to_async(lambda: member.is_eliminated)
		if is_eliminated == False:
			groupe_name = f'tournament_{tournament.tournament_id}'
			await self.channel_layer.group_send(groupe_name, {
				'type': 'new_user_win',
				'message': {
					"id" : user.id,
					"name": user.username,
					"level" : user.level,
					"image" : f"http://{ip_address}:8000/auth{user.avatar.url}",
					"round_reached": round_reached['round_reached'],
					"position": round_reached['position']
				}
			})


async def runOverGame(self, room, ballProps, tournament_rooms, user_channels, tournament_id):
	while True:
		room["ball"]["ballX"] += ballProps["velocityX"]
		room["ball"]["ballY"] += ballProps["velocityY"]
		if room['status'] == 'finished':
			await sync_to_async(DisplayOpponent.objects.all().delete)()
			await delete_spicific_room(tournament_rooms, room, tournament_id)
			player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
			player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
			tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
			if room['players'][0]['status'] == 'loser': ### NOTE: to thinks later about this point
				print("PLAYER 1 LOSE THE GAME")
				tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=player1, tournament=tournament).first)()
				if tournamentMember:
					tournamentMember.is_eliminated = True
					await sync_to_async(tournamentMember.save)()
					is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
					if is_owner == True:
						tournamentMember2 = await sync_to_async(TournamentMembers.objects.filter(user=player2, tournament=tournament).first)()
						tournamentMember2.is_owner = True
						await sync_to_async(tournamentMember2.save)()
				player1.is_playing = False
				await sync_to_async(player1.save)()
				await discard_channels_from_tournament_group(self, player1, tournament)
				await send_playing_status_to_friends(self, player1, False, user_channels)
				channel_name = user_channels.get(room['players'][0]['user'])
				if channel_name:
					await self.channel_layer.send(channel_name, {
						'type': 'youLoseTheGame',
					})
			else:
				round_reached = await get_next_round_reached(player1, tournament)
				await send_winner_data(self, player1, round_reached, tournament)
				if round_reached['round_reached'] == 'WINNER':
					round = Round(tournament=tournament, type='WINNER')
					await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player1, position=1)
					await sync_to_async(tournamentuserinfo.save)()
					tournament.is_finished = True
					await sync_to_async(tournament.save)()
					player1.is_playing = False
					await sync_to_async(player1.save)()
					await send_playing_status_to_friends(self, player1, False, user_channels)
				else: ### NOTE: to think more
					# round = await sync_to_async(Round.objects.filter(tournament=tournament, type=round_reached['round_reached']).first)()
					# if round is None:
					# 	round = Round(tournament=tournament, type=round_reached['round_reached'])
					# 	await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player1, position=round_reached['position'])
					await sync_to_async(tournamentuserinfo.save)()
					channel_name = user_channels.get(room['players'][0]['user'])
					if channel_name:
						await self.channel_layer.send(channel_name, {
							'type': 'youWinTheGame',
						})
				actual_round = await get_actual_round_reached(tournament)
				the_round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
				tournamentuserinfocount = await sync_to_async(TournamentUserInfo.objects.filter(round=the_round).count)()
				if (actual_round == 'QUARTERFINAL' and tournamentuserinfocount == 8) or (actual_round == 'SEMIFINAL' and tournamentuserinfocount == 4) or (actual_round == 'FINAL' and tournamentuserinfocount == 2):
					await tournament_notifs_consumers.OtherRounds(self, actual_round, tournament)
			if room['players'][1]['status'] == 'loser': ### NOTE: to thinks later about this point
				print("PLAYER 2 LOSE THE GAME")
				tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=player2, tournament=tournament).first)()
				if tournamentMember:
					tournamentMember.is_eliminated = True
					await sync_to_async(tournamentMember.save)()
					is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
					if is_owner == True:
						tournamentMember1 = await sync_to_async(TournamentMembers.objects.filter(user=player1, tournament=tournament).first)()
						tournamentMember1.is_owner = True
						await sync_to_async(tournamentMember1.save)()
				player2.is_playing = False
				await sync_to_async(player2.save)()
				await send_playing_status_to_friends(self, player2, False, user_channels)
				await discard_channels_from_tournament_group(self, player2, tournament)
				channel_name = user_channels.get(room['players'][1]['user'])
				if channel_name:
					await self.channel_layer.send(channel_name, {
						'type': 'youLoseTheGame',
					})
			else: ### NOTE:   check to pass to the next round
				round_reached = await get_next_round_reached(player2, tournament)
				await send_winner_data(self, player2, round_reached, tournament)
				if round_reached['round_reached'] == 'WINNER':
					round = Round(tournament=tournament, type='WINNER')
					await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player2, position=1)
					await sync_to_async(tournamentuserinfo.save)()
					tournament.is_finished = True
					await sync_to_async(tournament.save)()
					player2.is_playing = False
					await sync_to_async(player2.save)()
					await send_playing_status_to_friends(self, player2, False, user_channels)
				else: ### NOTE: to think more
					print("PLAYER 2 WON THE GAME")
					round = await sync_to_async(Round.objects.filter(tournament=tournament, type=round_reached['round_reached']).first)()
					if round is None:
						round = Round(tournament=tournament, type=round_reached['round_reached'])
						await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player2, position=round_reached['position'])
					await sync_to_async(tournamentuserinfo.save)()
					channel_name = user_channels.get(room['players'][1]['user'])
					if channel_name:
						await self.channel_layer.send(channel_name, {
							'type': 'youWinTheGame',
						})
				actual_round = await get_actual_round_reached(tournament)
				the_round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
				tournamentuserinfocount = await sync_to_async(TournamentUserInfo.objects.filter(round=the_round).count)()
				if (actual_round == 'QUARTERFINAL' and tournamentuserinfocount == 8) or (actual_round == 'SEMIFINAL' and tournamentuserinfocount == 4) or (actual_round == 'FINAL' and tournamentuserinfocount == 2):
					await tournament_notifs_consumers.OtherRounds(self, actual_round, tournament)
			# player1_rating = 0
			# player2_rating = 0
			# round_reached_1 = await get_next_round_reached(player1, tournament)
			# round_reached_2 = await get_next_round_reached(player2, tournament)
			# if room['players'][0]['score'] > room['players'][1]['score']: #### NOTE: in case of last round or semi final round
			# 		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
			# 		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
			# else:
			# 		player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
			# 		player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
			# player1_totalXP = player1.total_xp + player1_rating
			# player1.level += (player1_totalXP / 1000)
			# player1.total_xp = (player1_totalXP % 1000)
			# await sync_to_async(player1.save)()
			# player2_totalXP = player2.total_xp + player2_rating
			# player2.level += (player2_totalXP / 1000)
			# player2.total_xp = (player2_totalXP % 1000)
			# await sync_to_async(player2.save)()
			#NOTE: here check the size of round to start the next round
			return
		if room["ball"]["ballY"] + 7 > 390 or room["ball"]["ballY"] - 7 < 10: ## was 10 now 11 just for the stucking
			ballProps["velocityY"] *= -1
		if room["ball"]["ballY"] - 7 < 10:
			room["ball"]["ballY"] += 5
		if room["ball"]["ballY"] + 7 > 390:
			room["ball"]["ballY"] -= 5
			# ballProps["velocityX"] *= -1
		player = [room["players"][0], 0] if room["ball"]["ballX"] < 355 else [room['players'][1], 1]
		# #print(f"speed : {ballProps['speed']}")
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
				print("PLAYER 1 IS WIN THE GAMEEE")
				await sync_to_async(DisplayOpponent.objects.all().delete)()
				room['winner'] = 1
				room['status'] = 'finished'
				room['players'][0]['status'] = 'winner'
				room['players'][1]['status'] = 'loser'
				player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
				player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
				tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
				tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=player2, tournament=tournament).first)()
				if tournamentMember:
					tournamentMember.is_eliminated = True
					await sync_to_async(tournamentMember.save)()
					player2.is_playing = False
					await sync_to_async(player2.save)()
					is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
					if is_owner == True:
						tournamentMember1 = await sync_to_async(TournamentMembers.objects.filter(user=player1, tournament=tournament).first)()
						tournamentMember1.is_owner = True
						await sync_to_async(tournamentMember1.save)()
				await send_playing_status_to_friends(self, player2, False, user_channels)
				await discard_channels_from_tournament_group(self, player2, tournament)
				channel_name = user_channels.get(room['players'][1]['user'])
				if channel_name:
					await self.channel_layer.send(channel_name, {
						'type': 'youLoseTheGame',
					})
				round_reached = await get_next_round_reached(player1, tournament)
				if round_reached['round_reached'] == 'WINNER':
					round = Round(tournament=tournament, type='WINNER')
					await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player1, position=1)
					await sync_to_async(tournamentuserinfo.save)()
					tournament.is_finished = True
					await sync_to_async(tournament.save)()
					player1.is_playing = False
					await sync_to_async(player1.sava)()
					await send_playing_status_to_friends(self, player1, False, user_channels)
				else: ### NOTE: to think more
					print("*************** KAN HNAA")
					round = await sync_to_async(Round.objects.filter(tournament=tournament, type=round_reached['round_reached']).first)()
					if round is None:
						round = Round(tournament=tournament, type=round_reached['round_reached'])
						await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player1, position=round_reached['position'])
					await sync_to_async(tournamentuserinfo.save)()
					channel_name = user_channels.get(room['players'][0]['user'])
					if channel_name:
						await self.channel_layer.send(channel_name, {
							'type': 'youWinTheGame',
						})
				# NOTE: handle the game is finished and player win the game
				# await gameFinished(self, room) ### TODO: send message for navigating instead of this funcking function
				actual_round = await get_actual_round_reached(tournament)
				the_round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
				tournamentuserinfocount = await sync_to_async(TournamentUserInfo.objects.filter(round=the_round).count)()
				if (actual_round == 'QUARTERFINAL' and tournamentuserinfocount == 8) or (actual_round == 'SEMIFINAL' and tournamentuserinfocount == 4) or (actual_round == 'FINAL' and tournamentuserinfocount == 2):
					print("////////////// hello")
					await tournament_notifs_consumers.OtherRounds(self, actual_round, tournament)
				await delete_spicific_room(tournament_rooms, room, tournament_id)
				# player1_rating = 0
				# player2_rating = 0
				# if room['players'][0]['score'] > room['players'][1]['score']: #NOTE: in case of final
				# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
				# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
				# else:
				# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
				# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
				# player1_totalXP = player1.total_xp + player1_rating
				# player1.level += (player1_totalXP / 1000)
				# player1.total_xp = (player1_totalXP % 1000)
				# await sync_to_async(player1.save)()
				# player2_totalXP = player2.total_xp + player2_rating
				# player2.level += (player2_totalXP / 1000)
				# player2.total_xp = (player2_totalXP % 1000)
				# await sync_to_async(player2.save)()
				# group_channels = await sync_to_async(self.channel_layer.group_channels)(str(room['id'])) #######################
				# for channel_name in group_channels: #######################
				#     sync_to_async(self.channel_layer.group_discard)(str(room['id']), channel_name) #######################
				return
			elif room['players'][1]['score'] == 5:
				print("PLAYER 2 IS WIN THE GAMEEE")
				room['winner'] = 2
				room['status'] = 'finished'
				room['players'][1]['status'] = 'winner'
				room['players'][0]['status'] = 'loser'
				await sync_to_async(DisplayOpponent.objects.all().delete)()
				player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
				player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
				tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
				tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=player1, tournament=tournament).first)()
				if tournamentMember:
					tournamentMember.is_eliminated = True
					await sync_to_async(tournamentMember.save)()
					player1.is_playing = False
					await sync_to_async(player1.save)()
					is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
					if is_owner == True:
						tournamentMember2 = await sync_to_async(TournamentMembers.objects.filter(user=player2, tournament=tournament).first)()
						tournamentMember2.is_owner = True
						await sync_to_async(tournamentMember2.save)()
				await send_playing_status_to_friends(self, player1, False, user_channels)
				await discard_channels_from_tournament_group(self, player1, tournament)
				channel_name = user_channels.get(room['players'][0]['user'])
				if channel_name:
					await self.channel_layer.send(channel_name, {
						'type': 'youLoseTheGame',
					})
				round_reached = await get_next_round_reached(player2, tournament)
				if round_reached['round_reached'] == 'WINNER':
					round = Round(tournament=tournament, type='WINNER')
					await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player2, position=1)
					await sync_to_async(tournamentuserinfo.save)()
					tournament.is_finished = True
					await sync_to_async(tournament.save)()
					player2.is_playing = False
					await sync_to_async(player2.save)()
					await send_playing_status_to_friends(self, player2, False, user_channels)
				else: ### NOTE: to think more
					round = await sync_to_async(Round.objects.filter(tournament=tournament, type=round_reached['round_reached']).first)()
					if round is None:
						round = Round(tournament=tournament, type=round_reached['round_reached'])
					await sync_to_async(round.save)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=player2, position=round_reached['position'])
					await sync_to_async(tournamentuserinfo.save)()
					channel_name = user_channels.get(room['players'][1]['user'])
					if channel_name:
						await self.channel_layer.send(channel_name, {
							'type': 'youWinTheGame',
						})
				actual_round = await get_actual_round_reached(tournament)
				the_round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
				tournamentuserinfocount = await sync_to_async(TournamentUserInfo.objects.filter(round=the_round).count)()
				if (actual_round == 'QUARTERFINAL' and tournamentuserinfocount == 8) or (actual_round == 'SEMIFINAL' and tournamentuserinfocount == 4) or (actual_round == 'FINAL' and tournamentuserinfocount == 2):
					await tournament_notifs_consumers.OtherRounds(self, actual_round, tournament)
				# NOTE: handle the game is finished and player win the game
				# await gameFinished(self, room) ### TODO: send message for navigating instead of this funcking function
				await delete_spicific_room(tournament_rooms, room, tournament_id)
				# match = await sync_to_async(Match.objects.create)(
				# 	mode = room['mode'],
				# 	room_id = room['id'],
				# 	team1_player1 = player1,
    
				# 	team2_player1 = player2,
				# 	team1_score = room['players'][0]['score'],
				# 	team2_score =  room['players'][1]['score'],
				# 	team1_status = room['players'][0]['status'],
				# 	team2_status = room['players'][1]['status'],
				# 	date_started = room['date_started'],
				# 	date_ended = datetime.datetime.now().isoformat(),
				# 	match_status = room['status'],
				# 	duration=room['time']
				# )
				player1_rating = 0
				player2_rating = 0
				# if room['players'][0]['score'] > room['players'][1]['score']:
				# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
				# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
				# else:
				# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
				# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
				# await sync_to_async(MatchStatistics.objects.create)(
				# 	match=match,
				# 	team1_player1_score=room['players'][0]['self_scored'],
				# 	team2_player1_score=room['players'][1]['self_scored'],
				# 	team1_player1_hit=room['players'][0]['hit'],
				# 	team2_player1_hit=room['players'][1]['hit'],
				# 	team1_player1_rating=player1_rating,
				# 	team2_player1_rating=player2_rating,
				# )
				# player1_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player1).first)()
				# player2_match_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=player2).first)()
				# if room['players'][0]['score'] > room['players'][1]['score']:
				# 	if player1_match_statistics:
				# 		player1_match_statistics.wins += 1
				# 		player1_totalXP = player1_match_statistics.total_xp + player1_rating
				# 		player1_match_statistics.level += (player1_totalXP / 1000)
				# 		player1_match_statistics.total_xp = (player1_totalXP % 1000)
				# 		player1_match_statistics.goals += room['players'][0]['score']
				# 		await sync_to_async(player1_match_statistics.save)()
				# 		if player2_match_statistics:
				# 			player2_match_statistics.losts += 1
				# 			player2_totalXP = player2_match_statistics.total_xp + player2_rating
				# 			player2_match_statistics.level += (player2_totalXP / 1000)
				# 			player2_match_statistics.total_xp = (player2_totalXP % 1000)
				# 			player2_match_statistics.goals += room['players'][1]['score']
				# 			await sync_to_async(player2_match_statistics.save)()
				# 		else:
				# 			await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player2,
				# 			wins=0,
				# 			losts=1,
				# 			level=0,
				# 			total_xp=player2_rating,
				# 			goals=room['players'][1]['score']
				# 		)
				# 	else:
				# 		await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player1,
				# 			wins=1,
				# 			losts=0,
				# 			level=0,
				# 			total_xp=player1_rating,
				# 			goals=room['players'][0]['score']
				# 		)
				# 		if player2_match_statistics:
				# 			player2_match_statistics.losts += 1
				# 			player2_totalXP = player2_match_statistics.total_xp + player2_rating
				# 			player2_match_statistics.level += (player2_totalXP / 1000)
				# 			player2_match_statistics.total_xp = (player2_totalXP % 1000)
				# 			player2_match_statistics.goals += room['players'][1]['score']
				# 			await sync_to_async(player2_match_statistics.save)()
				# 		else:
				# 			await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player2,
				# 			wins=0,
				# 			losts=1,
				# 			level=0,
				# 			total_xp=player2_rating,
				# 			goals=room['players'][1]['score']
				# 		)
				# else:
				# 	if player2_match_statistics:
				# 		player2_match_statistics.wins += 1
				# 		player2_totalXP = player2_match_statistics.total_xp + player2_rating
				# 		player2_match_statistics.level += (player2_totalXP / 1000)
				# 		player2_match_statistics.total_xp = (player2_totalXP % 1000)
				# 		player2_match_statistics.goals += room['players'][1]['score']
				# 		await sync_to_async(player2_match_statistics.save)()
				# 		if player1_match_statistics:
				# 			player1_match_statistics.losts += 1
				# 			player1_totalXP = player1_match_statistics.total_xp + player1_rating
				# 			player1_match_statistics.level += (player1_totalXP / 1000)
				# 			player1_match_statistics.total_xp = (player1_totalXP % 1000)
				# 			player1_match_statistics.goals += room['players'][0]['score']
				# 			await sync_to_async(player1_match_statistics.save)()
				# 		else:
				# 			await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player1,
				# 			wins=0,
				# 			losts=1,
				# 			level=0,
				# 			total_xp=player1_rating,
				# 			goals=room['players'][0]['score']
				# 		)
				# 	else:
				# 		await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player2,
				# 			wins=1,
				# 			losts=0,
				# 			level=0,
				# 			total_xp=player2_rating,
				# 			goals=room['players'][1]['score']
				# 		)
				# 		if player1_match_statistics:
				# 			player1_match_statistics.losts += 1
				# 			player1_totalXP = player1_match_statistics.total_xp + player1_rating
				# 			player1_match_statistics.level += (player1_totalXP / 1000)
				# 			player1_match_statistics.total_xp = (player1_totalXP % 1000)
				# 			player1_match_statistics.goals += room['players'][0]['score']
				# 			await sync_to_async(player1_match_statistics.save)()
				# 		else:
				# 			await sync_to_async(UserMatchStatics.objects.create)(
				# 			player=player1,
				# 			wins=0,
				# 			losts=1,
				# 			level=0,
				# 			total_xp=player1_rating,
				# 			goals=room['players'][0]['score']
				# 		)
				# player1_totalXP = player1.total_xp + player1_rating
				# player1.level += (player1_totalXP / 1000)
				# player1.total_xp = (player1_totalXP % 1000)
				# await sync_to_async(player1.save)()
				# player2_totalXP = player2.total_xp + player2_rating
				# player2.level += (player2_totalXP / 1000)
				# player2.total_xp = (player2_totalXP % 1000)
				# await sync_to_async(player2.save)()
				# group_channels = await sync_to_async(self.channel_layer.group_channels)(str(room['id'])) #######################
				# for channel_name in group_channels: #######################
				#     sync_to_async(self.channel_layer.group_discard)(str(room['id']), channel_name) #######################
				return
			break
		await asyncio.create_task(updatingGame(self, room))
		await asyncio.sleep(0.020)
	await runOverGame(self, room, ballProps, tournament_rooms, user_channels, tournament_id)


async def startGame(self, data, tournament_rooms, user_channels, room, tournament_id):
	ballProps = {
		"velocityX": 5,
		"velocityY": 5,
		"speed": 5
	}
	await asyncio.create_task(runOverGame(self, room, ballProps, tournament_rooms, user_channels, tournament_id))


async def get_tournament_id(user):
	tournament_id = 0
	members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
	for member in members:
		is_started = await sync_to_async(lambda: member.tournament.is_started)()
		is_finished = await sync_to_async(lambda:  member.tournament.is_finished)()
		is_eliminated = await sync_to_async(lambda: member.is_eliminated)()
		if is_started == False or (is_started == True and is_finished == False and is_eliminated == False):
			tournament_id = await sync_to_async(lambda: member.tournament.tournament_id)()
			return tournament_id
	return 0

async def get_right_room(tournament_id, tournament_rooms, username):
    room = {}
    t_rooms = tournament_rooms.get(str(tournament_id))
    if t_rooms:
        for room_id, the_room in t_rooms.items():
            if any(player['user'] == username for player in the_room.get('players', [])):
                return the_room
    return room

async def validatePlayerTournamentGame(self, data, tournament_rooms, user_channels):
	message = data['message']
	room = {}
	user = await sync_to_async(customuser.objects.filter(username=message['user']).first)()
	tournament_id = await get_tournament_id(user)
	if tournament_id != 0:
		room = await get_right_room(tournament_id, tournament_rooms, message['user'])
		playersReady = 0
		playerIsIn = False
		playerNo = 0
		if room:
			for player in room['players']:
				if player['user'] == message['user']:
					playerIsIn = True
					await self.channel_layer.group_add(str(room['id']), self.channel_name)
					if room['status'] == 'notStarted':
						room['status'] = 'started'
						print("---------------------- YESSSSSS: ", room)
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
						asyncio.create_task(startGame(self, data, tournament_rooms, user_channels, room, tournament_id))
						player['state'] = 'playing'
						users = []
						for player in room['players']:
							player = await sync_to_async(customuser.objects.filter(username=player['user']).first)()
							if (player):
								with player.avatar.open('rb') as f:
									users.append({
										'name': player.username,
										'avatar': base64.b64encode(f.read()).decode('utf-8'),
										'level': 2.4
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
						# #print(room)
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
							if (player):
								with player.avatar.open('rb') as f:
									users.append({
										'name': player.username,
										'avatar': base64.b64encode(f.read()).decode('utf-8'),
										'level': 2.4
									})
						await self.send(text_data=json.dumps({
							'type': 'playersInfos',
							'message': {
								'users': users
							}
						}))
						asyncio.create_task(users_infos(self, room['id'], users))
						return
					# elif room['status'] == 'aborted':
					# 	player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
					# 	player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
					# 	# #print("GAME IS ALREADY ABORTED")
					# 	await self.send(text_data=json.dumps({
					# 		'type': 'abortedGame',
					# 		'message': {
					# 			'playerNo': player['playerNo'],
					# 			'user1' : room['players'][0]['user'],
					# 			'user2' : room['players'][1]['user'],
					# 			'playerScore1' : room['players'][0]['score'],
					# 			'playerScore2' : room['players'][1]['score'],
					# 			'time': room['time'],
					# 			'score': [room['players'][0]['score'], room['players'][1]['score']],
					# 			'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
					# 			'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
					# 			'accuracy': [player1_accuracy, player2_accuracy],
					# 			'rating': [0, 0]
					# 		}
					# 	}))
					# 	return
					elif room['status'] == 'finished':
						# if room['players'][0]['score'] > room['players'][1]['score']: ### NOTE: add exp just for final round
						# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * 0.5)
						# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * -0.5)
						# else:
						# 	player1_rating = (room['players'][0]['self_scored'] * 20) + (room['players'][0]['self_scored'] * -0.5)
						# 	player2_rating = (room['players'][1]['self_scored'] * 20) + (room['players'][1]['self_scored'] * 0.5)
						# player1_accuracy = (room['players'][0]['self_scored'] * room['players'][0]['hit']) / 100
						# player2_accuracy = (room['players'][1]['self_scored'] * room['players'][1]['hit']) / 100
						# await self.send(text_data=json.dumps({
						# 	'type': 'finishedGame',
						# 	'message': {
						# 		'playerNo': player['playerNo'],
						# 		'user1' : room['players'][0]['user'],
						# 		'user2' : room['players'][1]['user'],
						# 		'playerScore1' : room['players'][0]['score'],
						# 		'playerScore2' : room['players'][1]['score'],
						# 		'time': room['time'],
						# 		'score': [room['players'][0]['score'], room['players'][1]['score']],
						# 		'selfScore': [room['players'][0]['self_scored'], room['players'][1]['self_scored']],
						# 		'hit': [room['players'][0]['hit'], room['players'][1]['hit']],
						# 		'accuracy': [player1_accuracy, player2_accuracy],
						# 		'rating': [player1_rating, player2_rating]
						# 	}
						# }))
						return
			if playerIsIn == False:
				await self.send(text_data=json.dumps({
					'type': 'notAuthorized',
					'message': 'notAuthorized'
				}))
				return
			# for player in room['players']:
			#     if player['user'] == message['user']:
			#         player['state'] = 'inactive'
			#         playerNo = player['playerNo']
			#     if player['state'] == 'inactive':
			#         playersReady += 1
			# # #print(playerNo)
			# await self.send(text_data=json.dumps({
			#     'type': 'setupGame',
			#     'message': {
			#         'playerNo': playerNo,
			#         'user1' : room['players'][0]['user'],
			#         'user2' : room['players'][1]['user'],
			#     }
			# }))
			# if playersReady == 2:
			#     tournament_rooms[str(room['id'])]['status'] = 'started'
			#     for player in room['players']:
			#         player['state'] = 'playing'
			#     asyncio.create_task(startGame(self, data, tournament_rooms, user_channels))
		# else:
		# 	try:
		# 		match_played = await sync_to_async(Match.objects.get)(room_id=message['roomID'])
		# 		match_statistics = await sync_to_async(MatchStatistics.objects.get)(match=match_played)
		# 		player1_username = await sync_to_async(lambda:match_played.team1_player1.username)()
		# 		player2_username = await sync_to_async(lambda:match_played.team2_player1.username)()
		# 		player1 = await sync_to_async(customuser.objects.filter(username=player1_username).first)()
		# 		player2 = await sync_to_async(customuser.objects.filter(username=player2_username).first)()
		# 		users = []
		# 		# if match_played.match_status == 'aborted':
		# 		# 	player1_accuracy = (match_statistics.team1_player1_score * match_statistics.team1_player1_hit) / 100
		# 		# 	player2_accuracy = (match_statistics.team2_player1_score * match_statistics.team2_player1_hit) / 100
		# 		# 	await self.send(text_data=json.dumps({
		# 		# 		'type': 'abortedGame',
		# 		# 		'message': {
		# 		# 			'user1' : player1_username,
		# 		# 			'user2' : player2_username,
		# 		# 			'playerScore1' : match_played.team1_score,
		# 		# 			'playerScore2' : match_played.team2_score,
		# 		# 			'time': match_played.duration,
		# 		# 			'score': [match_played.team1_score, match_played.team2_score],
		# 		# 			'selfScore': [match_statistics.team1_player1_score, match_statistics.team2_player1_score,],
		# 		# 			'hit': [match_statistics.team1_player1_hit, match_statistics.team2_player1_hit],
		# 		# 			'accuracy': [player1_accuracy, player2_accuracy],
		# 		# 			'rating': [0, 0]
		# 		# 		}
		# 		# 	}))
		# 		# 	with player1.avatar.open('rb') as f:
		# 		# 		users.append({
		# 		# 			'name': player1_username,
		# 		# 			'avatar': base64.b64encode(f.read()).decode('utf-8'),
		# 		# 			'level': 2.4
		# 		# 		})
		# 		# 	with player2.avatar.open('rb') as f:
		# 		# 		users.append({
		# 		# 			'name': player2_username,
		# 		# 			'avatar': base64.b64encode(f.read()).decode('utf-8'),
		# 		# 			'level': 2.4
		# 		# 		})
		# 		# 	await self.send(text_data=json.dumps({
		# 		# 		'type': 'playersInfos',
		# 		# 		'message': {
		# 		# 			'users': users
		# 		# 		}
		# 		# 	}))
		# 		# if match_played.match_status == 'finished': ###NOTE: HANDLE FINSHED HERE
		# 			# if match_played.team1_score > match_played.team2_score:
		# 			# 	player1_rating = (match_statistics.team1_player1_score * 20) + (match_statistics.team1_player1_score * 0.5)
		# 			# 	player2_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * -0.5)
		# 			# else:
		# 			# 	player1_rating = (match_statistics.team1_player1_score * 20) + (match_statistics.team1_player1_score * -0.5)
		# 			# 	player2_rating = (match_statistics.team2_player1_score * 20) + (match_statistics.team2_player1_score * 0.5)
		# 			# player1_accuracy = (match_statistics.team1_player1_score * match_statistics.team1_player1_hit) / 100
		# 			# player2_accuracy = (match_statistics.team2_player1_score * match_statistics.team2_player1_hit) / 100
		# 			# await self.send(text_data=json.dumps({
		# 			# 	'type': 'finishedGame',
		# 			# 	'message': {
		# 			# 		'user1' : player1_username,
		# 			# 		'user2' : player2_username,
		# 			# 		'playerScore1' : match_played.team1_score,
		# 			# 		'playerScore2' : match_played.team2_score,
		# 			# 		'time': match_played.duration,
		# 			# 		'score': [match_played.team1_score, match_played.team2_score],
		# 			# 		'selfScore': [match_statistics.team1_player1_score, match_statistics.team2_player1_score],
		# 			# 		'hit': [match_statistics.team1_player1_hit, match_statistics.team2_player1_hit],
		# 			# 		'accuracy': [player1_accuracy, player2_accuracy],
		# 			# 		'rating': [player1_rating, player2_rating]
		# 			# 	}
		# 			# }))
		# 			# with player1.avatar.open('rb') as f:
		# 			# 	users.append({
		# 			# 		'name': player1_username,
		# 			# 		'avatar': base64.b64encode(f.read()).decode('utf-8'),
		# 			# 		'level': 2.4
		# 			# 	})
		# 			# with player2.avatar.open('rb') as f:
		# 			# 	users.append({
		# 			# 		'name': player2_username,
		# 			# 		'avatar': base64.b64encode(f.read()).decode('utf-8'),
		# 			# 		'level': 2.4
		# 			# 	})
		# 			# await self.send(text_data=json.dumps({
		# 			# 	'type': 'playersInfos',
		# 			# 	'message': {
		# 			# 		'users': users
		# 			# 	}
		# 			# }))
		# 	except Match.DoesNotExist:
		# 		await self.send(text_data=json.dumps({
		# 			'type': 'roomNotExist',
		# 			'message': 'roomNotExist'
		# 		}))


async def user_exited_tournament_game(self, data, tournament_rooms):
	message = data['message']
	room = {}
	user = await sync_to_async(customuser.objects.filter(username=message['user']).first)()
	tournament_id = await get_tournament_id(user)
	if tournament_id != 0:
		room = await get_right_room(tournament_id, tournament_rooms, message['user'])
	if room:
		room['status'] = 'finished'
		if room['players'][0]['user'] == message['user']:
			room['players'][0]['status'] = 'loser'
			room['players'][1]['status'] = 'winner'
		elif room['players'][1]['user'] == message['user']:
			room['players'][1]['status'] = 'loser'
			room['players'][0]['status'] = 'winner'