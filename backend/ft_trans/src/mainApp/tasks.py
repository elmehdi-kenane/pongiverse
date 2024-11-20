import json
from datetime import datetime
import random
import time
import asyncio
import math
from rest_framework_simplejwt.tokens import AccessToken
import datetime
from friends.models import Friendship
from myapp.models import customuser
from mainApp.common import user_channels
from mainApp.models import Tournament, TournamentMembers, GameNotifications, TournamentWarnNotifications, DisplayOpponent, Round, TournamentUserInfo
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
import asyncio
import requests
import base64
from mainApp.common import tournament_rooms, tournaments
from Notifications.common import notifs_user_channels
import os

counter = 0

@sync_to_async
def generate_unique_room_id(tournament_id):
	tournament_rooms_list = tournament_rooms.get(str(tournament_id))
	while True:
		room_id = random.randint(1000000, 1000000000)
		if tournament_rooms_list:
			if room_id not in tournament_rooms_list:
				return room_id
		else:
			return room_id

def get_player_position(tournament_id, member_username, actual_round):
	if tournament_id in tournaments:
		if actual_round in tournaments[tournament_id]['rounds']:
			for player in tournaments[tournament_id]['rounds'][actual_round]:
				if player['username'] == member_username:
					return player['position']


async def send_player_winner(self, tournament_id, username, next_round, position):
	ip_address = os.getenv("IP_ADDRESS")
	groupe_name = f'tournament_{tournament_id}'
	if username != 'anounymous':
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		await self.channel_layer.group_send(groupe_name, {
			'type': 'new_user_win',
			'message': {
				"id" : user.id,
				"name": user.username,
				"level" : user.level,
				"image" : f"http://{ip_address}:8000/auth{user.avatar.url}",
				"round_reached": next_round,
				"position": position // 2 if position % 2 == 0 else (position + 1) // 2 
			}
		})
	else:
		await self.channel_layer.group_send(groupe_name, {
			'type': 'new_user_win',
			'message': {
				"id" : -1,
				"name": '',
				"level" : -1,
				"image" : '',
				"round_reached": next_round,
				"position": position // 2 if position % 2 == 0 else (position + 1) // 2 
			}
		})

def update_is_eliminated(tournament_id, username, flag):
	if tournament_id in tournaments:
		members = tournaments[tournament_id]['members']
		for member in members:
			if member['username'] == username:
				member['is_eliminated'] = flag
				break

def get_player_by_position(tournament_id, round_name, position):
    if tournament_id in tournaments:
        if round_name in tournaments[tournament_id]['rounds']:
            for player in tournaments[tournament_id]['rounds'][round_name]:
                if player['position'] == position:
                    return player
def get_is_eliminated(tournament_id, username):
	if tournament_id in tournaments:
		for member in tournaments[tournament_id]['members']:
			if member['username'] == username:
				return member['is_eliminated']
	return False


async def save_tournament_to_db(tournament_id):
	if tournament_id in tournaments:
		tournament = Tournament(tournament_id=tournament_id, is_started=True, is_finished=True)
		await sync_to_async(tournament.save)()
		for member in tournaments[tournament_id]['members']:
			user = await sync_to_async(customuser.objects.filter(username=member['username']).first)()
			tournament_member = TournamentMembers(user=user, tournament=tournament, is_owner=member['is_owner'], is_eliminated=member['is_eliminated'], is_inside=member['is_inside'])
			await sync_to_async(tournament_member.save)()
		for round_name in tournaments[tournament_id]['rounds']:
			round = Round(tournament=tournament, type=round_name)
			await sync_to_async(round.save)()
			for player in tournaments[tournament_id]['rounds'][round_name]:
				if player['username'] != 'anounymous':
					user = await sync_to_async(customuser.objects.filter(username=player['username']).first)()
					tournamentuserinfo = TournamentUserInfo(round=round, user=user, position=player['position'])
					await sync_to_async(tournamentuserinfo.save)()
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=player['position'])
					await sync_to_async(tournamentuserinfo.save)()
		tournaments.pop(tournament_id)


async def send_user_eliminated_after_delay(self, tournament_id, actual_round):
	ip_address = os.getenv("IP_ADDRESS")
	rounds = ['QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'WINNER']
	next_round = ''
	if actual_round == 'WINNER':
		for member in tournaments[tournament_id]['rounds'][actual_round]:
			if member['username'] != 'anounymous':
				await save_tournament_to_db(tournament_id)
				my_user = await sync_to_async(customuser.objects.get)(username=member['username'])
				channel_name_list = notifs_user_channels.get(my_user.id)
				if channel_name_list:
					for channel_name in channel_name_list:
						await self.channel_layer.send(
							channel_name,
							{
								'type': 'youWinTheGame',
								'message': {
									'round_reached' : actual_round,
									'tournament_id': tournament_id
								}
							}
						)
		return
	else:
		round_index = rounds.index(actual_round)
		next_round = rounds[round_index + 1]
	await asyncio.sleep(10)
	print(f"\nNEXT ROUND: {next_round}\n")
	Tournamentwarnnotification = await sync_to_async(TournamentWarnNotifications.objects.filter(tournament_id=tournament_id).first)()
	if Tournamentwarnnotification:
		await sync_to_async(Tournamentwarnnotification.delete)()
	group_name = f'tournament_{tournament_id}'
	# actual_round_obj = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
	# members = await sync_to_async(list)(TournamentUserInfo.objects.filter(round=actual_round_obj))
	members = tournaments[tournament_id]['rounds'][actual_round]
	print(f"\nMEMBERS: {members}\n")
	for member in members :
		if member['username'] != 'anounymous': 
			# tournament_member = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user).first)()
			# is_inside = await sync_to_async(lambda: tournament_member.is_inside)()
			# is_inside = next((member['is_inside'] for member in tournaments[tournament_id]['members'] if member['username'] == 'user1'), None)
			for m in tournaments[tournament_id]['members']:
				if m['username'] == member['username']:
					is_inside = m['is_inside']
					break
			if is_inside == False:
				update_is_eliminated(tournament_id, member['username'], True)
				# tournament_member.is_eliminated = True
				# await sync_to_async(tournament_member.save)()
				user = await sync_to_async(customuser.objects.filter(username=member['username']).first)()
				user.is_playing = False
				await sync_to_async(user.save)()
				my_user = await sync_to_async(customuser.objects.get)(username=member['username'])
				channel_name_list = notifs_user_channels.get(my_user.id)
				if channel_name_list:
					for channel_name in channel_name_list:
						await self.channel_layer.group_discard(group_name, channel_name)
				friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
				for friend in friends:
					friend_id = await sync_to_async(lambda: friend.friend.id)()
					channel_name_list = notifs_user_channels.get(friend_id)
					if channel_name_list:
						for channel_name in channel_name_list:
							await self.channel_layer.send(
								channel_name,
								{
									'type': 'leave_tournament',
									'message':{
										'kicked': member['username'],
										'userInfos': {
											'id': user.id,
											'name': member['username'],
											'level': user.level,
											'image': f"http://{ip_address}:8000/auth{user.avatar.url}" ,
											'is_playing' : user.is_playing
										}
									}
								}
							)

	if next_round:
		# round_to_check = await sync_to_async(Round.objects.filter(tournament=tournament, type=next_round).first)()
		# if round_to_check is None:
			# round = Round(tournament=tournament, type=next_round)
			# await sync_to_async(round.save)()
		# else:
		# round = round_to_check
		for i in range(0, len(members), 2):
			players = []
			users = []
			# member1 = await sync_to_async(TournamentUserInfo.objects.filter(round=actual_round_obj, position=i + 1).first)()
			# member2 = await sync_to_async(TournamentUserInfo.objects.filter(round=actual_round_obj, position=i + 2).first)()
			player1 = get_player_by_position(tournament_id, actual_round, i + 1)
			player2 = get_player_by_position(tournament_id, actual_round, i + 2)
			print(f"\nPLAYER1: {player1}\n")
			print(f"\nPLAYER2: {player2}\n")
			# member_user1 = await sync_to_async(lambda: member1.user)()
			# member_user2 = await sync_to_async(lambda: member2.user)()
			member_user1 = player1['username']
			member_user2 = player2['username']
			if member_user1 == 'anounymous' and member_user2 == 'anounymous':
				position = player1['position']
				if position % 2 == 0:
					tournaments[tournament_id]['rounds'][next_round].append({'username': 'anounymous', 'position': position / 2})
					# tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=position/2)
				else:
					tournaments[tournament_id]['rounds'][next_round].append({'username': 'anounymous', 'position': (position + 1) / 2})
					# tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=(position + 1)/2)
				# await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, 'anounymous', next_round, position)
			elif member_user1 == 'anounymous':
				position = player1['position']
				if position % 2 == 0:
					tournaments[tournament_id]['rounds'][next_round].append({'username': member_user2, 'position': position / 2})
				else:
					tournaments[tournament_id]['rounds'][next_round].append({'username': member_user2, 'position': (position + 1) / 2})
				# await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, member_user2, next_round, position)
			elif member_user2 == 'anounymous':
				position = player2['position']
				if position % 2 == 0:
					tournaments[tournament_id]['rounds'][next_round].append({'username': member_user1, 'position': position / 2})
				else:
					tournaments[tournament_id]['rounds'][next_round].append({'username': member_user1, 'position': (position + 1) / 2})
				# await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, member_user1, next_round, position)
			else:
				# tournament_member1 = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user1).first)()
				# tournament_member2 = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user2).first)()
				is_eliminated1 = get_is_eliminated(tournament_id, member_user1)
				is_eliminated2 = get_is_eliminated(tournament_id, member_user2)
				if is_eliminated1 == True and is_eliminated2 == True:
					player_position = get_player_position(tournament_id, member_user2, actual_round)
					if player_position % 2 == 0:
						tournaments[tournament_id]['rounds'][next_round].append({'username': 'anounymous', 'position': player_position / 2})
						# tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=player_position/2)
					else:
						# tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=(player_position + 1)/2)
						tournaments[tournament_id]['rounds'][next_round].append({'username': 'anounymous', 'position': (player_position + 1) / 2})
					# await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, 'anounymous', next_round, player_position)
				elif is_eliminated1 == True:
					player_position = get_player_position(tournament_id, member_user2, actual_round)
					if player_position % 2 == 0:
						# tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=player_position/2)
						tournaments[tournament_id]['rounds'][next_round].append({'username': member_user2, 'position': player_position / 2})
					else:
						# tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=(player_position + 1)/2)
						tournaments[tournament_id]['rounds'][next_round].append({'username': member_user2, 'position': (player_position + 1) / 2})
					# await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, member_user2, next_round, player_position)
				elif is_eliminated2 == True:
					player_position = get_player_position(tournament_id, member_user1, actual_round)
					if player_position % 2 == 0:
						# tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=player_position/2)
						tournaments[tournament_id]['rounds'][next_round].append({'username': member_user1, 'position': player_position / 2})
					else:
						# tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=(player_position + 1)/2)
						tournaments[tournament_id]['rounds'][next_round].append({'username': member_user1, 'position': (player_position + 1) / 2})
					# await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, member_user1, next_round, player_position)
				elif is_eliminated1 == False and is_eliminated2 == False:
					displayoponent = DisplayOpponent(user1=member_user1, user2=member_user2)
					await sync_to_async(displayoponent.save)()
					# username1 = await sync_to_async(lambda: member_user1.username)()
					# username2 = await sync_to_async(lambda: member_user2.username)()
					# print("USERNAME1:", username1)
					# print("USERNAME2:", username2)
					member_user_obj1 = await sync_to_async(customuser.objects.get)(username=member_user1)
					member_user_obj2 = await sync_to_async(customuser.objects.get)(username=member_user2)
					channel_name_list1 = notifs_user_channels.get(member_user_obj1.id)
					channel_name_list2 = notifs_user_channels.get(member_user_obj2.id)
					players.append({
						'user': member_user1,
						'state': 'walou',
						'playerNo': 1,
						'paddleX': 15,
						'paddleY': 165,
						'score': 0,
						'status': 'notStarted',
						'hit': 0, ####### added
						'self_scored': 0, ####### added
						'tmp_scored': 0 ####### added
						})
					players.append({
						'user': member_user2,
						'state': 'walou',
						'playerNo': 2,
						'paddleX': 685,
						'paddleY': 165,
						'score': 0,
						'status': 'notStarted',
						'hit': 0, ####### added
						'self_scored': 0, ####### added
						'tmp_scored': 0 ####### added
						})
					user1 = await sync_to_async(customuser.objects.filter(username=member_user1).first)()
					user2 = await sync_to_async(customuser.objects.filter(username=member_user2).first)()
					avatar1 = await sync_to_async(lambda: user1.avatar)()
					avatar2 = await sync_to_async(lambda: user2.avatar)()
					with avatar1.open('rb') as f:
						users.append({
							'image': base64.b64encode(f.read()).decode('utf-8'),
							'level': 2.4
						})
					with avatar2.open('rb') as f:
						users.append({
							'image': base64.b64encode(f.read()).decode('utf-8'),
							'level': 2.4
						})
					room_id = await generate_unique_room_id(tournament_id)
					room = {
						'id': room_id,
						'players': players,
						'ball': {
							'ballX': 300,
							'ballY': 200
						},
						'winner': 0,
						'status': 'notStarted',
						'mode': 'tournament',
						'type': '',
						'date_started': datetime.datetime.now().isoformat(),
						'time': 0 #####
					}
					if tournament_rooms.get(str(tournament_id)):
						tournament_rooms.get(str(tournament_id)).update({room['id'] : room})
					else:
						tournament_rooms[str(tournament_id)] = {room['id'] : room}
					if channel_name_list1:
						for channel_name in channel_name_list1:
							await self.channel_layer.group_add(str(room_id), channel_name)
					if channel_name_list2:
						for channel_name in channel_name_list2:
							await self.channel_layer.group_add(str(room_id), channel_name)
					group_name = str(room_id)
					await self.channel_layer.group_send(
						group_name,
						{
							'type': 'you_and_your_user',
							'message':{
								'user1': member_user1,
								'user2' : member_user2,
								'time' : displayoponent.created_at.isoformat()
							}
						}
					)




async def manage_tournament(self, tournament_id):
	global counter
	# tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	quarterfinalcount = 0
	semifinalcount = 0
	finalcount = 0
	winnercount = 0
	while True:
		await asyncio.sleep(2)
		if tournament_id not in tournaments:
			break
		quarterfinalcount = len(tournaments[tournament_id]['rounds']['QUARTERFINAL'])
		semifinalcount = len(tournaments[tournament_id]['rounds']['SEMIFINAL'])
		finalcount = len(tournaments[tournament_id]['rounds']['FINAL'])
		winnercount = len(tournaments[tournament_id]['rounds']['WINNER'])
		print(f"\nQUARTERFINAL COUNT: {quarterfinalcount}, SEMIFINAL COUNT: {semifinalcount}, FINAL COUNT: {finalcount}, WINNER COUNT: {winnercount}\n")
		print(f"\n *************tournament members: {tournaments[tournament_id]['members']}\n")
		if quarterfinalcount == 8 and semifinalcount == 0 and counter == 0:
			counter += 1
			# number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundquarterfinal, user=None).count)()
			# if number_of_null_players == 8:
			# 	pass
			# else:
			tournamentwarnnotification = TournamentWarnNotifications(tournament_id=tournament_id)
			await sync_to_async(tournamentwarnnotification.save)()
			group_name = f'tournament_{tournament_id}'
			await self.channel_layer.group_send(
				group_name,
				{
					'type': 'warn_members',
					'message': {
						'time' : tournamentwarnnotification.created_at.isoformat()
					}
				}
			)
			await send_user_eliminated_after_delay(self, tournament_id, "QUARTERFINAL") 
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 0 and counter == 1:
			counter += 1
			# number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundsemifinal, user=None).count)()
			# if number_of_null_players == 4:
				# pass
			# else:
			tournamentwarnnotification = TournamentWarnNotifications(tournament_id=tournament_id)
			await sync_to_async(tournamentwarnnotification.save)()
			group_name = f'tournament_{tournament_id}'
			await self.channel_layer.group_send(
				group_name,
				{
					'type': 'warn_members',
					'message': {
						'time' : tournamentwarnnotification.created_at.isoformat()
					}
				}
			)
			await send_user_eliminated_after_delay(self, tournament_id, "SEMIFINAL")
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 2 and winnercount == 0 and counter == 2:
			counter += 1
			# number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundfinal, user=None).count)()
			# if number_of_null_players == 2:
			# 	pass
			# else:
			tournamentwarnnotification = TournamentWarnNotifications(tournament_id=tournament_id)
			await sync_to_async(tournamentwarnnotification.save)()
			group_name = f'tournament_{tournament_id}'
			await self.channel_layer.group_send(
				group_name,
				{
					'type': 'warn_members',
					'message': {
						'time' : tournamentwarnnotification.created_at.isoformat()
					}
				}
			)
			await send_user_eliminated_after_delay(self, tournament_id, "FINAL")
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 2 and winnercount == 1:
			counter = 0
			await send_user_eliminated_after_delay(self, tournament_id, "WINNER")
			break

