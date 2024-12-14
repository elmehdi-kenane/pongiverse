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
		user_channel_name = user_channels.get(user.id)
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
				channel_name = user_channels.get(member_user.id)
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
			for channel_name in channel_name_list:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'user_join_tournament',
						'message': {
							'tournament_id' : tournament_id,
						}
					}
				)

	async def invite_friend(self, data, notifs_user_channels):
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
			print(f"\n\n CHANNEL NAME LIST : {channel_name_list} \n\n")
			tournamentInv = GameNotifications(tournament_id=tournament_id, user=sender, target=receiver, mode='TournamentInvitation')
			await sync_to_async(tournamentInv.save)()
			for channel_name in channel_name_list:
				if channel_name:
						await self.channel_layer.send(
									channel_name,
									{
										'type': 'invited_to_tournament',
										'message': {
											'tournament_id' : tournament_id,
											'user' : sender_user,
											'image' : f"http://{ip_address}:8000/auth{sender.avatar.url}",
											'roomID' : '',
											'mode' : 'TournamentInvitation'
										}
									}
								)

async def deny_invite(self, data, notifs_user_channels):
	sender = await sync_to_async(customuser.objects.filter(username=data['message']['sender']).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	tournamentInvite = await sync_to_async(GameNotifications.objects.filter(tournament_id=data['message']['tournament_id'], user=sender, target=receiver).first)()
	if tournamentInvite is not None:
		await sync_to_async(tournamentInvite.delete)()
	channel_name_list = notifs_user_channels.get(receiver.id)
	for channel_name in channel_name_list:
		if channel_name:
			await self.channel_layer.send(
				channel_name,
				{
					'type': 'deny_tournament_invitation',
					'message': {
						'user': data['message']['sender']
					}
				}
			)



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
	print(f"\n USERname: {username}, is_owner: {is_user_owner_in_tournament(username, tournament_id)}\n")
	if is_user_owner_in_tournament(username, tournament_id) == True:
		asyncio.create_task(manage_tournament(self, tournament_id))


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