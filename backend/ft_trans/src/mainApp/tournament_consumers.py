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
import asyncio
import requests

the_tournament_id = 0

async def disconnected(self, user_channels):
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
		members = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
		for member in members:
			is_started = await sync_to_async(lambda: member.tournament.is_started)()
			is_finished = await sync_to_async(lambda:  member.tournament.is_finished)()
			is_eliminated = await sync_to_async(lambda: member.is_eliminated)()
			if is_started == False or (is_started == True and is_finished == False and is_eliminated == False):
				member.is_inside = False
				await sync_to_async(member.save)()
		channel_layer = get_channel_layer()
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
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
	print("hmededede")
	username = data['message']['user']
	userrr = username
	flag = 0
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	if user is not None:
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
	target = data['message']['invited']
	sender_user = data['message']['user']
	tournament_id = data['message']['tournament_id']
	channel_layer = get_channel_layer()
	channel_name = user_channels.get(target)
	if channel_name:
		sender = await sync_to_async(customuser.objects.filter(username=sender_user).first)()
		receiver = await sync_to_async(customuser.objects.filter(username=target).first)()
		tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
		TournamentGameNotify = await sync_to_async(GameNotifications.objects.filter(tournament=tournament, user=sender, target=receiver).first)()
		if TournamentGameNotify is None:
			print(f"sender : {sender.username}, receiver : {receiver.username}, tournament : {tournament.tournament_id}, sender_image: {sender.avatar.path}")
			tournamentInv = GameNotifications(tournament=tournament, user=sender, target=receiver, mode='TournamentInvitation')
			await sync_to_async(tournamentInv.save)()
			await self.channel_layer.send(
						channel_name,
						{
							'type': 'invited_to_tournament',
							'message': {
								'tournament_id' : tournament_id,
								'user' : sender_user,
								'avatar' : sender.avatar.path,
								'roomID' : '',
								'mode' : 'TournamentInvitation'
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
		invitations = await sync_to_async(lambda: GameNotifications.objects.filter(target=user))()
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
	tournamentInvite = await sync_to_async(GameNotifications.objects.filter(tournament=tournament, user=sender, target=receiver).first)()
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
		if channel_name:
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

async def send_user_eliminated_after_delay(self, tournament, user_channels):
	await asyncio.sleep(10)
	Tournamentwarnnotification = await sync_to_async(TournamentWarnNotifications.objects.filter(tournament=tournament).first)()
	await sync_to_async(Tournamentwarnnotification.delete)()
	print("----after----")
	group_name = f'tournament_{the_tournament_id}'
	members = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=tournament))
	for member in members :
		is_inside = await sync_to_async(lambda: member.is_inside)()
		username = await sync_to_async(lambda: member.user.username)()
		if is_inside == False:
			member.is_eliminated = True
			await sync_to_async(member.save)()
			member.user.is_playing = False
			await sync_to_async(member.user.save)()
			channel_name = user_channels.get(username)
			await self.channel_layer.group_discard(group_name, channel_name)
			friends = await sync_to_async(list)(Friends.objects.filter(user=member.user))
			for friend in friends:
				friend_username = await sync_to_async(lambda: friend.friend.username)()
				channel_name = user_channels.get(friend_username)
				if channel_name:
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
	round = Round(tournament=tournament, type='QUARTERFINAL')
	await sync_to_async(round.save)()
	count = 16
	for i in range(0, len(members), 2):
		count+= 1
		member1 = members[i]
		member2 = members[i+1] if i + 1 < len(members) else None
		is_eliminated1 = await sync_to_async(lambda: member1.is_eliminated)()
		is_eliminated2 = await sync_to_async(lambda: member2.is_eliminated)()
		if is_eliminated1 == True and is_eliminated2 == True:
			tournamentuserinfo = TournamentUserInfo(round=round, user=None, position=count)
			await sync_to_async(tournamentuserinfo.save)()
		elif is_eliminated1 == True:
			tournamentuserinfo = TournamentUserInfo(round=round, user=member2.user, position=count)
			await sync_to_async(tournamentuserinfo.save)()
		elif is_eliminated2 == True:
			tournamentuserinfo = TournamentUserInfo(round=round, user=member1.user, position=count)
			await sync_to_async(tournamentuserinfo.save)()
		elif is_eliminated1 == False and is_eliminated2 == False:
			displayoponent = DisplayOpponent(user1=member1.user, user2=member2.user)
			await sync_to_async(displayoponent.save)()
			sixteenround = await sync_to_async(Round.objects.filter(tournament=tournament, type='ROUND 16').first)()
			tournamentuserinfo1 = await sync_to_async(TournamentUserInfo.objects.filter(round=sixteenround, user=member1.user).first)()
			tournamentuserinfo2 = await sync_to_async(TournamentUserInfo.objects.filter(round=sixteenround, user=member2.user).first)()
			username1 = await sync_to_async(lambda: member1.user.username)()
			username2 = await sync_to_async(lambda: member2.user.username)()
			channel_name1 = user_channels.get(username1)
			channel_name2 = user_channels.get(username2)
			await self.channel_layer.send(
				channel_name1,
				{
					'type': 'you_and_your_user',
					'message':{
						'user1': username1,
						'user2' : username2,
						'time' : displayoponent.created_at.isoformat()
					}
				}
			)
			await self.channel_layer.send(
				channel_name2,
				{
					'type': 'you_and_your_user',
					'message':{
						'user1': username1,
						'user2' : username2,
						'time' : displayoponent.created_at.isoformat()
					}
				}
			)


async def Round_16_timer(self, data, user_channels):
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=the_tournament_id).first)()
	tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
	await sync_to_async(tournamentwarnnotification.save)()
	asyncio.create_task(send_user_eliminated_after_delay(self, tournament, user_channels))

async def start_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	global the_tournament_id
	the_tournament_id = tournament_id
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
					'type': 'tournament_started'
				}
			)


