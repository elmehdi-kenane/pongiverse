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
	await asyncio.sleep(20)
	print("WSEL HNAAAAAAA: ", actual_round)
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
		round = Round(tournament=tournament, type=next_round)
		await sync_to_async(round.save)()
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




async def quarterFinal_timer(self, data):
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
		await send_user_eliminated_after_delay(self, tournament, "QUARTERFINAL")


async def OtherRounds(self, actual_round, tournament):
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

async def get_right_room(tournament_id, tournament_rooms, username):
	room = {}
	t_rooms = tournament_rooms.get(str(tournament_id))
	if t_rooms:
		for room_id, the_room in t_rooms.items():
			if any(player['user'] == username for player in the_room.get('players', [])):
				return the_room
	return room
 
