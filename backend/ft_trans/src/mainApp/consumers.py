# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# import random
# import asyncio
# import math

# rooms = {}

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         await self.send(text_data=json.dumps({
#             'type': 'connection_established',
#             'message': 'You are now connected!'
#         }))

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         if data['type'] == 'join':
#             await self.join_room()
#         elif data['type'] == 'start':
#             await self.start_room(data)
#         elif data['type'] == 'moveKey':
#             await self.move_paddle(data)
#         elif data['type'] == 'moveMouse':
#             await self.move_mouse(data)
#         elif data['type'] == 'leave':
#             await self.leave_room(data)

#     async def join_room(self):
#         room = None
#         if rooms and len(rooms) > 0:
#             last_room_key = list(rooms.keys())[-1]
#             if len(rooms[last_room_key]['players']) == 1:
#                 room = rooms[last_room_key]

#         if room:
#             await self.channel_layer.group_add(str(room['id']), 
#                     self.channel_name
#             )
#             await self.send(text_data=json.dumps({
#                 'type': 'playerNo',
#                 'message': {
#                     'playerNo': 2
#                 }
#             }))
#             room['players'].append({
#                 'channel_name': self.channel_name,
#                 'playerNo': 2,
#                 'score': 0,
#                 'paddleX': 585,
#                 'paddleY': 150,
#             })
#             await self.channel_layer.group_send(room['id'], {
#                     'type': 'startedGame',
#                     'message': room
#                 }
#             )
#         else:
#             room = {
#                 'id': f'room_{str(len(rooms) + 1)}',
#                 'players': [{
#                     'channel_name': self.channel_name,
#                     'playerNo': 1,
#                     'paddleX': 5,
#                     'paddleY': 150,
#                     'score': 0,
#                 }],
#                 'ball': {
#                     'ballX': 300,
#                     'ballY': 200,
#                 },
#                 'winner': 0
#             }
#             rooms.update({f'room_{str(len(rooms) + 1)}': room})
#             await self.channel_layer.group_add(str(room['id']), self.channel_name)
#             await self.send(text_data=json.dumps({
#                 'type': 'playerNo',
#                 'message': {
#                     'playerNo': 1
#                 }
#             }))

#     async def start_room(self, data):
#         room_id = data['message']

#         room = rooms.get(room_id)
#         if room:
#             asyncio.create_task(self.start_game(room))

#     async def move_paddle(self, data):
#         message = data['message']

#         room = rooms.get(message['roomID'])
#         if room:
#             player = room['players'][message['playerNo'] - 1]
#             if message['direction'] == 'up':
#                 player['paddleY'] -= 3
#                 if player['paddleY'] < 0:
#                     player['paddleY'] = 0
#             elif message['direction'] == 'down':
#                 player['paddleY'] += 3
#                 if player['paddleY'] + 100 > 400:
#                     player['paddleY'] = 300
#             # await asyncio.sleep(0.015)
#             # await asyncio.sleep(0.015)
#             # asyncio.create_task(self.updatingGame(room))
#             await self.channel_layer.group_send(message['roomID'], {
#                 'type': 'updateGame',
#                 'message': room
#             })

#     async def move_mouse(self, data):
#         message = data['message']

#         room = rooms.get(message['roomID'])
#         if room:
#             player = room['players'][message['playerNo'] - 1]
#             player['paddleY'] = message['mousePos'] - message['canvasTop'] - 50
#             if player['paddleY'] < 0:
#                 player['paddleY'] = 0
#             elif player['paddleY'] + 100 > 400:
#                 player['paddleY'] = 300
#             # print(player['paddleY'])
#             await self.channel_layer.group_send(message['roomID'], {
#                 'type': 'updateGame',
#                 'message': room
#             })

#     async def leave_room(self, data):
#         message = data['message']
#         room_id = message['roomID']

#         await self.channel_layer.group_discard(
#             room_id,
#             self.channel_name
#         )

#     async def startingGameSignal(self, room):
#         await self.channel_layer.group_send(room['id'], {
#                 'type': 'startingGame',
#                 'message':'startingGame'
#             }
#         )

#     async def startingGame(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'type': 'startingGame',
#             'message': message
#         }))

#     async def startedGameSignal(self, room):
#         await self.channel_layer.group_send(room['id'], {
#                 'type': 'startedGame',
#                 'message':'startedGame'
#             }
#         )

#     async def startedGame(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'type': 'startedGame',
#             'message': message
#         }))

#     def initBall(self, room, mouvement):
#         room["ball"]["ballX"] = 300
#         room["ball"]["ballY"] = 200
#         mouvement["speed"] = 5
#         mouvement["velocityX"] *= -1

#     def collision(self, ball, player, dimBallPlayer):
#         dimBallPlayer["ballTop"] = ball["ballY"] - 10
#         dimBallPlayer["ballButtom"] = ball["ballY"] + 10
#         dimBallPlayer["ballLeft"] = ball["ballX"] - 10
#         dimBallPlayer["ballRight"] = ball["ballX"] + 10

#         dimBallPlayer["playerTop"] = player["paddleY"]
#         dimBallPlayer["playerButtom"] = player["paddleY"] + 100 ## player["height"]
#         dimBallPlayer["playerLeft"] = player["paddleX"]
#         dimBallPlayer["playerRight"] = player["paddleX"] + 10 ## player["width"]

#         res = (dimBallPlayer["ballRight"] > dimBallPlayer["playerLeft"] and dimBallPlayer["ballButtom"] >  dimBallPlayer["playerTop"] and dimBallPlayer["ballLeft"] < dimBallPlayer["playerRight"] and dimBallPlayer["ballTop"] < dimBallPlayer["playerButtom"])
#         return res

#     async def start_game(self, room):
#         global rooms
#         ballProps = {
#             "velocityX": 5,
#             "velocityY": 5,
#             "speed": 5,
#             "radius": 10,
#         }
#         dimBallPlayer = {
#             "ballTop": 0,
#             "ballButtom": 0,
#             "ballLeft": 0,
#             "ballRight": 0,
#             "playerTop": 0,
#             "playerButtom": 0,
#             "playerLeft": 0,
#             "playerRight": 0,
#         }
#         while True:
#             await asyncio.sleep(0.015)
#             room["ball"]["ballX"] += ballProps["velocityX"]
#             room["ball"]["ballY"] += ballProps["velocityY"]

#             if room["ball"]["ballY"] + ballProps["radius"] > 400 or room["ball"]["ballY"] - ballProps["radius"] < 0:
#                 ballProps["velocityY"] *= -1

#             player = room["players"][0] if room["ball"]["ballX"] < 300 else room['players'][1]
#             # ball = room["ball"]
#             if self.collision(room["ball"], player, dimBallPlayer):
#                 hitPoint = room["ball"]["ballY"] - (player["paddleY"] + 50) #### player["height"] / 2 => 50
#                 hitPoint = hitPoint / 50 #### player["height"] / 2 => 50
#                 angle = hitPoint * math.pi / 4
#                 direction = 1 if (room["ball"]["ballX"] < 300) else -1
#                 ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
#                 ballProps["velocityY"] = direction * ballProps["speed"] * math.sin(angle) ######## maybe no direction
#                 ballProps["speed"] += 0.1
#             if room["ball"]["ballX"] - ballProps["radius"] < 0:
#                 room["players"][1]["score"] += 1
#                 self.initBall(room, ballProps)
#             elif room["ball"]["ballX"] + ballProps["radius"] > 600:
#                 room["players"][0]["score"] += 1
#                 self.initBall(room, ballProps)
#             if room['players'][0]['score'] == 11:
#                 room['winner'] = 1
#                 rooms = {key: value for key, value in rooms.items() if key != room['id']}
#                 print("ENDING THE GAME")
#                 await self.endingGame(room)
#                 break
#             elif room['players'][1]['score'] == 11:
#                 room['winner'] = 2
#                 rooms = {key: value for key, value in rooms.items() if key != room['id']}
#                 # print("ENDING THE GAME")
#                 await self.endingGame(room)
#                 break
#             # self.updatingGame(room)
#             asyncio.create_task(self.updatingGame(room))


#     async def endingGame(self, room):
#         await self.channel_layer.group_send(room['id'], {
#             'type': 'endGame',
#             'message': room
#         })

#     async def endGame(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'type': 'endGame',
#             'message': message
#         }))

#     async def updatingGame(self, room):
#         await self.channel_layer.group_send(room['id'], {
#             'type': 'updateGame',
#             'message': room
#         })

#     async def updateGame(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'type': 'updateGame',
#             'message': message
#         }))






























import json
from channels.generic.websocket import AsyncWebsocketConsumer
import random
import asyncio
import math

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

        # cookies = self.scope["cookies"]
        # # # Access a specific cookie value
        # my_cookie_value = cookies.get("jwt")
        # print(my_cookie_value)
        if data['type'] == 'join':
            await self.join_room()
        if data['type'] == 'start':
            await self.start_room(data)
        elif data['type'] == 'moveKey':
            await self.move_paddle(data)
        elif data['type'] == 'moveMouse':
            await self.move_mouse(data)
        elif data['type'] == 'leave':
            await self.leave_room(data)

    async def join_room(self):
        room = None
        if rooms and len(rooms) > 0:
            last_room_key = list(rooms.keys())[-1]
            if len(rooms[last_room_key]['players']) == 1:
                room = rooms[last_room_key]

        if room:
            await self.channel_layer.group_add(str(room['id']), 
                    self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'playerNo',
                'message': {
                    'playerNo': 2
                }
            }))
            room['players'].append({
                'channel_name': self.channel_name,
                'playerNo': 2,
                'paddleX': 585,
                'paddleY': 150,
                'score': 0,
            })
            # self.channel_layer.group_send(room['id'], {
            #         'type': 'startedGame',
            #         'message': room
            #     }
            # )
            # await asyncio.create_task(self.startedGameSignal(room))
            # await asyncio.sleep(3)
            asyncio.create_task(self.start_game(room))
        else:
            room = {
                'id': f'room_{str(len(rooms) + 1)}',
                'players': [{
                    'channel_name': self.channel_name,
                    'playerNo': 1,
                    'paddleX': 5,
                    'paddleY': 150,
                    'score': 0,
                }],
                'ball': {
                    'ballX': 300,
                    'ballY': 200,
                },
                'winner': 0
            }
            rooms.update({f'room_{str(len(rooms) + 1)}': room})
            await self.channel_layer.group_add(str(room['id']), self.channel_name)
            await self.send(text_data=json.dumps({
                'type': 'playerNo',
                'message': {
                    'playerNo': 1
                }
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

    async def initBall(self, room, ballProps):
        room["ball"]["ballX"] = 300
        room["ball"]["ballY"] = 200
        ballProps["speed"] = 3
        ballProps["velocityX"] *= -1

    async def runOverGame(self, room, ballProps):
        global rooms
        while True:
            room["ball"]["ballX"] += ballProps["velocityX"]
            room["ball"]["ballY"] += ballProps["velocityY"]

            if room["ball"]["ballY"] + 11 > 400 or room["ball"]["ballY"] - 11 < 0: ## was 10 now 11 just for the stucking
                ballProps["velocityY"] *= -1
            player = room["players"][0] if room["ball"]["ballX"] < 300 else room['players'][1]
            if self.collision(room["ball"], player):
                hitPoint = room["ball"]["ballY"] - (player["paddleY"] + 50) #### player["height"] / 2 => 50
                hitPoint = hitPoint / 50 #### player["height"] / 2 => 50
                angle = hitPoint * math.pi / 4
                direction = 1 if (room["ball"]["ballX"] < 300) else -1
                ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
                ballProps["velocityY"] = direction * ballProps["speed"] * math.sin(angle) ######## maybe no direction
                ballProps["speed"] += 0.1
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
                ballProps["velocityY"] = 5 if (serveX == 1) else -5
                asyncio.create_task(self.updatingGame(room, ballProps['speed']))
                if room['players'][0]['score'] == 11:
                    room['winner'] = 1
                    rooms = {key: value for key, value in rooms.items() if key != room['id']}
                    await self.endingGame(room)
                    return
                elif room['players'][1]['score'] == 11:
                    room['winner'] = 2
                    rooms = {key: value for key, value in rooms.items() if key != room['id']}
                    await self.endingGame(room)
                    return
                break
            asyncio.create_task(self.updatingGame(room, ballProps['speed']))
            await asyncio.sleep(0.020)
        await self.runOverGame(room, ballProps)

    async def start_game(self, data):
        room = data

        await asyncio.create_task(self.startedGameSignal(room))
        await asyncio.sleep(3)
        ballProps = {
            "velocityX": 5,
            "velocityY": 5,
            "speed": 5
        }
        await asyncio.create_task(self.runOverGame(room, ballProps))

    # async def start_game(self, data):
    #     global rooms
    #     room = data
    #     condition = False

    #     await asyncio.create_task(self.startedGameSignal(room))
    #     await asyncio.sleep(3)
    #     ballProps = {
    #         "velocityX": 5,
    #         "velocityY": 5,
    #         "speed": 5
    #     }
    #     while True:
    #         room["ball"]["ballX"] += ballProps["velocityX"]
    #         room["ball"]["ballY"] += ballProps["velocityY"]

    #         if room["ball"]["ballY"] + 11 > 400 or room["ball"]["ballY"] - 11 < 0: ## was 10 now 11 just for the stucking
    #             ballProps["velocityY"] *= -1
    #         player = room["players"][0] if room["ball"]["ballX"] < 300 else room['players'][1]
    #         if self.collision(room["ball"], player):
    #             hitPoint = room["ball"]["ballY"] - (player["paddleY"] + 50) #### player["height"] / 2 => 50
    #             hitPoint = hitPoint / 50 #### player["height"] / 2 => 50
    #             angle = hitPoint * math.pi / 4
    #             direction = 1 if (room["ball"]["ballX"] < 300) else -1
    #             ballProps["velocityX"] = direction * ballProps["speed"] * math.cos(angle)
    #             ballProps["velocityY"] = ballProps["speed"] * math.sin(angle) ######## maybe no direction
    #             ballProps["speed"] += 0.5
    #         if room["ball"]["ballX"] - 10 < 0 or room["ball"]["ballX"] + 10 > 600:    
    #             if room["ball"]["ballX"] - 10 < 0:
    #                 room["players"][1]["score"] += 1
    #             elif room["ball"]["ballX"] + 10 > 600:
    #                 room["players"][0]["score"] += 1
    #             # await self.initBall(room, ballProps)
    #             room["ball"]["ballX"] = 300
    #             room["ball"]["ballY"] = 200
    #             ballProps["speed"] = 5
    #             ballProps["velocityX"] *= -1
    #             asyncio.create_task(self.updatingGame(room, ballProps['speed']))
    #             if room['players'][0]['score'] == 11:
    #                 room['winner'] = 1
    #                 rooms = {key: value for key, value in rooms.items() if key != room['id']}
    #                 await self.endingGame(room)
    #                 break
    #             elif room['players'][1]['score'] == 11:
    #                 room['winner'] = 2
    #                 rooms = {key: value for key, value in rooms.items() if key != room['id']}
    #                 await self.endingGame(room)
    #                 break
    #             await asyncio.sleep(1)
    #             continue
    #         # print(ballProps["speed"])
    #         asyncio.create_task(self.updatingGame(room, ballProps['speed']))
    #         await asyncio.sleep(0.020)

########################################################################

    async def move_paddle(self, data):
        message = data['message']

        room = rooms.get(message['roomID'])
        if room:
            player = room['players'][message['playerNo'] - 1]
            if message['direction'] == 'up':
                player['paddleY'] -= 8
                if player['paddleY'] < 0:
                    player['paddleY'] = 0
            elif message['direction'] == 'down':
                player['paddleY'] += 8
                if player['paddleY'] + 100 > 400:
                    player['paddleY'] = 300

    async def move_mouse(self, data):
        message = data['message']

        room = rooms.get(message['roomID'])
        if room:
            player = room['players'][message['playerNo'] - 1]
            player['paddleY'] = message['mousePos'] - message['canvasTop'] - 50
            if player['paddleY'] < 0:
                player['paddleY'] = 0
            elif player['paddleY'] + 100 > 400:
                player['paddleY'] = 300

    async def leave_room(self, data):
        message = data['message']

        await self.channel_layer.group_discard(
            message['roomID'],
            self.channel_name
        )

    async def startingGameSignal(self, room):
        await self.channel_layer.group_send(room['id'], {
                'type': 'startingGame',
                'message':'startingGame'
            }
        )

    async def startingGame(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'startingGame',
            'message': message
        }))

    async def startedGameSignal(self, room):
        await self.channel_layer.group_send(room['id'], {
                'type': 'startedGame',
                'message':room
            }
        )

    async def startedGame(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'startedGame',
            'message': message
        }))

    async def endingGame(self, room):
        await self.channel_layer.group_send(room['id'], {
            'type': 'endGame',
            'message': room
        })

    async def endGame(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'endGame',
            'message': message
        }))

    async def updatingGame(self, room, speed):
        await self.channel_layer.group_send(room['id'], {
            'type': 'updateGame',
            'message': {
                'player1_Y': room['players'][0]['paddleY'],
                'player2_Y': room['players'][1]['paddleY'],
                'player1_Score': room['players'][0]['score'],
                'player2_Score': room['players'][1]['score'],
                'ball_X': room['ball']['ballX'],
                'ball_Y': room['ball']['ballY'],
                'speed': speed
            }
        })

    async def updateGame(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'updateGame',
            'message': message
        }))