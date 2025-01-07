from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from myapp.models import customuser
from asgiref.sync import sync_to_async
from friends.models import Friendship
import json
from . import game_notifs_consumers, tournament_notifs_consumers
from mainApp.models import TournamentMembers, UserMatchStatics
from .common import notifs_user_channels
from mainApp.common import tournaments
import os

def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if (tournament_data['is_started'] == False or (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)) and member['username'] == username and member['is_eliminated'] == False:
				return tournament_id
	return 0

async def check_user_is_a_friend(user, to_check):
	friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
	for friend in friends:
		friend_username = await sync_to_async(lambda: friend.friend.username)()
		if friend_username == to_check.username:
			return True
	return False

class NotificationsConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		ip_address = os.getenv("IP_ADDRESS")
		if token:
			try:
				decoded_token = await sync_to_async(RefreshToken)(token)
				payload_data = await sync_to_async(lambda: decoded_token.payload)()
				user_id = payload_data.get('user_id')
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
				if user is not None:
					await self.accept()
					username = user.username
					tmp_username = username
					user.is_online = True
					await sync_to_async(user.save)()
					if notifs_user_channels.get(user_id):
						notifs_user_channels[user_id].append(self.channel_name)
					else:
						notifs_user_channels[user_id] = [self.channel_name]
					self.group_name = f"friends_group{user_id}"
					await self.channel_layer.group_add(self.group_name, self.channel_name)
					# channel_layer = get_channel_layer()
					user_statistics = await sync_to_async(UserMatchStatics.objects.filter(player=user).first)()
					if user_statistics:
						for user_id, channel_name_list in list(notifs_user_channels.items()):
							other_user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
							if other_user is not None:
								is_a_friend = await check_user_is_a_friend(user, other_user)
								if channel_name_list:
									for channel_name in channel_name_list:
										if channel_name and not user.is_playing:
											await self.channel_layer.send(
												channel_name,
												{
													'type': 'connected_again',
													'message': {
															'is_a_friend': is_a_friend,
															'user': username,
															'userInfos': {
																'id': user.id,
																'name': user.username,
																'level': user_statistics.level,
																'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
															}
														}
												}
											)
					tournament_id = is_user_joining_tournament(username)
					if tournament_id != 0:
						for member in tournaments[tournament_id]['members']:
							memberusername = member['username']
							memberuser = await sync_to_async(customuser.objects.filter(username=memberusername).first)()
							channel_name_list = notifs_user_channels.get(memberuser.id)
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
													'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
												}
											}
										}
									)
					else:
						user.is_playing = False
						await sync_to_async(user.save)()
				else:
					self.socket.close()
			except TokenError:
				self.socket.close()

	async def receive(self, text_data=None):
		data = json.loads(text_data)

		# if data['type'] == 'acceptInvitation': await game_notifs_consumers.onevsone_accept_invite(self, data)
		if data['type'] == 'acceptInvitation': await game_notifs_consumers.accept_game_invite(self, data, notifs_user_channels)
		elif data['type'] == 'acceptInvitationMp': await game_notifs_consumers.accept_game_invite_mp(self, data, notifs_user_channels)
		elif data['type'] == 'refuseInvitation': await game_notifs_consumers.refuse_game_invite(self, data, notifs_user_channels)
		elif data['type'] == 'inviteFriendGame': await game_notifs_consumers.invite_friend(self, data, notifs_user_channels)
		elif data['type'] == 'accept-tournament-invitation': await tournament_notifs_consumers.accept_invite(self, data)
		# elif data['type'] == 'invite-friend': await tournament_notifs_consumers.invite_friend(self, data, notifs_user_channels)
		elif data['type'] == 'deny-tournament-invitation': await tournament_notifs_consumers.deny_invite(self, data, notifs_user_channels)
		elif data['type'] == 'Round-16-timer': await tournament_notifs_consumers.quarterFinal_timer(self, data)
		elif data['type'] == 'Delete-display-oponent': await tournament_notifs_consumers.delete_display_oponent(self, data)



	async def disconnect(self, close_code):
		cookiess = self.scope.get('cookies', {})
		token = cookiess.get('refresh_token')
		try:
			decoded_token = await sync_to_async(RefreshToken)(token)
			payload_data = await sync_to_async(lambda: decoded_token.payload)()
			user_id = payload_data.get('user_id')
			if user_id:
				user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
				username = user.username
				tmp_username = username
				channel_name_list = notifs_user_channels.get(user.id)
				if channel_name_list:
					channel_name_list.remove(self.channel_name)
					if not len(channel_name_list):
						notifs_user_channels.pop(username, None)
						user.is_online = False
						await sync_to_async(user.save)()
						tournament_id = is_user_joining_tournament(username)
						if tournament_id != 0:
							for member in tournaments[tournament_id]['members']:
								if member['username'] == username:
									member['is_inside'] = False
						# channel_layer = get_channel_layer()
						user = await sync_to_async(customuser.objects.filter(username=username).first)()
						#### in case of logout
						for username, channel_name_list in notifs_user_channels.items():
							for channel_name in channel_name_list:
								if channel_name:
									await self.channel_layer.send(
										channel_name,
										{
											'type': 'user_disconnected',
											'message': {
												'user': tmp_username
											}
										}
									)
		except TokenError:
			pass

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

	async def updateGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'updateGame',
			'message': event['message']
		}))

	async def playersInfos(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playersInfos',
			'message': event['message']
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
	
	async def user_kicked_out(self, event):
		await self.send(text_data=json.dumps({
			'type' : 'user_kicked_out',
			'message' : event['message']
		}))

	async def deny_tournament_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'deny_tournament_invitation',
			'message': event['message']
		}))

	async def new_user_win(self, event):
		await self.send(text_data=json.dumps({
			'type': 'new_user_win',
			'message': event['message']
		}))

	async def playerSituation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'playerSituation',
			'message': event['message']
		}))
	async def youWinTheGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'youWinTheGame',
			'message': event['message']
		}))
	async def roomInvite(self, event):
		await self.send(text_data=json.dumps({
			'type': 'roomInvitation',
			'message': event.get('message'),
		}))
	async def chatNotificationCounter(self, event):
		await self.send(text_data=json.dumps({
			'type': 'chatNotificationCounter',
			'count': event.get('message'),
		}))
	async def gameReady(self, event):
		await self.send(text_data=json.dumps({
			'type': 'gameReady',
			'message': event['message']
		}))
	async def finishedGame(self, event):
		await self.send(text_data=json.dumps({
			'type': 'finishedGame',
			'message': event['message']
		}))

	async def remove_tournament_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove_tournament_notif',
			'message': event['message']
		}))

			##################################### FRIENDS #####################################

	async def send_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': 'send-friend-request',
			'message': event['message']
		}))

	async def receive_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receive-friend-request',
			'message': event['message']
		}))

	async def cancel_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': 'cancel-friend-request',
			'message': event['message']
		}))

	async def remove_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove-friend-request',
			'message': event['message']
		}))

	async def friend_request_accepted(self, event):
		await self.send(text_data=json.dumps({
			'type': 'friend-request-accepted',
			'message': event['message']
		}))

	async def confirm_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': 'confirm-friend-request',
			'message': event['message']
		}))

	async def remove_friendship(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove-friendship',
			'message': event['message']
		}))

	async def blocker_friend(self, event):
		await self.send(text_data=json.dumps({
			'type': 'blocker-friend',
			'message': event['message']
		}))

	async def blocked_friend(self, event):
		await self.send(text_data=json.dumps({
			'type': 'blocked-friend',
			'message': event['message']
		}))

	async def unblock_friend(self, event):
		await self.send(text_data=json.dumps({
			'type': 'unblock-friend',
			'message': event['message']
		}))
