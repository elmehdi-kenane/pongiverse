import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime
import random
import asyncio
import math
import time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.signals import request_finished
from django.dispatch import receiver

rooms = {}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'You are now connected!'
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['type'] == 'isPlayerInAnyRoom':
            await self.isPlayerInAnyRoom(data)
        if data['type'] == 'dataBackUp':
            await self.backUpData(data)
        if data['type'] == 'join': ##### /game
            await self.joinRoom(data)
        if data['type'] == 'quit': ##### /game
            await self.quitRoom(data)
        elif data['type'] == 'start': ##### /game
            await self.startPlayer(data)
        elif data['type'] == 'cancel': ##### /game
            await self.cancelPlayer(data)
        elif data['type'] == 'getOut': ##### /game
            await self.clearRoom1(data)
        elif data['type'] == 'OpponentIsOut': ##### /game
            await self.clearRoom2(data)
        elif data['type'] == 'isPlayerInRoom': ##### /play/:id
            await self.validatePlayer(data)
        elif data['type'] == 'startGame': ##### /play/:id
            await self.startGame(data)
        elif data['type'] == 'playerChangedPage': ##### /play/:id
            await self.changedPage(data)
        elif data['type'] == 'moveKey':
            await self.move_paddle(data)
        elif data['type'] == 'moveMouse':
            await self.move_mouse(data)

    async def isPlayerInAnyRoom(self, data):
        message = data['message']
        userRoom = {
            key: value
            for key, value in rooms.items()
            if (
                (len(value.get('players', [])) == 2 and
                (value['players'][0].get('user') == message['user'] or
                value['players'][1].get('user') == message['user']) and
                value.get('status') == 'started') or
                (len(value.get('players', [])) == 1 and
                value['players'][0].get('user') == message['user'] and
                value.get('status') == 'notStarted')
                # and value.get('status') == 'started'
            )
        }
        if userRoom:
            value = list(userRoom.values())[0]
            if len(value['players']) == 2 and value['status'] == 'started':
                await self.send(text_data=json.dumps({
                    'type': 'roomAlreadyStarted',
                    'message': {
                        'roomID': value['id']
                    }
                }))
            elif len(value['players']) == 1 and value['status'] == 'notStarted':
                await self.send(text_data=json.dumps({
                    'type': 'playerNo',
                    'message': {
                        'id': value['id'],
                        'playerNo': value['players'][0]['playerNo']
                    }
                }))

    ##### when the game already started and some or all players getout from the playing page ##### =====> /play/:id
    async def changedPage(self, data):
        message = data['message']
        room = rooms.get(message['roomID'])
        inactivePlayers = 0

        if room:
            if room['status'] == 'started':
                for player in room['players']:
                    if player['user'] == message['user']:
                        player['state'] = 'inactive'
                    if player['state'] == 'inactive':
                        inactivePlayers += 1
                if inactivePlayers == 2:
                    room['status'] = 'aborted'
                    for player in room['players']:
                        player['state'] = 'finished'
                else:
                    asyncio.create_task(self.cdBeforeEndingGame(message['roomID']))

    async def cdBeforeEndingGame(self, roomID):
        room = rooms.get(roomID)
        countdown = 10
        if room:
            for i in range(60):
                await asyncio.sleep(1)
                countdown -= 1
                if room['status'] == 'started' and (room['players'][0]['state'] == 'inactive' or room['players'][1]['state'] == 'inactive'):
                    if countdown == 0:
                        print('KEEP CHECKING')
                        room['status'] = 'finished'
                        await asyncio.create_task(self.gameFinished(room))
                        break
                else:
                    break

    async def gameFinished(self, room):
        await self.channel_layer.group_send(room['id'], {
                'type': 'finishedGame',
                'message': {
                    'user1' : room['players'][0]['user'],
                    'user2' : room['players'][1]['user'],
                    'playerScore1' : room['players'][0]['score'],
                    'playerScore2' : room['players'][1]['score']
                }
            }
        )

    async def finishedGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'finishedGame',
            'message': event['message']
        }))

    ##### adding the user to any room he is already join to if his socket changed ##### =====> /play/:id
    async def backUpData(self, data):
        if rooms:
            for key, roomValue in rooms.items():
                if len(roomValue['players']) == 2 and (roomValue['players'][0]['user'] == data['message']['user'] or roomValue['players'][1]['user'] == data['message']['user']) and roomValue['status'] == 'started':
                    await self.channel_layer.group_add(roomValue['id'], self.channel_name)

    ##### join to a an existing room or a new one ##### =====> /game
    async def joinRoom(self, data):
        room = None

        print("inside join")
        if rooms and len(rooms) > 0:
            last_room_key = list(rooms.keys())[-1]
            if len(rooms[last_room_key]['players']) == 1:
                room = rooms[last_room_key]
        if room:
            await self.channel_layer.group_add(str(room['id']), self.channel_name)
            await self.send(text_data=json.dumps({
                'type': 'playerNo',
                'message': {
                    'playerNo': 2,
                    'id': room['id']
                }
            }))
            room['players'].append({
                'user': data['message']['user'],
                'state': 'Ready',
                'playerNo': 2,
                'paddleX': 585,
                'paddleY': 150,
                'score': 0,
            })
            asyncio.create_task(self.set_game(room))
        else:
            room = {
                'id': f'room_{str(len(rooms) + 1)}',
                'players': [{
                    'user': data['message']['user'],
                    'state': 'Ready',
                    'playerNo': 1,
                    'paddleX': 5,
                    'paddleY': 150,
                    'score': 0,
                }],
                'ball': {
                    'ballX': 300,
                    'ballY': 200,
                },
                'winner': 0,
                'status': 'notStarted'
            }
            rooms.update({f'room_{str(len(rooms) + 1)}': room})
            await self.channel_layer.group_add(str(room['id']), self.channel_name)
            await self.send(text_data=json.dumps({
                'type': 'playerNo',
                'message': {
                    'playerNo': 1,
                    'id': room['id']
                }
            }))

    async def quitRoom(self, data):
        print("INSIDE QUIT ROOM")
        if data['message']['id'] in rooms:
            if len(rooms[data['message']['id']]['players']) == 1:
                del rooms[data['message']['id']]
        # print(rooms)

    ##### Set ready for player or starting match if all are ready ##### =====> /game
    async def startPlayer(self, data):
        playersReady = 0
        message = data['message']
        room = rooms.get(message['roomID'])

        print("inside start_player")
        if room:
            for player in rooms[room['id']]['players']:
                if player['user'] == message['user']:
                    player['status'] = 1
                if player['status'] == 1:
                    playersReady += 1
            if playersReady == 2:
                asyncio.create_task(self.allPlayersReady(room['id']))

    async def allPlayersReady(self, roomID):
        await self.channel_layer.group_send(roomID, {
                'type': 'playersReady',
                'message': 'playersReady'
            }
        )
    
    async def playersReady(self, event):
        await self.send(text_data=json.dumps({
            'type': 'playersReady',
            'message': event['message']
        }))

    ##### cancel ready for a player ##### =====> /game
    async def cancelPlayer(self, data):
        message = data['message']
        room = rooms.get(message['roomID'])

        print("inside cancel_player")
        if room:
            for player in rooms[room['id']]['players']:
                if player['user'] == message['user']:
                    player['status'] = 0

    ##### remove the player from the room if he exit bofore it started ##### =====> /game
    async def clearRoom1(self, data):
        message = data['message']
        room = rooms.get(message['roomID'])

        print("inside clear_room1")
        if room:
            asyncio.create_task(self.clearRoom(room['id']))
            self.channel_layer.group_discard(room['id'], self.channel_name)

    async def clearRoom(self, roomID):
        await self.channel_layer.group_send(roomID, {
                'type': 'removeRoom',
                'message': 'removeRoom'
            }
        )

    async def removeRoom(self, event):
        await self.send(text_data=json.dumps({
            'type': 'removeRoom',
            'message': event['message']
        }))

    ##### remove the player from the room if he exit bofore it started ##### =====> /game
    async def clearRoom2(self, data):
        message = data['message']
        room = rooms.get(message['roomID'])

        print("inside clear_room2")
        print(message)
        if room:
            self.channel_layer.group_discard(room['id'], self.channel_name)
            rooms.pop(room['id'])

    ##### check if player is in this room provided by id ##### =====> /play/:id
    async def validatePlayer(self, data):
        message = data['message']
        room = rooms.get(message['roomID'])
        playersReady = 0
        playerIsIn = False
        playerNo = 0

        print(rooms)
        if room:
            for player in room['players']:
                if player['user'] == message['user']:
                    playerIsIn = True
                    if room['status'] == 'started':
                        if player['state'] == 'inactive':
                            player['state'] = 'playing'
                        await self.send(text_data=json.dumps({
                            'type': 'setupGame',
                            'message': {
                                'playerNo': player['playerNo'],
                                'user1' : room['players'][0]['user'],
                                'user2' : room['players'][1]['user'],
                                'playerScore1' : room['players'][0]['score'],
                                'playerScore2' : room['players'][1]['score']
                            }
                        }))
                        return
                    elif room['status'] == 'aborted':
                        await self.send(text_data=json.dumps({
                            'type': 'abortedGame',
                            'message': {
                                'user1' : room['players'][0]['user'],
                                'user2' : room['players'][1]['user'],
                                'playerScore1' : room['players'][0]['score'],
                                'playerScore2' : room['players'][1]['score']
                            }
                        }))
                        return
                    elif room['status'] == 'finished':
                        await self.send(text_data=json.dumps({
                            'type': 'finishedGame',
                            'message': {
                                'user1' : room['players'][0]['user'],
                                'user2' : room['players'][1]['user'],
                                'playerScore1' : room['players'][0]['score'],
                                'playerScore2' : room['players'][1]['score']
                            }
                        }))
                        return
            if playerIsIn == False:
                print("PLAYER IS NOT INSIDE THE ROOM")
                await self.send(text_data=json.dumps({
                    'type': 'notAuthorized',
                    'message': 'notAuthorized'
                }))
                return
            for player in room['players']:
                if player['user'] == message['user']:
                    player['state'] = 'Ready'
                    playerNo = player['playerNo']
                if player['state'] == 'Ready':
                    playersReady += 1
            print(playerNo)
            await self.send(text_data=json.dumps({
                'type': 'setupGame',
                'message': {
                    'playerNo': playerNo,
                    'user1' : room['players'][0]['user'],
                    'user2' : room['players'][1]['user'],
                }
            }))
            if playersReady == 2:
                rooms[room['id']]['status'] = 'started'
                for player in room['players']:
                    player['state'] = 'playing'
                asyncio.create_task(self.startGame(data))
        else:
            print("ROOM NOT EXIST")
            await self.send(text_data=json.dumps({
                'type': 'roomNotExist',
                'message': 'roomNotExist'
            }))

########################################################################

    def collision(self, ball, player):
        ballTop = ball['ballY'] - 10
        ballButtom = ball['ballY'] + 10
        ballLeft = ball['ballX'] - 10
        ballRight = ball['ballX'] + 10
        playerTop = player['paddleY']
        playerButtom = player['paddleY'] + 100
        playerLeft = player['paddleX']
        playerRight = player['paddleX'] + 10
        return (ballRight > playerLeft and ballButtom > playerTop and
                ballLeft < playerRight and ballTop < playerButtom)

    async def runOverGame(self, room, ballProps):
        global rooms

        while True:
            room["ball"]["ballX"] += ballProps["velocityX"]
            room["ball"]["ballY"] += ballProps["velocityY"]

            if room['status'] == 'finished' or room['status'] == 'aborted':
                room["ball"]["ballX"] = 300
                room["ball"]["ballY"] = 200
                await asyncio.create_task(self.updatingGame(room))
                return
            if room["ball"]["ballY"] + 10 > 400 or room["ball"]["ballY"] - 10 < 0: ## was 10 now 11 just for the stucking
                ballProps["velocityY"] *= -1
            player = room["players"][0] if room["ball"]["ballX"] < 300 else room['players'][1]
            if self.collision(room["ball"], player):
                hitPoint = room["ball"]["ballY"] - (player["paddleY"] + 50) #### player["height"] / 2 => 50
                hitPoint = hitPoint / 50 #### player["height"] / 2 => 50
                angle = hitPoint * math.pi / 4
                direction = 1 if (room["ball"]["ballX"] < 300) else -1
                ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
                ballProps["velocityY"] = ballProps["speed"] * math.sin(angle) ######## maybe no direction
                ballProps["speed"] += 0.5
            if room["ball"]["ballX"] - 10 < 0 or room["ball"]["ballX"] + 10 > 600:
                if room["ball"]["ballX"] - 10 < 0:
                    room["players"][1]["score"] += 1
                elif room["ball"]["ballX"] + 10 > 600:
                    room["players"][0]["score"] += 1
                serveX = random.randint(1, 2)
                serveY = random.randint(1, 2)
                room["ball"]["ballX"] = 300
                room["ball"]["ballY"] = 200
                ballProps["speed"] = 5
                ballProps["velocityX"] = 5 if (serveX == 1) else -5
                ballProps["velocityY"] = 5 if (serveY == 1) else -5
                await asyncio.create_task(self.updatingGame(room))
                if room['players'][0]['score'] == 11:
                    room['winner'] = 1
                    room['status'] = 'finished'
                    # rooms = {key: value for key, value in rooms.items() if key != room['id']}
                    await self.gameFinished(room)
                    return
                elif room['players'][1]['score'] == 11:
                    room['winner'] = 2
                    room['status'] = 'finished'
                    # rooms = {key: value for key, value in rooms.items() if key != room['id']}
                    await self.gameFinished(room)
                    return
                break
            await asyncio.create_task(self.updatingGame(room))
            await asyncio.sleep(0.020)
        await self.runOverGame(room, ballProps)

    async def startGame(self, data):
        room = rooms.get(data['message']['roomID'])
        if room:
            ballProps = {
                "velocityX": 5,
                "velocityY": 5,
                "speed": 5
            }
            await asyncio.create_task(self.runOverGame(room, ballProps))

    async def set_game(self, room):
        await asyncio.create_task(self.startedGameSignal(room))
########################################################################

    async def move_paddle(self, data):
        room = rooms.get(data['message']['roomID'])
        if room:
            player = room['players'][data['message']['playerNo'] - 1]
            if data['message']['direction'] == 'up':
                player['paddleY'] -= 8
                if player['paddleY'] < 0:
                    player['paddleY'] = 0
            elif data['message']['direction'] == 'down':
                player['paddleY'] += 8
                if player['paddleY'] + 100 > 400:
                    player['paddleY'] = 300
            

    async def move_mouse(self, data):
        room = rooms.get(data['message']['roomID'])
        if room:
            player = room['players'][data['message']['playerNo'] - 1]
            player['paddleY'] = data['message']['mousePos'] - data['message']['canvasTop'] - 50
            if player['paddleY'] < 0:
                player['paddleY'] = 0
            elif player['paddleY'] + 100 > 400:
                player['paddleY'] = 300

    async def leave_room(self, data):
        await self.channel_layer.group_discard(
            data['message']['roomID'],
            self.channel_name
        )

    async def startingGameSignal(self, room):
        await self.channel_layer.group_send(room['id'], {
                'type': 'startingGame',
                'message':'startingGame'
            }
        )

    async def startingGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'startingGame',
            'message': event['message']
        }))

    async def startedGameSignal(self, room):
        await self.channel_layer.group_send(room['id'], {
                'type': 'gameReady',
                'message': room
            }
        )

    async def gameReady(self, event):
        await self.send(text_data=json.dumps({
            'type': 'gameReady',
            'message': event['message']
        }))

    async def endingGame(self, room):
        await self.channel_layer.group_send(room['id'], {
            'type': 'endGame',
            'message': room
        })

    async def endGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'endGame',
            'message': event['message']
        }))

    async def updatingGame(self, room):
        await self.channel_layer.group_send(room['id'], {
            'type': 'updateGame',
            'message': {
                'playerY1': room['players'][0]['paddleY'],
                'playerY2': room['players'][1]['paddleY'],
                'playerScore1': room['players'][0]['score'],
                'playerScore2': room['players'][1]['score'],
                'ballX': room['ball']['ballX'],
                'ballY': room['ball']['ballY'],
            }
        })

    async def updateGame(self, event):
        await self.send(text_data=json.dumps({
            'type': 'updateGame',
            'message': event['message']
        }))