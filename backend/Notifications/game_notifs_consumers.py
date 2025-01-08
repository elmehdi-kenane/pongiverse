import math
import json
import random
import base64
import asyncio
import datetime
# from friends.models import Friendship
from friends.models import Friendship
from myapp.models import customuser
from asgiref.sync import sync_to_async
from mainApp.models import Match, ActiveMatch, PlayerState, NotifPlayer, GameNotifications, MatchStatistics, UserMatchStatics
from mainApp.common import rooms, user_channels
import os

@sync_to_async
def generate_unique_room_id(self):
	while True:
		room_id = random.randint(1000000, 1000000000)  # Adjust the range as needed
		if not ActiveMatch.objects.filter(room_id=room_id).exists() and not Match.objects.filter(id=room_id).exists():
			return room_id

async def invite_friend(self, data, notifs_user_channels):
	ip_address = os.getenv("IP_ADDRESS")
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	if not user1 or not user2 or user1.is_playing or user2.is_playing:
		return
	active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
	for active_match in active_matches:
		sender = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=user1).first)()
		if sender:
			user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
			if not receiver:
				await sync_to_async(NotifPlayer.objects.create)(
					active_match = active_match,
					player = user2,
				)
				await sync_to_async(GameNotifications.objects.create)(
					active_match = active_match,
					user = user1,
					target = user2,
					mode="1vs1"
				)
				friend_channel_list = notifs_user_channels.get(user2.id)
				if friend_channel_list:
					for friend_channel in friend_channel_list:
						usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
						await self.channel_layer.send(friend_channel, {
							'type': 'receiveFriendGame',
							'message': {
								'user': data['message']['user'],
								'level': usermatchstats.level,
								'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}" ,
								'roomID': active_match.room_id,
								'mode': '1vs1'
							}
						})
			return
	room_id = await generate_unique_room_id(self)
	user1 = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	user2 = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.create)(
		mode = '1vs1',
		room_type = 'friends',
		room_id = room_id,
		status = 'notStarted',
		ballX = 355,
		ballY = 200
	)
	user1.is_playing = True
	await sync_to_async(user1.save)()
	await sync_to_async(PlayerState.objects.create)(
		active_match = active_match,
		player = user1,
		state = 'inactive',
		playerNo = 1,
		paddleX = 15,
		paddleY = 165,
		score = 0
	)

	user_channel_list = notifs_user_channels.get(user1.id)
	#print"************ WAS HEEERE BACKK: ", user_channel_list)
	if user_channel_list:
		#print"****************************************** HERE I AM")
		for channel_name in user_channel_list:
			# await self.channel_layer.group_add(str(room['id']), channel_name)
			#print"****************************************** HERE I AM2")
			if channel_name == self.channel_name:
				#print"****************************************** HERE I AM3")
				await self.channel_layer.send(channel_name, {
					'type': 'goToGamingPage',
					'message': {
						'mode': '1vs1'
					}
				})
				break
	#print"************ WAS HEEERE BACKK2")
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user1))
	for friend in friends:
		friend_id = await sync_to_async(lambda: friend.friend.id)()
		#print"************ WAS HEEERE BACKK")
		friend_channel = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
		if friend_channel:
			await self.channel_layer.send(friend_channel, {
				'type': 'playingStatus',
				'message': {
					'user': user1.username,
					'is_playing': True
				}
			})
	receiver = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=user2).first)()
	# ##print"ENTER 4")
	if not receiver:
		await sync_to_async(NotifPlayer.objects.create)(
			active_match = active_match,
			player = user2,
		)
		await sync_to_async(GameNotifications.objects.create)(
			active_match = active_match,
			user = user1,
			target = user2,
			mode="1vs1"
		)
		# ##print"ENTER 5")
		# if receiver and receiver.is_online and not receiver.is_playing:
		# ##print"ENTER 6")
		friend_channel_list = notifs_user_channels.get(user2.id)
		if friend_channel_list:
			# ##print"ENTER 7")
			# with user1.avatar.open('rb') as f:
			#     image_data = base64.b64encode(f.read()).decode('utf-8')
			for friend_channel in friend_channel_list:
				usermatchstats = await sync_to_async(UserMatchStatics.objects.filter(player=user1).first)()
				await self.channel_layer.send(friend_channel, {
					'type': 'receiveFriendGame',
					'message': {
						'user': data['message']['user'],
						'level': usermatchstats.level,
						'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user1.avatar.url}",
						'roomID': active_match.room_id,
						'mode': '1vs1'
					}
				})
	waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=user1))
	for waited_invite in waited_invites:
		await sync_to_async(waited_invite.delete)()
	player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=user1))
	for player_notif in player_notifs:
		await sync_to_async(player_notif.delete)()

async def accept_game_invite(self, data, notifs_user_channels):
	creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['roomID']).first)()
	if active_match:
		is_invited = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=friend).first)()
		if is_invited:
			room = {
				'id': active_match.room_id,
				'players': [{
					'user': creator.username,
					'state': 'inactive',
					'playerNo': 1,
					'paddleX': 15,
					'paddleY': 165,
					'score': 0,
					'status': '',
					'hit': 0, ####### added
					'self_scored': 0, ####### added
					'tmp_scored': 0 ####### added
				}, {
					'user': friend.username,
					'state': 'inactive',
					'playerNo': 2,
					'paddleX': 685,
					'paddleY': 165,
					'score': 0,
					'status': '',
					'hit': 0, ####### added
					'self_scored': 0, ####### added
					'tmp_scored': 0 ####### added
				}],
				'ball': {
					'ballX': 355,
					'ballY': 200
				},
				'winner': 0,
				'status': 'notStarted',
				'mode': '1vs1',
				'type': 'friends',
				'date_started': datetime.datetime.now().isoformat(),
				'time': 0
			}
			rooms[str(room['id'])] = room
			await sync_to_async(active_match.delete)()
			# await self.channel_layer.group_add(str(room['id']), self.channel_name)
			channel_name = user_channels.get(creator.id).channel_name if creator.id in user_channels else None
			if channel_name:
				await self.channel_layer.group_add(str(room['id']), channel_name)
			target_channel_list = notifs_user_channels.get(friend.id)
			if target_channel_list:
				for channel_name in target_channel_list:
					if channel_name == self.channel_name:
						await self.channel_layer.send(channel_name, {
							'type': 'goToGamingPage',
							'message': {
								'mode': '1vs1'
							}
						})
						break
			friend.is_playing = True
			await sync_to_async(friend.save)()
			friends = await sync_to_async(list)(Friendship.objects.filter(user=friend))
			for user in friends:
				friend_id = await sync_to_async(lambda: user.friend.id)()
				friend_channel = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
				if friend_channel:
					await self.channel_layer.send(friend_channel, {
						'type': 'playingStatus',
						'message': {
							'user': friend.username,
							'is_playing': True
						}
					})
			waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=friend))
			for waited_invite in waited_invites:
				await sync_to_async(waited_invite.delete)()
			player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=friend))
			for player_notif in player_notifs:
				await sync_to_async(player_notif.delete)()

async def accept_game_invite_mp(self, data, notifs_user_channels):
	creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['roomID']).first)()
	if active_match:
		is_invited = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=friend).first)()
		if is_invited:
			player_states = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
			player = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
			if player_states == 3:
				await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 4,
						paddleX = 685,
						paddleY = 265,
						score = 0
					)
				player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
				players = []
				users = []
				user_no = 1
				for player_state in player_states:
					player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
					players.append({
						'user': player.username,
						'state': player_state.state,
						'playerNo': player_state.playerNo,
						'paddleX': player_state.paddleX,
						'paddleY': player_state.paddleY,
						'score': player_state.score,
						'status': '',
						'inside': True,
						'total_hit': 0, ####### added
						'self_scored': 0, ####### added
						'tmp_scored': 0 ####### added
					})
					user_no += 1
				room = {
					'id': active_match.room_id,
					'players': players,
					'ball': {
						'ballX': active_match.ballX,
						'ballY': active_match.ballY
					},
					'winner': 0,
					'status': active_match.status,
					'mode': active_match.mode,
					'type': active_match.room_type,
					'date_started': datetime.datetime.now().isoformat(),
					'time': 0
				}
				rooms[str(room['id'])] = room
				await sync_to_async(active_match.delete)()
				channel_name = user_channels.get(creator.id).channel_name if creator.id in user_channels else None
				if channel_name:
					await self.channel_layer.group_add(str(room['id']), channel_name)
				target_channel_list = notifs_user_channels.get(friend.id)
				if target_channel_list:
					for channel_name in target_channel_list:
						if channel_name == self.channel_name:
							await self.channel_layer.send(channel_name, {
								'type': 'goToGamingPage',
								'message': {
									'mode': '2vs2'
								}
							})
							break
				friend.is_playing = True
				await sync_to_async(friend.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=friend))
				for user in friends:
					friend_id = await sync_to_async(lambda: user.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': friend.username,
								'is_playing': True
							}
						})
				waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=friend))
				for waited_invite in waited_invites:
					await sync_to_async(waited_invite.delete)()
				player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=friend))
				for player_notif in player_notifs:
					await sync_to_async(player_notif.delete)()
				return
			else:
				if player_states == 1:
					await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 2,
						paddleX = 15,
						paddleY = 265,
						score = 0
					)
				elif player_states == 2:
					await sync_to_async(PlayerState.objects.create)(
						active_match = active_match,
						player = player,
						state = 'inactive',
						playerNo = 3,
						paddleX = 685,
						paddleY = 65,
						score = 0
					)
				player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
				target_channel_list = notifs_user_channels.get(friend.id)
				if target_channel_list:
					for channel_name in target_channel_list:
						if channel_name == self.channel_name:
							await self.channel_layer.send(channel_name, {
								'type': 'goToGamingPage',
								'message': {
									'mode': '2vs2'
								}
							})
							break
				friend.is_playing = True
				await sync_to_async(friend.save)()
				friends = await sync_to_async(list)(Friendship.objects.filter(user=friend))
				for user in friends:
					friend_id = await sync_to_async(lambda: user.friend.id)()
					friend_channel = user_channels.get(friend_id).channel_name if friend_id in user_channels else None
					if friend_channel:
						await self.channel_layer.send(friend_channel, {
							'type': 'playingStatus',
							'message': {
								'user': friend.username,
								'is_playing': True
							}
						})
				waited_invites = await sync_to_async(list)(NotifPlayer.objects.filter(player=friend))
				for waited_invite in waited_invites:
					await sync_to_async(waited_invite.delete)()
				player_notifs = await sync_to_async(list)(GameNotifications.objects.filter(target=friend))
				for player_notif in player_notifs:
					await sync_to_async(player_notif.delete)()

async def refuse_game_invite(self, data, notifs_user_channels):
	for key, value in rooms.items():
		if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
			await self.send(text_data=json.dumps({
				'type': 'alreadyPlaying',
				'message': 'alreadyPlaying'
			}))
			return
		if value['players'][0]['user'] == data['message']['target'] or value['players'][1]['user'] == data['message']['target']:
			await self.send(text_data=json.dumps({
				'type': 'alreadyPlaying',
				'message': 'alreadyPlaying'
			}))
			return
	creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
	friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
	active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['roomID']).first)()
	if active_match:
		is_invited = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=friend).first)()
		if is_invited:
			await sync_to_async(is_invited.delete)()
			game_notif = await sync_to_async(GameNotifications.objects.filter(active_match=active_match, target=friend).first)()
			await sync_to_async(game_notif.delete)()

