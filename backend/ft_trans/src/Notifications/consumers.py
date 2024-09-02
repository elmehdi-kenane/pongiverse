from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from myapp.models import customuser
from asgiref.sync import sync_to_async
from chat.models import Friends
import json
from . import game_notifs_consumers, tournament_notifs_consumers
from mainApp.models import TournamentMembers
from .common import notifs_user_channels
# notifs_user_channels = {}

class NotificationsConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('token')
		decoded_token = AccessToken(token)
		payload_data = decoded_token.payload
		user_id = payload_data.get('user_id')
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		if user is not None:
			await self.accept()
			username = user.username
			tmp_username = username
			user.is_online = True
			await sync_to_async(user.save)()
			if notifs_user_channels.get(username):
				notifs_user_channels[username].append(self.channel_name)
			else:
				notifs_user_channels[username] = [self.channel_name]
			self.group_name = f"friends_group{user_id}"
			await self.channel_layer.group_add(self.group_name, self.channel_name)
			# channel_layer = get_channel_layer()
			friends = await sync_to_async(list)(Friends.objects.filter(user=user))
			# #print(f"ALL THE USERS CHANNEL_NAMES : {notifs_user_channels}")
			for friend in friends:
				friend_username = await sync_to_async(lambda: friend.friend.username)()
				friend_is_online = await sync_to_async(lambda: friend.friend.is_online)()
				channel_name_list = notifs_user_channels.get(friend_username)
				if channel_name_list:
					for channel_name in channel_name_list:
					# channel_name = notifs_user_channels.get(friend_username)
						# #print(f"USER CHANNEL ON CONNECT IS : {channel_name}")
						if channel_name and friend_is_online and not user.is_playing:
							await self.channel_layer.send(
								channel_name,
								{
									'type': 'connected_again',
									'message': {
											'user': username,
											'userInfos': {
												'id': user.id,
												'name': user.username,
												'level': 2,
												'image': user.avatar.path,
											}
										}
								}
							)
			userinTournaments = await sync_to_async(list)(TournamentMembers.objects.filter(user=user))
			for member in userinTournaments:
				is_started = await sync_to_async(lambda: member.tournament.is_started)()
				if is_started == False:
					tournamentmembers = await sync_to_async(list)(TournamentMembers.objects.filter(tournament=member.tournament))
					for tournamentmember in tournamentmembers:
						memberusername = await sync_to_async(lambda: tournamentmember.user.username)()
						channel_name_list = notifs_user_channels.get(memberusername)
						if channel_name_list:
							for channel_name in channel_name_list:
								if channel_name:
									await self.channel_layer.send(
									channel_name,
									{
										'type': 'connected_again_tourn',
										'message': {
											'user': tmp_username,
											'userInfos': {
												'id': user.id,
												'name': user.username,
												'level': 2,
												'image': user.avatar.path,
											}
										}
									}
								)
		else:
			self.socket.close()

	async def receive(self, text_data=None):
		data = json.loads(text_data)

		# if data['type'] == 'acceptInvitation': await game_notifs_consumers.onevsone_accept_invite(self, data)
		if data['type'] == 'acceptInvitation': await game_notifs_consumers.accept_game_invite(self, data, notifs_user_channels)
		elif data['type'] == 'refuseInvitation': await game_notifs_consumers.refuse_game_invite(self, data, notifs_user_channels)
		elif data['type'] == 'inviteFriendGame': await game_notifs_consumers.invite_friend(self, data, notifs_user_channels)
		elif data['type'] == 'accept-tournament-invitation': await tournament_notifs_consumers.accept_invite(self, data, notifs_user_channels)
		elif data['type'] == 'invite-friend': await tournament_notifs_consumers.invite_friend(self, data, notifs_user_channels)
		elif data['type'] == 'deny-tournament-invitation': await tournament_notifs_consumers.deny_invite(self, data, notifs_user_channels)
		elif data['type'] == 'Round-16-timer': await tournament_notifs_consumers.Round_16_timer(self, data)



	async def disconnect(self, close_code):
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
			# user_channels.pop(username, None)
			channel_name_list = notifs_user_channels.get(username)
			if channel_name_list:
				channel_name_list.remove(self.channel_name)
				if not len(channel_name_list):
					notifs_user_channels.pop(username, None)
			# channel_layer = get_channel_layer()
			user = await sync_to_async(customuser.objects.filter(username=username).first)()
			#### in case of logout
			for username, channel_name_list in notifs_user_channels.items():
				for channel_name in channel_name_list:
					await self.channel_layer.send(
						channel_name,
						{
							'type': 'user_disconnected',
							'message': {
								'user': tmp_username
							}
						}
					)

	async def receiveFriendGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receiveFriendGame',
			'message': event['message']
		}))

	async def playingStatus(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playingStatus',
			'message': event['message']
		}))

	async def connected_again(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again',
			'message': event['message']
		}))

	async def connected_again_tourn(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connected_again_tourn',
			'message': event['message']
		}))

	async def goToGamingPage(self, event):
		await self.send(text_data=json.dumps({
			'type': 'goToGamingPage',
			'message': event['message']
		}))

	async def user_disconnected(self, event):
		await self.send(text_data=json.dumps({
			'type': 'user_disconnected',
			'message': event['message']
		}))

	async def accepted_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accepted_invitation',
			'message': event['message']
		}))

	async def tournament_destroyed(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'tournament_destroyed'
		}))

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'leave_tournament',
			'message' : event['message']
		}))

	async def user_join_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_join_tournament',
			'message' : event['message']
		}))

	async def warn_members(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'warn_members',
			'message' : event['message']
		}))

	async def you_and_your_user(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'you_and_your_user',
			'message' : event['message']
		}))

	async def invited_to_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'invited_to_tournament',
			'message': event['message']
		}))

	async def deny_tournament_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'deny_tournament_invitation',
			'message': event['message']
		}))
