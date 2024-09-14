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
from .common import notifs_user_channels
from mainApp.tasks import manage_tournament
import os
async def accept_invite(self, data, notifs_user_channels):
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
		channel_name_list = notifs_user_channels.get(username)
		user_channel_name = user_channels.get(username)
		tournamentMember = TournamentMembers(user=user, tournament=tournament)
		await sync_to_async(tournamentMember.save)()
		if channel_name_list:
			group_name = f'tournament_{tournament_id}'
			for channel_name in channel_name_list:
				await self.channel_layer.group_add(group_name, channel_name)
			if user_channel_name:
				await self.channel_layer.group_add(group_name, user_channel_name)
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
	sender_user = data['message']['user']
	tournament_id = data['message']['tournament_id']
	channel_layer = get_channel_layer()
	sender = await sync_to_async(customuser.objects.filter(username=sender_user).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=target).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	TournamentGameNotify = await sync_to_async(GameNotifications.objects.filter(tournament=tournament, user=sender, target=receiver).first)()
	if TournamentGameNotify is None:
		channel_name_list = notifs_user_channels.get(target)
		tournamentInv = GameNotifications(tournament=tournament, user=sender, target=receiver, mode='TournamentInvitation')
		await sync_to_async(tournamentInv.save)()
		for channel_name in channel_name_list:
			if channel_name:
					print(f"sender : {sender.username}, receiver : {receiver.username}, tournament : {tournament.tournament_id}, sender_image: {sender.avatar.path}")
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

async def deny_invite(self, data, notifs_user_channels):
	sender = await sync_to_async(customuser.objects.filter(username=data['message']['sender']).first)()
	receiver = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=data['message']['tournament_id']).first)()
	tournamentInvite = await sync_to_async(GameNotifications.objects.filter(tournament=tournament, user=sender, target=receiver).first)()
	await sync_to_async(tournamentInvite.delete)()
	channel_name_list = notifs_user_channels.get(data['message']['user'])
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



async def quarterFinal_timer(self, data):
	tournament_id = data['message']['tournament_id']
	username = data['message']['user']
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	tournament = await sync_to_async(Tournament.objects.filter(tournament_id=tournament_id).first)()
	tournamentMember = await sync_to_async(TournamentMembers.objects.filter(user=user, tournament=tournament).first)()
	is_owner = await sync_to_async(lambda: tournamentMember.is_owner)()
	if is_owner == True:
		asyncio.create_task(manage_tournament(self, tournament_id))


async def OtherRounds(self, actual_round, tournament):
	tournamentwarnnotification = TournamentWarnNotifications(tournament=tournament)
	# await sync_to_async(tournamentwarnnotification.save)()
	# group_name = f'tournament_{tournament.tournament_id}'
	# await self.channel_layer.group_send(
	# 	group_name,
	# 	{
	# 		'type': 'warn_members',
	# 		'message': {
	# 			'time' : tournamentwarnnotification.created_at.isoformat()
	# 		}
	# 	}
	# )
	# await send_user_eliminated_after_delay(self, tournament, actual_round)

async def get_right_room(tournament_id, tournament_rooms, username):
	room = {}
	t_rooms = tournament_rooms.get(str(tournament_id))
	if t_rooms:
		for room_id, the_room in t_rooms.items():
			if any(player['user'] == username for player in the_room.get('players', [])):
				return the_room
	return room
 