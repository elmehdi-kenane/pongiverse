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
from .models import Match, ActiveMatch, PlayerState, Tournament, TournamentMembers, Round, TournamentUserInfo, TournamentWarnNotifications, DisplayOpponent, GameNotifications
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
import base64
import asyncio
import requests
from Notifications.common import notifs_user_channels
from .common import tournament_rooms, user_channels


async def disconnected(self, user_channels):
	cookiess = self.scope.get('cookies', {})
	token = cookiess.get('token')
	decoded_token = AccessToken(token)
	payload_data = decoded_token.payload
	user_id = payload_data.get('user_id')
	if user_id:
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		# username = user.username
		# tmp_username = username
		# user.is_online = False
		# await sync_to_async(user.save)()
		members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
		for member in members:
			is_started = await sync_to_async(lambda: member.tournament.is_started)()
			is_finished = await sync_to_async(lambda:  member.tournament.is_finished)()
			is_eliminated = await sync_to_async(lambda: member.is_eliminated)()
			if is_started == False or (is_started == True and is_finished == False and is_eliminated == False):
				member.is_inside = False
				await sync_to_async(member.save)()


async def create_tournament(self, data, user_channels):
	#print("hmededede")
	username = data['message']['user']
	userrr = username
	flag = 0
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	if user is not None:
		invitations = await sync_to_async(lambda: GameNotifications.objects.filter(target=user))()
		await sync_to_async(invitations.delete)()
		members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
		channel_layer = get_channel_layer()
		for member in members:
			is_started = await sync_to_async(lambda: member.tournament.is_started)()
			if not is_started:
				flag = 1337
				break
		friends = await sync_to_async(list)(Friends.objects.filter(user=user))
		for friend in friends:
			friend_username = await sync_to_async(lambda: friend.friend.username)()
			channel_name = user_channels.get(friend_username)
			if channel_name:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'friend_created_tournament',
						'message': {
							'friend_username': friend_username,
							'userInfos': {
										'id': user.id,
										'name': user.username,
										'level': 2,
										'image': user.avatar.path,
									}
						}
					}
				)
		channel_name = user_channels.get(username)
		if flag == 0 :
			while True:
				random_number = random.randint(1000000000, 10000000000)
				tournament = await sync_to_async(Tournament.objects.filter(tournament_id=random_number).first)()
				if tournament is None:
					break
			user.is_playing = True
			await sync_to_async(user.save)()
			tournament = Tournament(tournament_id=random_number)
			await sync_to_async(tournament.save)()
			tournamentMember = TournamentMembers(user=user, tournament=tournament, is_owner=True)
			await sync_to_async(tournamentMember.save)()
			group_name = f'tournament_{random_number}'
			await channel_layer.group_add(group_name, channel_name)
			if channel_name:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'tournament_created',
							'message': {
								'user': username
							}
						}
					)
			for username, channel_name in user_channels.items():
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'tournament_created_by_user',
						'message': {
							'tournament_info' : {
								'tournament_id' : random_number,
								'owner' : userrr,
								'size' : 1
							}
						}
					}
				)

		else :
			if channel_name:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'tournament_created',
						'message': {
							'user': username
						}
					}
				)


async def loged_again(self, data, user_channels):
	username = data['message']['user']
	print("***********************************WAHMEDDDDDDDDDDDD")
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
	for member in members:
		is_started = await sync_to_async(lambda: member.tournament.is_started)()
		if not is_started:
			tournament_id = await sync_to_async(lambda: member.tournament.tournament_id)()
			group_name = f'tournament_{tournament_id}'
			channel_names_list = notifs_user_channels.get(username)
			if channel_names_list:
				for channel_names in channel_names_list:
					await self.channel_layer.group_add(group_name, channel_names)
			await self.channel_layer.group_add(group_name, self.channel_name)
			break

async def kick_player(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	kicked_user = await sync_to_async(customuser.objects.filter(username=data['message']['kicked']).first)()
	kicked_user.is_playing = False
	await sync_to_async(kicked_user.save)()
	member = await sync_to_async(TournamentMembers.objects.filter(user=kicked_user, tournament=tournament).first)()
	await sync_to_async(member.delete)()
	group_name = f'tournament_{tournament_id}'
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'user_kicked_out',
			'message':{
				'kicked': data['message']['kicked'],
			}
		}
	)
	for username, channel_name in user_channels.items():
		await self.channel_layer.send(
			channel_name,
			{
				'type': 'user_kicked_from_tournament',
				'message': {
					'tournament_id' : tournament_id,
				}
			}
		)

async def leave_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	kicked_user = await sync_to_async(customuser.objects.filter(username=data['message']['kicked']).first)()
	kicked_user.is_playing = False
	await sync_to_async(kicked_user.save)()
	member = await sync_to_async(TournamentMembers.objects.filter(user=kicked_user, tournament=tournament).first)()
	await sync_to_async(member.delete)()
	group_name = f'tournament_{tournament_id}'
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'leave_tournament',
			'message':{
				'kicked': data['message']['kicked'],
				'userInfos': {
					'id': kicked_user.id,
					'name': kicked_user.username,
					'level': 2,
					'image': kicked_user.avatar.path,
					'is_playing' : kicked_user.is_playing
				}
			}
		}
	)
	channel_name = user_channels.get(data['message']['kicked'])
	await self.channel_layer.group_discard(group_name, channel_name)
	channel_name_notif_list = notifs_user_channels.get(data['message']['kicked'])
	if channel_name_notif_list:
		for channel_name_notif in channel_name_notif_list:
			await self.channel_layer.group_discard(group_name, channel_name_notif)
	for username, channel_name in user_channels.items():
		await self.channel_layer.send(
			channel_name,
			{
				'type': 'user_leave_tournament',
				'message': {
					'tournament_id' : tournament_id,
				}
			}
		)



async def destroy_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	group_name = f'tournament_{tournament_id}'
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'tournament_destroyed'
		}
	)
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	for member in members:
		username = await sync_to_async(lambda: member.user.username)()
		member.user.is_playing = False
		await sync_to_async(member.user.save)()
		channel_name = user_channels.get(username)
		channel_name_notif_list = notifs_user_channels.get(username)
		if channel_name:
			await self.channel_layer.group_discard(group_name, channel_name)
		if channel_name_notif_list:
			for channel_name_notif in channel_name_notif_list:
				await self.channel_layer.group_discard(group_name, channel_name_notif)
	await sync_to_async(tournament.delete)()
	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
	for friend in friends:
		friend_username = await sync_to_async(lambda: friend.friend.username)()
		channel_name = user_channels.get(friend_username)
		if channel_name:
			await self.channel_layer.send(
				channel_name,
				{
					'type': 'friend_distroyed_tournament',
					'message': {
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
		await self.channel_layer.send(
			channel_name,
			{
				'type': 'tournament_destroyed_by_user',
				'message': {
					'tournament_id' : tournament_id,
				}
			}
		)



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
	round = await sync_to_async(Round.objects.filter(tournament=tournament, type='ROUND 16'))
	usertournamentinfo = await sync_to_async(TournamentUserInfo.objects.filter(user=member, round=round).first)()
	position = await sync_to_async(lambda: usertournamentinfo.position)()
	return position

async def send_user_eliminated_after_delay(self, tournament, actual_round):
	await asyncio.sleep(15)
	rounds = ['ROUND 16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'WINNER']
	next_round = ''
	if actual_round == 'WINNER':
		pass
	else:
		round_index = rounds.index(actual_round)
		next_round = rounds[round_index + 1]
	Tournamentwarnnotification = await sync_to_async(TournamentWarnNotifications.objects.filter(tournament=tournament).first)()
	await sync_to_async(Tournamentwarnnotification.delete)()
	print("----after----")
	tournament_id = await sync_to_async(lambda: tournament.tournament_id)()
	group_name = f'tournament_{tournament_id}'
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
	members = await sync_to_async(list)(TournamentUserInfo.objects.filter(round=round))
	for member in members :
		member_user = await sync_to_async(lambda: member.user)()
		tournament_member = await sync_to_async(TournamentMembers.objects.filter(tournament=tournament, user=member_user).first)()
		is_inside = await sync_to_async(lambda: tournament_member.is_inside)()
		username = await sync_to_async(lambda: tournament_member.user.username)()
		if is_inside == False:
			tournament_member.is_eliminated = True
			await sync_to_async(tournament_member.save)()
			tournament_member.user.is_playing = False
			await sync_to_async(tournament_member.user.save)()
			channel_name_list = notifs_user_channels.get(username)
			for channel_name in channel_name_list:
				await self.channel_layer.group_discard(group_name, channel_name)
			friends = await sync_to_async(list)(Friends.objects.filter(user=tournament_member.user))
			for friend in friends:
				friend_username = await sync_to_async(lambda: friend.friend.username)()
				channel_name_list = notifs_user_channels.get(friend_username)
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
			print("**********outside******")
	round = Round(tournament=tournament, type=next_round)
	if next_round:
		await sync_to_async(round.save)()
		for i in range(0, len(members), 2):
			players = []
			users = []
			member1 = members[i]
			member2 = members[i+1] if i + 1 < len(members) else None
			member_user1 = await sync_to_async(lambda: member1.user)()
			member_user2 = await sync_to_async(lambda: member2.user)()
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
			elif is_eliminated1 == True:
				player_position = await get_player_position(tournament, member_user2, actual_round)
				if player_position % 2 == 0:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=player_position/2)
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user2, position=(player_position + 1)/2)
				await sync_to_async(tournamentuserinfo.save)()
			elif is_eliminated2 == True:
				player_position = await get_player_position(tournament, member_user1, actual_round)
				if player_position % 2 == 0:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=player_position/2)
				else:
					tournamentuserinfo = TournamentUserInfo(round=round, user=member_user1, position=(player_position + 1)/2)
				await sync_to_async(tournamentuserinfo.save)()
			elif is_eliminated1 == False and is_eliminated2 == False:
				displayoponent = DisplayOpponent(user1=member_user1, user2=member_user2)
				await sync_to_async(displayoponent.save)()
				sixteenround = await sync_to_async(Round.objects.filter(tournament=tournament, type='ROUND 16').first)()
				username1 = await sync_to_async(lambda: member_user1.username)()
				username2 = await sync_to_async(lambda: member_user2.username)()
				channel_name1 = user_channels.get(username1)
				channel_name2 = user_channels.get(username2)
				players.append({
					'user': username1,
					'state': 'walou',
					'playerNo': 1,
					'paddleX': 0,
					'paddleY': 0,
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
					'paddleX': 0,
					'paddleY': 0,
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
						'ballX': 0,
						'ballY': 0
					},
					'winner': 0,
					'status': 'status',
					'mode': 'tournament',
					'type': '',
					'date_started': datetime.datetime.now().isoformat(),
					'time': 0 #####
				}
				if tournament_rooms.get(str(tournament_id)):
					tournament_rooms.get(str(tournament_id)).update({room['id'] : room})
				else:
					tournament_rooms[str(tournament_id)] = {room['id'] : room}
				await self.channel_layer.group_add(str(room_id), channel_name1)
				await self.channel_layer.group_add(str(room_id), channel_name2)
				group_name = f'tournament_{tournament_id}'
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




async def Round_16_timer(self, data):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=user, tournament=tournament).first)()
	is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
	if is_owner == True:
		tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
		await sync_to_async(tournamentwarnnotification.save)()
		tournament_id = await sync_to_async(lambda: tournament.tournament_id)()
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
		await send_user_eliminated_after_delay(self, tournament, "ROUND 16")

async def start_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	tournament.is_started = True
	await sync_to_async(tournament.save)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	count = 1
	round = Round(tournament=tournament, type='ROUND 16')
	await sync_to_async(round.save)()
	for member in members:
		username = await sync_to_async(lambda: member.user.username)()
		tournamentuserinfo = TournamentUserInfo(round=round, user=member.user, position=count)
		await sync_to_async(tournamentuserinfo.save)()
		count += 1
		channel_name = user_channels.get(username)
		if channel_name:
			await self.channel_layer.send(
				channel_name,
				{
					'type': 'tournament_started',
					'message': {
						'tournament_id' : tournament_id
					}
				}
			)
	for username, channel_name in user_channels.items():
		await self.channel_layer.send(
			channel_name,
			{
				'type': 'tournament_started_by_user',
				'message': {
					'tournament_id' : tournament_id,
				}
			}
		)

async def quarterFinalTimer(self, player, actual_round, tournament):
	tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
	await sync_to_async(tournamentwarnnotification.save)()
	group_name = f'tournament_{tournament.tournament_id}'
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'warn_members',
			'message': {
				'time' : tournamentwarnnotification.created_at.isoformat()
			}
		}
	)
	await send_user_eliminated_after_delay(self, tournament, actual_round)

async def semiFinalTimer(self, player, actual_round, tournament):
	pass

async def FinalTimer(self, player, actual_round, tournament):
	pass



