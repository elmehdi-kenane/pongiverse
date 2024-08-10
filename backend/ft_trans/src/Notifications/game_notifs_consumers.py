import math
import json
import random
import base64
import asyncio
import datetime
# from friends.models import Friendship
from chat.models import Friends
from myapp.models import customuser
from asgiref.sync import sync_to_async
from mainApp.models import Match, ActiveMatch, PlayerState, NotifPlayer, GameNotifications, MatchStatistics
from mainApp.common import rooms, user_channels

async def accept_game_invite(self, data, notifs_user_channels):
        # active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
    # print(f"ACCEPTING A MATCH FRIEND")
    # for active_match in active_matches:
    #     player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match).first)()
    #     player_username = await sync_to_async(lambda: player_state.player.username)()
    #     print(f"ROOM RUNNING NOW")
    #     if player_username == data['message']['user']:
    #         await self.send(text_data=json.dumps({
    #             'type': 'alreadyPlaying',
    #             'message': 'alreadyPlaying'
    #         }))
    #         return
    #     if player_username == data['message']['target']:
    #         await self.send(text_data=json.dumps({
    #             'type': 'alreadyPlaying',
    #             'message': 'alreadyPlaying'
    #         }))
    #         return
    # for key, value in rooms.items():
    #     if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
    #         await self.send(text_data=json.dumps({
    #             'type': 'alreadyPlaying',
    #             'message': 'alreadyPlaying'
    #         }))
    #         return
    #     if value['players'][0]['user'] == data['message']['target'] or value['players'][1]['user'] == data['message']['target']:
    #         await self.send(text_data=json.dumps({
    #             'type': 'alreadyPlaying',
    #             'message': 'alreadyPlaying'
    #         }))
    #         return
    # print("ACCEPT 1")
    creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
    friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
    active_match = await sync_to_async(ActiveMatch.objects.filter(room_id=data['message']['roomID']).first)()
    # print(f'DATA INFORMATIONS ARE : {data['message']}')
    if active_match:
        # print("ACCEPT 2")
        is_invited = await sync_to_async(NotifPlayer.objects.filter(active_match=active_match, player=friend).first)()
        # friend_match = await sync_to_async(FriendMatch.objects.filter(creator=creator).first)()
        if is_invited:
            # print("ACCEPT 3")
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
            # target_channel_list = notifs_user_channels.get(data['message']['target'])
            # if target_channel_list:
            #     for channel_name in target_channel_list:
            #         await self.channel_layer.group_add(str(room['id']), channel_name)
            # user_channel_list = notifs_user_channels.get(data['message']['user'])
            # if user_channel_list:
            #     for channel_name in user_channel_list:
            #         await self.channel_layer.group_add(str(room['id']), channel_name)
            await self.channel_layer.group_add(str(room['id']), self.channel_name)
            channel_name = user_channels.get(data['message']['user'])
            if channel_name:
                await self.channel_layer.group_add(str(room['id']), channel_name.channel_name)
            target_channel_list = notifs_user_channels.get(data['message']['target'])
            if target_channel_list:
                for channel_name in target_channel_list:
                    # await self.channel_layer.group_add(str(room['id']), channel_name)
                    await self.channel_layer.send(channel_name, {
                        'type': 'goToGamingPage',
                        'message': {
                            'mode': '1vs1'
                        }
                    })
            user_channel_list = notifs_user_channels.get(data['message']['user'])
            if user_channel_list:
                for channel_name in user_channel_list:
                    await self.channel_layer.send(channel_name, {
                        'type': 'goToGamingPage',
                        'message': {
                            'mode': '1vs1'
                        }
                    })
                    # await self.channel_layer.group_add(str(room['id']), channel_name)
            # await self.channel_layer.group_send(str(room['id']), {
            #     'type': 'goToGamingPage',
            #     'message': {
            #         'mode': '1vs1'
            #     }
            # })
            friend.is_playing = True
            await sync_to_async(friend.save)()
            friends = await sync_to_async(list)(Friends.objects.filter(user=friend))
            for user in friends:
                friend_name = await sync_to_async(lambda: user.friend.username)()
                friend_channel_list = notifs_user_channels.get(friend_name)
                if friend_channel_list:
                    for friend_channel in friend_channel_list:
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