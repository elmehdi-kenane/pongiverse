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
from .common import notifs_user_channels
from mainApp.tasks import manage_tournament
import os


def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username and member['is_eliminated'] == False and (tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)):
				return tournament_id
	return 0

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

async def accept_invite(self, data):
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
		if channel_name_list:
			for channel_name in channel_name_list:
				if channel_name != self.channel_name:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'remove_tournament_notif',
							'message': {
								'tournament_id' : tournament_id,
								'user' : username
							}
						}
					)
		for username, channel_name_list in notifs_user_channels.items():
			if channel_name_list:
				for channel_name in channel_name_list:
					if channel_name:
						await self.channel_layer.send(
							channel_name,
							{
								'type': 'user_join_tournament',
								'message': {
									'tournament_id' : tournament_id,
								}
							}
						)
		await send_playing_status_to_friends(self, user, True, user_channels)


async def deny_invite(self, data, notifs_user_channels):
	sender = await sync_to_async(customuser.objects.filter(username=data['message']['sender']).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	tournamentInvite = await sync_to_async(GameNotifications.objects.filter(tournament_id=data['message']['tournament_id'], user=sender, target=receiver).first)()
	if tournamentInvite is not None:
		await sync_to_async(tournamentInvite.delete)()



async def get_player_position(tournament, member, actual_round):
	round = await sync_to_async(Round.objects.filter(tournament=tournament, type=actual_round).first)()
	usertournamentinfo = await sync_to_async(TournamentUserInfo.objects.filter(user=member, round=round).first)()
	position = usertournamentinfo.position
	return position

def is_user_owner_in_tournament(user_to_check, tournament_id):
	if tournament_id in tournaments:
		for member in tournaments[tournament_id]['members']:
			if member['username'] == user_to_check:
				return member['is_owner']
	return False

async def quarterFinal_timer(self, data):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	if is_user_owner_in_tournament(username, tournament_id) == True:
		asyncio.create_task(manage_tournament(tournament_id))


async def get_right_room(tournament_id, tournament_rooms, username):
	room = {}
	t_rooms = tournament_rooms.get(str(tournament_id))
	if t_rooms:
		for room_id, the_room in t_rooms.items():
			if any(player['user'] == username for player in the_room.get('players', [])):
				return the_room
	return room

async def delete_display_oponent(self, data):
	user1 = data['message']['user1']
	user2 = data['message']['user2']
	displayopponent = await sync_to_async(DisplayOpponent.objects.filter(user1=user1, user2=user2).first)()
	if displayopponent is not None:
		await sync_to_async(displayopponent.delete)()