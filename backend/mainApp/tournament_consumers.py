import json
from datetime import datetime
import random
import time
import asyncio
import math
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import datetime
from friends.models import Friendship
from myapp.models import customuser
from .models import Match, ActiveMatch, PlayerState, Tournament, TournamentMembers, Round, TournamentUserInfo, TournamentWarnNotifications, DisplayOpponent, GameNotifications, UserMatchStatics
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
import base64
import asyncio
import requests
from Notifications.common import notifs_user_channels
from .common import tournament_rooms, user_channels, tournaments
import os

async def disconnected(self, user_channels):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		try:
			print("------------------> INSIDE THE DISCONNECT")
			decoded_token = await sync_to_async(RefreshToken)(token)
			payload_data = await sync_to_async(lambda: decoded_token.payload)()
			user_id = payload_data.get('user_id')
			if user_id:
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		except TokenError:
			pass


async def send_playing_status_to_friends(self, user, status, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	for friend in friends:
		friend_id = await sync_to_async(lambda: friend.friend.id)()
		friend_channel = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
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
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}"
					}
				}
			})


async def create_tournament(self, data, user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	username = data['message']['user']
	userrr = username
	is_joining_tour = is_user_joining_tournament(username)
	if is_joining_tour == 0:
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		if user is not None:
			invitations = await sync_to_async(lambda: GameNotifications.objects.filter(target=user))()
			await sync_to_async(invitations.delete)()
			channel_layer = get_channel_layer()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
			for friend in friends:
				friend_id = await sync_to_async(lambda: friend.friend.id)()
				channel_name = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
				if channel_name:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'friend_created_tournament',
							'message': {
								'friend_username': friend.friend.username,
								'userInfos': {
											'id': user.id,
											'name': user.username,
											'level': 2,
											'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
										}
							}
						}
					)
			# channel_name = user_channels.get(user.id)
			while True:
				random_number = random.randint(100000000, 1000000000)
				if random_number not in tournaments:
					break
			user.is_playing = True
			await sync_to_async(user.save)()
			tournaments[random_number] = {}
			tournaments[random_number]['members'] = []
			tournaments[random_number]['is_started'] = False
			tournaments[random_number]['is_finished'] = False
			new_member = {"username": username, "is_owner": True, "is_eliminated": False, "is_inside": True}
			tournaments[random_number]['members'].append(new_member)
			group_name = f'tournament_{random_number}'
			channel_name = user_channels.get(user.id).channel_name if user.id in user_channels else None
			if channel_name:
				await channel_layer.group_add(group_name, channel_name)
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
				if channel_name.channel_name:
					await self.channel_layer.send(
						channel_name.channel_name,
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
			await send_playing_status_to_friends(self, user, True, user_channels)


def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username and member['is_eliminated'] == False and (tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)):
				return tournament_id
	return 0


async def loged_again(self, data, user_channels):
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.get)(username=username)
	tournament_id = is_user_joining_tournament(username)
	if tournament_id != 0:
		group_name = f'tournament_{tournament_id}'
		channel_names_list = notifs_user_channels.get(user.id)
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
			channel_name.channel_name,
			{
				'type': 'user_kicked_from_tournament',
				'message': {
					'tournament_id' : tournament_id,
				}
			}
		)



async def check_user_is_a_friend(user, to_check):
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	for friend in friends:
		friend_username = await sync_to_async(lambda: friend.friend.username)()
		if friend_username == to_check.username:
			return True
	return False

async def leave_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	ip_address = os.getenv("IP_ADDRESS")
	kicked_user = await sync_to_async(customuser.objects.get)(username=data['message']['kicked'])
	kicked_user.is_playing = False
	await sync_to_async(kicked_user.save)()
	group_name = f'tournament_{tournament_id}'
	for member in tournaments[tournament_id]['members']:
		user = await sync_to_async(customuser.objects.filter(username=member['username']).first)()
		is_a_friend = await check_user_is_a_friend(kicked_user, user)
		channel_name = user_channels.get(user.id).channel_name if user.id in user_channels else None
		if channel_name:
			await self.channel_layer.send(
			channel_name,
			{
				'type': 'leave_tournament',
				'message':{
					'kicked': data['message']['kicked'],
					'is_a_friend': is_a_friend,
					'userInfos': {
						'id': kicked_user.id,
						'name': kicked_user.username,
						'level': 2,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{kicked_user.avatar.url}" ,
						'is_playing' : kicked_user.is_playing
					}
				}
			}
	)
	delete_member(tournament_id, data['message']['kicked'])
	channel_name = user_channels.get(kicked_user.id).channel_name if kicked_user.id in user_channels else None
	await self.channel_layer.group_discard(group_name, channel_name)
	channel_name_notif_list = notifs_user_channels.get(kicked_user.id)
	if channel_name_notif_list:
		for channel_name_notif in channel_name_notif_list:
			await self.channel_layer.group_discard(group_name, channel_name_notif)
	for user_id, channel_name in user_channels.items():
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		is_a_friend = await check_user_is_a_friend(kicked_user, user)
		await self.channel_layer.send(
			channel_name.channel_name,
			{
				'type': 'user_leave_tournament',
				'message': {
					'user': data['message']['kicked'],
					'is_a_friend': is_a_friend,
					'tournament_id' : tournament_id,
					'userInfos': {
						'id': kicked_user.id,
						'name': kicked_user.username,
						'level': 2,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{kicked_user.avatar.url}" ,
						'is_playing' : kicked_user.is_playing
					}
				}
			}
		)
	await send_playing_status_to_friends(self, kicked_user, False, user_channels)



async def destroy_tournament(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	ip_address = os.getenv("IP_ADDRESS")
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	group_name = f'tournament_{tournament_id}'
	mytournament = tournaments[tournament_id]
	del tournaments[tournament_id]
	await self.channel_layer.group_send(
		group_name,
		{
			'type': 'tournament_destroyed'
		}
	)
	for member in mytournament['members'] :
		username = member['username']
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		user.is_playing = False
		await sync_to_async(user.save)()
		channel_name = user_channels.get(user.id).channel_name if user.id in user_channels else None
		channel_name_notif_list = notifs_user_channels.get(user.id)
		if channel_name:
			await self.channel_layer.group_discard(group_name, channel_name)
		if channel_name_notif_list:
			for channel_name_notif in channel_name_notif_list:
				await self.channel_layer.group_discard(group_name, channel_name_notif)
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	for friend in friends:
		friend_id = await sync_to_async(lambda: friend.friend.id)()
		channel_name = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
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
							'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}" ,
						}
					}
				}
			)
	await send_playing_status_to_friends(self, user, False, user_channels)
	for username, channel_name in user_channels.items():
		if channel_name.channel_name:
			await self.channel_layer.send(
				channel_name.channel_name,
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
		count += 1
	for member in members:
		user = await sync_to_async(customuser.objects.filter(username=member['username']).first)()
		channel_name = user_channels.get(user.id).channel_name if user.id in user_channels else None
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
	for username, channel_name in list(user_channels.items()):
		if channel_name.channel_name:
			await self.channel_layer.send(
				channel_name.channel_name,
				{
					'type': 'tournament_started_by_user',
					'message': {
						'tournament_id' : tournament_id,
					}
				}
			)



async def invite_friend(self, data):
	target = data['message']['invited']
	ip_address = os.getenv("IP_ADDRESS")
	sender_user = data['message']['user']
	tournament_id = data['message']['tournament_id']
	channel_layer = get_channel_layer()
	sender = await sync_to_async(customuser.objects.filter(username=sender_user).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=target).first)()	
	TournamentGameNotify = await sync_to_async(GameNotifications.objects.filter(tournament_id=tournament_id, user=sender, target=receiver).first)()
	if TournamentGameNotify is None:
		channel_name_list = notifs_user_channels.get(receiver.id)
		#printf"\n\n CHANNEL NAME LIST : {channel_name_list} \n\n")
		tournamentInv = GameNotifications(tournament_id=tournament_id, user=sender, target=receiver, mode='TournamentInvitation')
		# tournament_id, user, avatar, roomID, mode
		await sync_to_async(tournamentInv.save)()
		if channel_name_list:
			for channel_name in channel_name_list:
				if channel_name:
						usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=sender).first)()
						await self.channel_layer.send(
									channel_name,
									{
										'type': 'invited_to_tournament',
										'message': {
											'tournament_id' : tournament_id,
											'user' : sender_user,
											'level' : usermatchstats.level,
											'image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{sender.avatar.url}",
											'roomID' : '',
											'mode' : 'TournamentInvitation'
										}
									}
								)


async def accept_invite(self, data, user_channels):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	id_to_check = is_user_joining_tournament(username)
	if id_to_check == 0:
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		invitations = await sync_to_async(lambda: GameNotifications.objects.filter(target=user))()
		await sync_to_async(invitations.delete)()
		channel_layer = get_channel_layer()
		user.is_playing = True
		await sync_to_async(user.save)()
		channel_name_list = notifs_user_channels.get(user.id)
		user_channel_name = user_channels.get(user.id).channel_name if user.id in user_channels else None
		new_member = {"username": username, "is_owner": False, "is_eliminated": False, "is_inside": True}
		tournaments[tournament_id]['members'].append(new_member)
		if channel_name_list:
			group_name = f'tournament_{tournament_id}'
			for channel_name in channel_name_list:
				await self.channel_layer.group_add(group_name, channel_name)
			if user_channel_name:
				await self.channel_layer.group_add(group_name, user_channel_name)
		for member in tournaments[tournament_id]['members']:
			member_user = await sync_to_async(customuser.objects.filter(username=member['username']).first)()
			if member_user:
				channel_name = user_channels.get(member_user.id).channel_name if member_user.id in user_channels else None
				if channel_name:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'accepted_invitation',
							'message':{
								'user': username,
								'tournament_id': tournament_id
							}
						}
					)
		#printf"\n channel name: {self.channel_name} \n")
		await self.channel_layer.send(
			self.channel_name,
			{
				'type': 'accepted_invitation',
				'message':{
					'user': username,
					'tournament_id': tournament_id
				}
			}
		)
		for name, channel_name_list in notifs_user_channels.items():
			for channel_name in channel_name_list:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'user_join_tournament',
						'message': {
							'user' : username,
							'tournament_id' : tournament_id,
						}
					}
				)
		
		await send_playing_status_to_friends(self, user, True, user_channels)
