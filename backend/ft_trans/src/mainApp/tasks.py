import json
from datetime import datetime
import random
import time
import asyncio
import math
from rest_framework_simplejwt.tokens import AccessToken
import datetime
from chat.models import Friends
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
from mainApp.common import tournament_rooms
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

async def get_player_position(tournament, member, actual_round):
	round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
	usertournamentinfo = await sync_to_async(TournamentUserInfo.objects.filter(user=member, round=round).first)()
	position = usertournamentinfo.position
	return position


async def send_player_winner(self, tournament_id, user, next_round, position):
	ip_address = os.getenv("IP_ADDRESS")
	groupe_name = f'tournament_{tournament_id}'
	if user is not None:
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

async def send_user_eliminated_after_delay(self, tournament, actual_round):
	print(f"\nGET INTO SEND USER ELIMINATED AFTER DELAY : {actual_round}\n")
	await asyncio.sleep(6)
	rounds = ['QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'WINNER']
	next_round = ''
	if actual_round == 'WINNER':
		pass
	else:
		round_index = rounds.index(actual_round)
		next_round = rounds[round_index + 1]
	Tournamentwarnnotification = await sync_to_async(TournamentWarnNotifications.objects.filter(tournament=tournament).first)()
	if Tournamentwarnnotification:
		await sync_to_async(Tournamentwarnnotification.delete)()
	tournament_id = await sync_to_async(lambda: tournament.tournament_id)()
	group_name = f'tournament_{tournament_id}'
	actual_round_obj = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
	members = await sync_to_async(list)(TournamentUserInfo.objects.filter(round=actual_round_obj))
	for member in members :
		member_user = await sync_to_async(lambda: member.user)()
		if member_user is not None: 
			tournament_member = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user).first)()
			is_inside = await sync_to_async(lambda: tournament_member.is_inside)()
			username = await sync_to_async(lambda: tournament_member.user.username)()
			if is_inside == False:
				tournament_member.is_eliminated = True
				await sync_to_async(tournament_member.save)()
				tournament_member.user.is_playing = False
				await sync_to_async(tournament_member.user.save)()
				channel_name_list = notifs_user_channels.get(username)
				if channel_name_list:
					for channel_name in channel_name_list:
						await self.channel_layer.group_discard(group_name, channel_name)
				friends = await sync_to_async(list)(Friends.objects.filter(user=tournament_member.user))
				for friend in friends:
					friend_username = await sync_to_async(lambda: friend.friend.username)()
					channel_name_list = notifs_user_channels.get(friend_username)
					if channel_name_list:
						for channel_name in channel_name_list:
							await self.channel_layer.send(
								channel_name,
								{
									'type': 'leave_tournament',
									'message':{
										'kicked': username,
										'userInfos': {
											'id': member.user.id,
											'name': username,
											'level': 2,
											'image': member.user.avatar.path,
											'is_playing' : member.user.is_playing
										}
									}
								}
							)

	if next_round:
		round_to_check = await sync_to_async(Round.objects.filter(tournament=tournament, type=next_round).first)()
		if round_to_check is None:
			round = Round(tournament=tournament, type=next_round)
			await sync_to_async(round.save)()
		else:
			round = round_to_check
		for i in range(0, len(members), 2):
			players = []
			users = []
			member1 = await sync_to_async(TournamentUserInfo.objects.filter(round=actual_round_obj, position=i + 1).first)()
			member2 = await sync_to_async(TournamentUserInfo.objects.filter(round=actual_round_obj, position=i + 2).first)()
			member_user1 = await sync_to_async(lambda: member1.user)()
			member_user2 = await sync_to_async(lambda: member2.user)()
			if member_user1 is None and member_user2 is None:
				position = await sync_to_async(lambda: member1.position)()
				if position % 2 == 0:
					tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=position/2)
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=(position + 1)/2)
				await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, None, next_round, position)
			elif member_user1 is None:
				position = await sync_to_async(lambda: member1.position)()
				if position % 2 == 0:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=position/2)
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=(position + 1)/2)
				await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, member_user2, next_round, position)
			elif member_user2 is None:
				position = await sync_to_async(lambda: member2.position)()
				if position % 2 == 0:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=position/2)
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=(position + 1)/2)
				await sync_to_async(tournamentuserinfo.save)()
				await send_player_winner(self, tournament_id, member_user1, next_round, position)
			else:
				tournament_member1 = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user1).first)()
				tournament_member2 = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user2).first)()
				is_eliminated1 = await sync_to_async(lambda: tournament_member1.is_eliminated)()
				is_eliminated2 = await sync_to_async(lambda: tournament_member2.is_eliminated)()
				if is_eliminated1 == True and is_eliminated2 == True:
					player_position = await get_player_position(tournament, member_user2, actual_round)
					if player_position % 2 == 0:
						tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=player_position/2)
					else:
						tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=(player_position + 1)/2)
					await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, None, next_round, player_position)
				elif is_eliminated1 == True:
					player_position = await get_player_position(tournament, member_user2, actual_round)
					if player_position % 2 == 0:
						tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=player_position/2)
					else:
						tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=(player_position + 1)/2)
					await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, member_user2, next_round, player_position)
				elif is_eliminated2 == True:
					player_position = await get_player_position(tournament, member_user1, actual_round)
					if player_position % 2 == 0:
						tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=player_position/2)
					else:
						tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=(player_position + 1)/2)
					await sync_to_async(tournamentuserinfo.save)()
					await send_player_winner(self, tournament_id, member_user1, next_round, player_position)
				elif is_eliminated1 == False and is_eliminated2 == False:
					displayoponent = DisplayOpponent(user1=member_user1, user2=member_user2)
					await sync_to_async(displayoponent.save)()
					username1 = await sync_to_async(lambda: member_user1.username)()
					username2 = await sync_to_async(lambda: member_user2.username)()
					print("USERNAME1:", username1)
					print("USERNAME2:", username2)
					channel_name_list1 = notifs_user_channels.get(username1)
					channel_name_list2 = notifs_user_channels.get(username2)
					players.append({
						'user': username1,
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
						'user': username2,
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
					avatar1 = await sync_to_async(lambda: member_user1.avatar)()
					avatar2 = await sync_to_async(lambda: member_user2.avatar)()
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
								'user1': username1,
								'user2' : username2,
								'time' : displayoponent.created_at.isoformat()
							}
						}
					)




async def manage_tournament(self, tournament_id):
	print("\nMANAGE TOURNAMENT\n")
	global counter
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	roundquarterfinal = await sync_to_async(Round.objects.filter(tournament=tournament, type="QUARTERFINAL").first)()
	roundsemifinal = await sync_to_async(Round.objects.filter(tournament=tournament, type="SEMIFINAL").first)()
	roundfinal = await sync_to_async(Round.objects.filter(tournament=tournament, type="FINAL").first)()
	roundwinner = await sync_to_async(Round.objects.filter(tournament=tournament, type="WINNER").first)()
	while True:
		await asyncio.sleep(2)
		quarterfinalcount = await sync_to_async(TournamentUserInfo.objects.filter(round=roundquarterfinal).count)()
		semifinalcount = await sync_to_async(TournamentUserInfo.objects.filter(round=roundsemifinal).count)()
		finalcount = await sync_to_async(TournamentUserInfo.objects.filter(round=roundfinal).count)()
		winnercount = await sync_to_async(TournamentUserInfo.objects.filter(round=roundwinner).count)()
		print(f"\nQUARTERFINAL COUNT: {quarterfinalcount}, SEMIFINAL COUNT: {semifinalcount}, FINAL COUNT: {finalcount}, WINNER COUNT: {winnercount}\n")
		if quarterfinalcount == 8 and semifinalcount == 0 and counter == 0:
			counter += 1
			number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundquarterfinal, user=None).count)()
			if number_of_null_players == 8:
				pass
			else:
				tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
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
				await send_user_eliminated_after_delay(self, tournament, "QUARTERFINAL") 
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 0 and counter == 1:
			counter += 1
			number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundsemifinal, user=None).count)()
			if number_of_null_players == 4:
				pass
			else:
				tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
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
				await send_user_eliminated_after_delay(self, tournament, "SEMIFINAL")
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 2 and winnercount == 0 and counter == 2:
			counter += 1
			number_of_null_players = await sync_to_async(TournamentUserInfo.objects.filter(round=roundfinal, user=None).count)()
			if number_of_null_players == 2:
				pass
			else:
				tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
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
				await send_user_eliminated_after_delay(self, tournament, "FINAL")
		elif quarterfinalcount == 8 and semifinalcount == 4 and finalcount == 2 and winnercount == 1:
			break

