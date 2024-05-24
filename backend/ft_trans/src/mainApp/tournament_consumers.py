import json
from datetime import datetime
import random
import asyncio
import math
from rest_framework_simplejwt.tokens import AccessToken
import datetime
from chat.models import Friends
from myapp.models import customuser
from .models import Match, ActiveMatch, PlayerState
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer

connected_channels = {}

async def get_friends(username):
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	friends = await sync_to_async(list)(Friends.objects.filter(user=user))
	return friends

async def connected(self, data):
	username = data["message"]["user"]
	user = await sync_to_async(customuser.objects.filter(username=username).first)()
	user_id = user.id
	connected_channels[user_id] = self.channel_name
	print(f"ALL THE USERS CHANNEL_NAMES : {connected_channels}")

async def disconnected(self, connected_channels):
	print(f"ALL THE USERS CHANNEL_NAMES in DISCONNECTED : {connected_channels}")
	cookiess = self.scope.get('cookies', {})
	token = cookiess.get('token')
	decoded_token = AccessToken(token)
	payload_data = decoded_token.payload
	user_id = payload_data.get('user_id')
	if user_id:
		user = await sync_to_async(customuser.objects.filter(id=user_id).first)()
		username = user.username
		user.is_online = False
		await sync_to_async(user.save)()
		# connected_channels.pop(username, None)
		channel_layer = get_channel_layer()
		# friends = await get_friends(username)
		user = await sync_to_async(customuser.objects.filter(username=username).first)()
		friends = await sync_to_async(list)(Friends.objects.filter(user=user))
		for friend in friends:
			friend_username = await sync_to_async(lambda: friend.friend.username)()
			channel_name = connected_channels.get(friend_username)
			print(f'ON DISCONNECT : {friend_username} {channel_name}')
			if channel_name:
				await self.channel_layer.send(
					channel_name,
					{
						'type': 'user_disconnected',
						'user': username
					}
				)
