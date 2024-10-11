from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from myapp.models import customuser
from asgiref.sync import sync_to_async
from friends.models import Friendship
import json
from . import game_notifs_consumers
from mainApp.models import TournamentMembers

notifs_user_channels = {}

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
            # tmp_username = username
            user.is_online = True
            await sync_to_async(user.save)()
            if notifs_user_channels.get(username):
                notifs_user_channels[username].append(self.channel_name)
            else:
                notifs_user_channels[username] = [self.channel_name]
            self.group_name = f"friends_group{user_id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            # channel_layer = get_channel_layer()
            friends = await sync_to_async(list)(Friendship.objects.filter(user=user))
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
                            # #print("========++++++++=======")
                            # #print(channel_name)
                            # #print("========++++++++=======")
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
                        if channel_name and friend_is_online:
                            await self.channel_layer.send(
                                channel_name,
                                {
                                    'type': 'connected_again_tourn',
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
                # for username, channel_name in notifs_user_channels.items():
                #     user = await sync_to_async(customuser.objects.filter(username=username).first)()
                #     await self.channel_layer.send(
                #         channel_name,
                #         {
                #             'type': 'connected_again_tourn',
                #             'message': {
                #                 'user': tmp_username,
                #                 'userInfos': {
                #                     'id': user.id,
                #                     'name': user.username,
                #                     'level': 2,
                #                     'image': user.avatar.path,
                #                 }
                #             }
                #         }
                #     )
        else:
            self.socket.close()

    async def receive(self, text_data=None):
        data = json.loads(text_data)

        # if data['type'] == 'acceptInvitation': await game_notifs_consumers.onevsone_accept_invite(self, data)
        if data['type'] == 'acceptInvitation': await game_notifs_consumers.accept_game_invite(self, data, notifs_user_channels)
        elif data['type'] == 'refuseInvitation': await game_notifs_consumers.refuse_game_invite(self, data, notifs_user_channels)
        elif data['type'] == 'inviteFriendGame': await game_notifs_consumers.invite_friend(self, data, notifs_user_channels)

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
