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
from .models import Match, ActiveMatch, PlayerState, Tournament, TournamentMembers, TournamentInvitation
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
import asyncio

the_tournament_id = 0

async def disconnected(self, user_channels):
	print(f"ALL THE USERS CHANNEL_NAMES in DISCONNECTED : {user_channels}")
	cookiess = self.scope.get('cookies', {})
	token = cookiess.get('token')
	decoded_token = AccessToken(token)
	payload_data = decoded_token.payload
	user_id = payload_data.get('user_id')
	if user_id:
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		username = user.username
		tmp_username = username
		user.is_online = False
		await sync_to_async(user.save)()
		user_channels.pop(username, None)
		channel_layer = get_channel_layer()
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		friends = await sync_to_async(list)(Friends.objects.filter(user=user))
		#### in case of logout
		for username, channel_name in user_channels.items():
			await self.channel_layer.send(
				channel_name,
				{
					'type': 'user_disconnected',
					'message': {
						'user': tmp_username
					}
				}
			)

async def create_tournament(self, data, user_channels):
	username = data['message']['user']
	userrr = username
	flag = 0
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
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


async def invite_friend(self, data, user_channels):
	invited_user = data['message']['invited']
	sender_user = data['message']['user']
	tournament_id = data['message']['tournament_id']
	channel_layer = get_channel_layer()
	channel_name = user_channels.get(invited_user)
	if channel_name:
		sender = await sync_to_async(customuser.objects.filter(username=sender_user).first)()
		receiver = await sync_to_async(customuser.objects.filter(username=invited_user).first)()
		tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
		tournamentInvite = await sync_to_async(TournamentInvitation.objects.filter(tournament=tournament, sender=sender, receiver=receiver).first)()
		if tournamentInvite is None:
			print(f"sender : {sender.username}, receiver : {receiver.username}, tournament : {tournament.tournament_id}")
			tournamentInv = TournamentInvitation(tournament=tournament, sender=sender, receiver=receiver)
			await sync_to_async(tournamentInv.save)()
			await self.channel_layer.send(
						channel_name,
						{
							'type': 'invited_to_tournament',
							'message': {
								'tournament_id' : tournament_id,
								'user' : sender_user
							}
						}
					)

async def accept_invite(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	member = await sync_to_async(TournamentMembers.objects.filter(user=user, tournament=tournament).first)()
	if member is None:
		invitations = await sync_to_async(lambda: TournamentInvitation.objects.filter(receiver=user))()
		await sync_to_async(invitations.delete)()
		channel_layer = get_channel_layer()
		user.is_playing = True
		await sync_to_async(user.save)()
		channel_name = user_channels.get(username)
		tournamentMember = TournamentMembers(user=user, tournament=tournament)
		await sync_to_async(tournamentMember.save)()
		if channel_name:
			group_name = f'tournament_{tournament_id}'
			print(f"GROUP NAME : {group_name}")
			await self.channel_layer.group_add(group_name, channel_name)
			await self.channel_layer.group_send(
				group_name,
				{
					'type': 'accepted_invitation',
					'message':{
						'user': username,
						'tournament_id': tournament_id
					}
				}
			)
			for username, channel_name in user_channels.items():
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'user_join_tournament',
						'message': {
							'tournament_id' : tournament_id,
						}
					}
				)

async def loged_again(self, data, user_channels):
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
	for member in members:
		is_started = await sync_to_async(lambda: member.tournament.is_started)()
		if not is_started:
			tournament_id = await sync_to_async(lambda: member.tournament.tournament_id)()
			group_name = f'tournament_{tournament_id}'
			await self.channel_layer.group_add(group_name, self.channel_name)
			break

async def deny_invite(self, data, user_channels):
	sender = await sync_to_async(customuser.objects.filter(username=data['message']['sender']).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=data['message']['tournament_id']).first)()
	tournamentInvite = await sync_to_async(TournamentInvitation.objects.filter(tournament=tournament, sender=sender, receiver=receiver).first)()
	await sync_to_async(tournamentInvite.delete)()

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
		await self.channel_layer.group_discard(group_name, channel_name)
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


async def Round_16_timer(self, data, user_channels):
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=the_tournament_id).first)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	group_name = f'tournament_{the_tournament_id}'
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'warn_members',
		}
	)
	# await asyncio.sleep(16)
	# for member in members:
	# 	username = await sync_to_async(lambda: member.user.username)()
	# 	channel_name = user_channels.get(username)
	# 	if channel_name:
	# 		await self.channel_layer.send(
	# 			channel_name,
	# 			{
	# 				'type': 'get_user_path',
	# 			}
	# 		)

async def start_tournament(self, data, user_channels):
	print("*******reached start")
	tournament_id = data['message']['tournament_id']
	global the_tournament_id
	the_tournament_id = tournament_id
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	tournament.is_started = True
	await sync_to_async(tournament.save)()
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	count = 1
	for member in members:
		username = await sync_to_async(lambda: member.user.username)()
		member.position = count
		member.rank = 'ROUND 16'
		count += 1
		await sync_to_async(member.save)()
		channel_name = user_channels.get(username)
		if channel_name:
			await self.channel_layer.send(
				channel_name,
				{
					'type': 'tournament_started'
				}
			)

# async def tournament_inform_or_eliminate(self, data, user_channels):
# 	username = data['message']['user']
# 	user = await sync_to_async(customuser.objects.filter(username=username).first)()
# 	members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
# 	# for member in members:
# 	# if he is in a tournament that is started and not finished and not eliminated

