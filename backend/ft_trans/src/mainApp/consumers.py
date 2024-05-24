import json
from channels.generic.websocket import AsyncWebsocketConsumer
from . import game_consumers

rooms = {}
tmp_rooms = {}
user_channels = {}
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'You are now connected!'
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['type'] == 'handShake': user_channels[data['message']['user']] = self.channel_name
        elif data['type'] == 'isPlayerInAnyRoom': await game_consumers.isPlayerInAnyRoom(self, data, rooms, user_channels)
        elif data['type'] == 'dataBackUp': await game_consumers.backUpData(self, data, rooms)
        elif data['type'] == 'join': await game_consumers.joinRoom(self, data, rooms, user_channels)
        elif data['type'] == 'quit': await game_consumers.quitRoom(self, data, rooms, user_channels)
        elif data['type'] == 'start': await game_consumers.startPlayer(self, data, rooms)
        elif data['type'] == 'cancel': await game_consumers.cancelPlayer(self, data, rooms)
        elif data['type'] == 'getOut': await game_consumers.clearRoom1(self, data, rooms)
        elif data['type'] == 'OpponentIsOut': await game_consumers.clearRoom2(self, data, rooms)
        elif data['type'] == 'isPlayerInRoom': await game_consumers.validatePlayer(self, data, rooms, user_channels)
        elif data['type'] == 'playerChangedPage': await game_consumers.changedPage(self, data, rooms)
        elif data['type'] == 'moveKey': await game_consumers.move_paddle(self, data, rooms)
        elif data['type'] == 'moveMouse':await game_consumers.move_mouse(self, data, rooms)
        elif data['type'] == 'userExited': await game_consumers.user_exited(self, data, rooms)
        elif data['type'] == 'inviteFriendGame': await game_consumers.invite_friend(self, data, rooms, tmp_rooms, user_channels)
        elif data['type'] == 'acceptInvitation': await game_consumers.accept_game_invite(self, data, rooms, user_channels)
        elif data['type'] == 'refuseInvitation': await game_consumers.refuse_game_invite(self, data, rooms, user_channels)
        elif data['type'] == 'createRoom': await game_consumers.create_new_room(self, data, rooms, user_channels)
        elif data['type'] == 'checkingRoomCode': await game_consumers.join_new_room(self, data, rooms, user_channels)

    ##################################### 1vs1 (GAME) #####################################

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

    async def abortedGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'abortedGame',
            'message': event['message']
        }))
    
    async def playersReady(self, event):
        await self.send(text_data=json.dumps({
            'type': 'playersReady',
            'message': event['message']
        }))

    async def removeRoom(self, event):
        await self.send(text_data=json.dumps({
            'type': 'removeRoom',
            'message': event['message']
        }))

    async def leave_room(self, data):
        await self.channel_layer.group_discard(
            str(data['message']['roomID']),
            self.channel_name
        )

    async def startingGameSignal(self, room):
        await self.channel_layer.group_send(str(room['id']), {
                'type': 'startingGame',
                'message':'startingGame'
            }
        )

    async def startingGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'startingGame',
            'message': event['message']
        }))

    async def endingGame(self, room):
        await self.channel_layer.group_send(str(room['id']), {
            'type': 'endGame',
            'message': room
        })

    async def endGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'endGame',
            'message': event['message']
        }))

    async def updateGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'updateGame',
            'message': event['message']
        }))

    async def receiveFriendGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'receiveFriendGame',
            'message': event['message']
        }))

    async def sendPlayerNo(self, event):
        await self.send(text_data=json.dumps({
            'type': 'playerNo',
            'message': event['message']
        }))

    async def playingStatus(self, event):
        await self.send(text_data=json.dumps({
            'type': 'playingStatus',
            'message': event['message']
        }))

    async def goToGamingPage(self, event):
        await self.send(text_data=json.dumps({
            'type': 'goToGamingPage',
            'message': event['message']
        }))