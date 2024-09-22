import json
from datetime import datetime
import random
import time
import asyncio
import math
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
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
from .common import tournament_rooms, user_channels, tournaments


async def disconnected(self, user_channels):
	cookiess = self.scope.get('cookies', {})
	token = cookiess.get('token')
	try:
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
	except TokenError:
		pass


async def create_tournament(self, data, user_channels):
	username = data['message']['user']
	userrr = username
	flag = 0
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	if user is not None:
		invitations = await sync_to_async(lambda: GameNotifications.objects.filter(target=user))()
		await sync_to_async(invitations.delete)()
		channel_layer = get_channel_layer()
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
		while True:
			random_number = random.randint(1000000000, 10000000000)
			tournament = await sync_to_async(Tournament.objects.filter(tournament_id=random_number).first)()
			if tournament is None:
				break
		user.is_playing = True
		await sync_to_async(user.save)()
		# tournament = Tournament(tournament_id=random_number)
		# await sync_to_async(tournament.save)()
		tournaments[random_number] = {}
		# tournamentMember = TournamentMembers(user=user, tournament=tournament, is_owner=True)
		# await sync_to_async(tournamentMember.save)()
		tournaments[random_number]['members'] = []
		tournaments[random_number]['is_started'] = False
		tournaments[random_number]['is_finished'] = False
		new_member = {"username": username, "is_owner": True, "is_eliminated": False, "is_inside": True}
		tournaments[random_number]['members'].append(new_member)
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


def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username and member['is_eliminated'] == False and (tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)):
				return True
	return False


async def loged_again(self, data, user_channels):
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
	tournament_id = is_user_joining_tournament(username)
	if tournament_id != 0:
		group_name = f'tournament_{tournament_id}'
		channel_names_list = notifs_user_channels.get(username)
		if channel_names_list:
			for channel_names in channel_names_list:
				await self.channel_layer.group_add(group_name, channel_names)
		await self.channel_layer.group_add(group_name, self.channel_name)

def delete_member(tournament_id, username_to_delete):
    if tournament_id in tournaments:
        members = tournaments[tournament_id]['members']
        tournaments[tournament_id]['members'] = [member for member in members if member['username'] != username_to_delete]

async def kick_player(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	kicked_user = await sync_to_async(customuser.objects.filter(username=data['message']['kicked']).first)()
	kicked_user.is_playing = False
	await sync_to_async(kicked_user.save)()
	delete_member(tournament_id, data['message']['kicked'])
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
	delete_member(tournament_id, data['message']['kicked'])
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
	for member in tournaments[tournament_id]['members'] :
		username = member['username']
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		user.is_playing = False
		await sync_to_async(user.save)()
		channel_name = user_channels.get(username)
		channel_name_notif_list = notifs_user_channels.get(username)
		if channel_name:
			await self.channel_layer.group_discard(group_name, channel_name)
		if channel_name_notif_list:
			for channel_name_notif in channel_name_notif_list:
				await self.channel_layer.group_discard(group_name, channel_name_notif)
	del tournaments[tournament_id]
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



async def start_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	tournaments[tournament_id]['is_started'] = True
	# tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	# tournament.is_started = True
	# await sync_to_async(tournament.save)()
	# members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	# round = Round(tournament=tournament, type='QUARTERFINAL')
	# await sync_to_async(round.save)()
	members = tournaments[tournament_id]['members']
	tournaments[tournament_id]['rounds'] = {}
	tournaments[tournament_id]['rounds']['QUARTERFINAL'] = []
	tournaments[tournament_id]['rounds']['SEMIFINAL'] = []
	tournaments[tournament_id]['rounds']['FINAL'] = []
	tournaments[tournament_id]['rounds']['WINNER'] = []
	count = 1
	for member in members:
		tournaments[tournament_id]['rounds']['QUARTERFINAL'].append({'username': member['username'], 'position': count})
		# tournamentuserinfo = TournamentUserInfo(round=round, user=member.user, position=count)
		# await sync_to_async(tournamentuserinfo.save)()
		count += 1
		channel_name = user_channels.get(member['username'])
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



