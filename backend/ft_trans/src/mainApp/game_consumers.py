import math
import json
import random
import base64
import asyncio
import datetime
from myapp.models import customuser
from asgiref.sync import sync_to_async
from .models import Match, ActiveMatch, PlayerState, FriendMatch, ParticipatedFriends

async def isPlayerInAnyRoom(self, data, rooms):
    message = data['message']
    userRoom = {
        key: value
        for key, value in rooms.items()
        if (
            (len(value.get('players')) == 2 and
            (value['players'][0].get('user') == message['user'] or
            value['players'][1].get('user') == message['user']) and
            value.get('status') == 'started')
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
    else:
        player = await sync_to_async(customuser.objects.get)(username=message['user'])
        active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
        for active_match in active_matches:
            playerInRoom = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=player).first)()
            if playerInRoom:
                print("PLAYER FOUND IN A ROOM OF ONE (1) PLAYER")
                await self.send(text_data=json.dumps({
                    'type': 'playerNo',
                    'message': {
                        'id': active_match.room_id,
                        'playerNo': playerInRoom.playerNo
                    }
                }))
                return

#### adding the user to any room he is already join to if his socket changed ##### =====> /play/:id
async def backUpData(self, data, rooms):
    # print(f"I REACH THE DESTINATION : ${rooms}")
    if rooms:
        for key, roomValue in rooms.items():
            if len(roomValue['players']) == 2 and (roomValue['players'][0]['user'] == data['message']['user'] or roomValue['players'][1]['user'] == data['message']['user']) and roomValue['status'] == 'started':
                print("FOUND THE ROOM")
                await self.channel_layer.group_add(str(roomValue['id']), self.channel_name)
                return
    player = await sync_to_async(customuser.objects.get)(username=data['message']['user'])
    active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
    for active_match in active_matches:
        player_ready = await sync_to_async(PlayerState.objects.filter(active_match=active_match, player=player).first)()
        if player_ready:
            await self.channel_layer.group_add(str(active_match.room_id), self.channel_name)
            return
        

##### join to a an existing room or a new one ##### =====> /game
@sync_to_async
def generate_unique_room_id(self):
    while True:
        room_id = random.randint(1000, 10000)  # Adjust the range as needed
        if not ActiveMatch.objects.filter(room_id=room_id).exists() and not Match.objects.filter(id=room_id).exists():
            return room_id

async def joinRoom(self, data, rooms):
    room = None
    isEmpty = True
    # global rooms

    print("inside join")
    print(f"INSIDDDDE THE JOINNN ROOOM")
    active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
    for active_match in active_matches:
        player_state_count = await sync_to_async(PlayerState.objects.filter(active_match=active_match).count)()
        if player_state_count == 1:
            player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match).first)()
            player_username = await sync_to_async(lambda: player_state.player.username)()
            if player_username == data['message']['user']:
                await self.send(text_data=json.dumps({
                    'type': 'alreadySearching',
                    'message': 'alreadySearching'
                }))
                return
            isEmpty = False
            user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
            user.is_playing = True
            await sync_to_async(user.save)()
            await sync_to_async(PlayerState.objects.create)(
                active_match = active_match,
                player = user,
                state = 'Ready',
                playerNo = 2,
                paddleX = 585,
                paddleY = 150,
                score = 0
            )
            player_states = await sync_to_async(list)(PlayerState.objects.filter(active_match=active_match))
            players = []
            for player_state in player_states:
                player = await sync_to_async(customuser.objects.get)(id=player_state.player_id)
                players.append({
                    'user': player.username,
                    'state': player_state.state,
                    'playerNo': player_state.playerNo,
                    'paddleX': player_state.paddleX,
                    'paddleY': player_state.paddleY,
                    'score': player_state.score,
                    'status': ''
                })
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
                'date_started': datetime.datetime.now().isoformat()
            }
            rooms[str(room['id'])] = room
            await self.channel_layer.group_add(str(room['id']), self.channel_name)
            await self.send(text_data=json.dumps({
                'type': 'playerNo',
                'message': {
                    'playerNo': 2,
                    'id': room['id']
                }
            }))
            await sync_to_async(active_match.delete)()
            asyncio.create_task(set_game(self, room))
    if isEmpty:
        for key, value in rooms.items():
            print(f"values in the rooms are : {value}")
            if value['players'][0]['user'] == data['message']['user'] or value['players'][1]['user'] == data['message']['user']:
                await self.send(text_data=json.dumps({
                    'type': 'alreadyPlaying',
                    'message': 'alreadyPlaying'
                }))
                return
        room_id = await generate_unique_room_id(self)
        active_match = await sync_to_async(ActiveMatch.objects.create)(
            mode = '1vs1',
            room_type = 'random',
            room_id = room_id,
            status = 'notStarted',
            ballX = 300,
            ballY = 200
        )
        user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
        user.is_playing = True
        await sync_to_async(user.save)()
        await sync_to_async(PlayerState.objects.create)(
            active_match = active_match,
            player = user,
            state = 'Ready',
            playerNo = 1,
            paddleX = 5,
            paddleY = 150,
            score = 0
        )
        await self.channel_layer.group_add(str(room_id), self.channel_name)
        await self.send(text_data=json.dumps({
            'type': 'playerNo',
            'message': {
                'playerNo': 1,
                'id': room_id
            }
        }))

async def set_game(self, room):
    await asyncio.create_task(startedGameSignal(self, room))

async def startedGameSignal(self, room):
    await self.channel_layer.group_send(str(room['id']), {
            'type': 'gameReady',
            'message': room
        }
    )

async def quitRoom(self, data, rooms):
    try:
        room = await sync_to_async(ActiveMatch.objects.get)(room_id=data['message']['id'])
        if (data['message']).get('user'):
            user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
            if user:
                user.is_playing = False
                await sync_to_async(user.save)()
        print("INSIDE QUIT ROOM")
        await sync_to_async(room.delete)()
    except ActiveMatch.DoesNotExist:
        pass

async def startPlayer(self, data, rooms):
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
            asyncio.create_task(allPlayersReady(self, room['id']))

async def allPlayersReady(self, roomID):
    await self.channel_layer.group_send(roomID, {
            'type': 'playersReady',
            'message': 'playersReady'
        }
    )

##### cancel ready for a player ##### =====> /game
async def cancelPlayer(self, data, rooms):
    message = data['message']
    room = rooms.get(message['roomID'])

    print("inside cancel_player")
    if room:
        for player in rooms[room['id']]['players']:
            if player['user'] == message['user']:
                player['status'] = 0

##### remove the player from the room if he exit bofore it started ##### =====> /game
async def clearRoom1(self, data, rooms):
    message = data['message']
    room = rooms.get(message['roomID'])

    print("inside clear_room1")
    if room:
        asyncio.create_task(clearRoom(self, room['id']))
        self.channel_layer.group_discard(room['id'], self.channel_name)

async def clearRoom(self, roomID):
    await self.channel_layer.group_send(roomID, {
            'type': 'removeRoom',
            'message': 'removeRoom'
        }
    )

##### remove the player from the room if he exit bofore it started ##### =====> /game
async def clearRoom2(self, data, rooms):
    message = data['message']
    room = rooms.get(message['roomID'])

    print("inside clear_room2")
    print(message)
    if room:
        self.channel_layer.group_discard(room['id'], self.channel_name)
        rooms.pop(room['id'])

#### check if player is in this room provided by id ##### =====> /play/:id

async def validatePlayer(self, data, rooms):
    message = data['message']
    room = rooms.get(str(message['roomID']))
    # print(f"ROOM ID TO SEARCH IS : {rooms}")
    playersReady = 0
    playerIsIn = False
    playerNo = 0

    if room:
        for player in room['players']:
            if player['user'] == message['user']:
                playerIsIn = True
                await self.channel_layer.group_add(str(room['id']), self.channel_name)
                if room['status'] == 'started':
                    if player['state'] == 'inactive':
                        player['state'] = 'playing'
                    # print(room)
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
                    print("GAME IS ALREADY ABORTED")
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
        # print(playerNo)
        await self.send(text_data=json.dumps({
            'type': 'setupGame',
            'message': {
                'playerNo': playerNo,
                'user1' : room['players'][0]['user'],
                'user2' : room['players'][1]['user'],
            }
        }))
        if playersReady == 2:
            rooms[str(room['id'])]['status'] = 'started'
            for player in room['players']:
                player['state'] = 'playing'
            asyncio.create_task(startGame(self, data, rooms))
    else:
        try:
            match_played = await sync_to_async(Match.objects.get)(room_id=message['roomID'])
            player1 = await sync_to_async(lambda:match_played.team1_player1.username)()
            player2 = await sync_to_async(lambda:match_played.team2_player1.username)()
            if match_played.match_status == 'aborted':
                await self.send(text_data=json.dumps({
                    'type': 'abortedGame',
                    'message': {
                        'user1' : player1,
                        'user2' : player2,
                        'playerScore1' : match_played.team1_score,
                        'playerScore2' : match_played.team2_score
                    }
                }))
            elif match_played.match_status == 'finished':
                await self.send(text_data=json.dumps({
                    'type': 'finishedGame',
                    'message': {
                        'user1' : player1,
                        'user2' : player2,
                        'playerScore1' : match_played.team1_score,
                        'playerScore2' : match_played.team2_score
                    }
                }))
        except Match.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'roomNotExist',
                'message': 'roomNotExist'
            }))

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

async def updatingGame(self, room):
    await self.channel_layer.group_send(str(room['id']), {
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

async def gameFinished(self, room):
    await self.channel_layer.group_send(str(room['id']), {
            'type': 'finishedGame',
            'message': {
                'user1' : room['players'][0]['user'],
                'user2' : room['players'][1]['user'],
                'playerScore1' : room['players'][0]['score'],
                'playerScore2' : room['players'][1]['score']
            }
        }
    )

async def gameAborted(self, room):
    await self.channel_layer.group_send(str(room['id']), {
            'type': 'abortedGame',
            'message': {
                'user1' : room['players'][0]['user'],
                'user2' : room['players'][1]['user'],
                'playerScore1' : room['players'][0]['score'],
                'playerScore2' : room['players'][1]['score']
            }
        }
    )

async def runOverGame(self, room, ballProps, rooms):
    # global rooms

    while True:
        room["ball"]["ballX"] += ballProps["velocityX"]
        room["ball"]["ballY"] += ballProps["velocityY"]

        if room['status'] == 'finished' or room['status'] == 'aborted':
            room["ball"]["ballX"] = 300
            room["ball"]["ballY"] = 200
            room['players'][0]['paddleX'] = 5
            room['players'][0]['paddleY'] = 150
            room['players'][1]['paddleX'] = 585
            room['players'][1]['paddleY'] = 150
            await asyncio.create_task(updatingGame(self, room))
            if room['status'] == 'finished':
                await gameFinished(self, room)
            else:
                await gameAborted(self, room)
            del rooms[str(room['id'])]
            print(f"GAME OVER AND THE UPDATED ROOMS ARE : {rooms}")
            player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
            player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
            player1.is_playing = False
            await sync_to_async(player1.save)()
            player2.is_playing = False
            await sync_to_async(player2.save)()
            await sync_to_async(Match.objects.create)(
                mode = room['mode'],
                room_id = room['id'],
                team1_player1 = player1,
                team2_player1 = player2,
                team1_score = room['players'][0]['score'],
                team2_score =  room['players'][1]['score'],
                team1_status = room['players'][0]['status'],
                team2_status = room['players'][1]['status'],
                date_started = room['date_started'],
                date_ended = datetime.datetime.now().isoformat(),
                match_status = room['status']
            )
            return
        if room["ball"]["ballY"] + 10 > 400 or room["ball"]["ballY"] - 10 < 0: ## was 10 now 11 just for the stucking
            ballProps["velocityY"] *= -1
        player = room["players"][0] if room["ball"]["ballX"] < 300 else room['players'][1]
        if collision(self, room["ball"], player):
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
            await asyncio.create_task(updatingGame(self, room))
            if room['players'][0]['score'] == 11:
                room['winner'] = 1
                room['status'] = 'finished'
                room['players'][0]['status'] = 'winner'
                room['players'][1]['status'] = 'loser'
                await gameFinished(self, room)
                del rooms[str(room['id'])]
                player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
                player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
                player1.is_playing = False
                await sync_to_async(player1.save)()
                player2.is_playing = False
                await sync_to_async(player2.save)()
                await sync_to_async(Match.objects.create)(
                    mode = room['mode'],
                    room_id = room['id'],
                    team1_player1 = player1,
                    team2_player1 = player2,
                    team1_score = room['players'][0]['score'],
                    team2_score =  room['players'][1]['score'],
                    team1_status = room['players'][0]['status'],
                    team2_status = room['players'][1]['status'],
                    date_started = room['date_started'],
                    date_ended = datetime.datetime.now().isoformat(),
                    match_status = room['status']
                )
                return
            elif room['players'][1]['score'] == 11:
                room['winner'] = 2
                room['status'] = 'finished'
                room['players'][1]['status'] = 'winner'
                room['players'][0]['status'] = 'loser'
                await gameFinished(self, room)
                del rooms[str(room['id'])]
                player1 = await sync_to_async(customuser.objects.get)(username=room['players'][0]['user'])
                player2 = await sync_to_async(customuser.objects.get)(username=room['players'][1]['user'])
                player1.is_playing = False
                await sync_to_async(player1.save)()
                player2.is_playing = False
                await sync_to_async(player2.save)()
                await sync_to_async(Match.objects.create)(
                    mode = room['mode'],
                    room_id = room['id'],
                    team1_player1 = player1,
                    team2_player1 = player2,
                    team1_score = room['players'][0]['score'],
                    team2_score =  room['players'][1]['score'],
                    team1_status = room['players'][0]['status'],
                    team2_status = room['players'][1]['status'],
                    date_started = room['date_started'],
                    date_ended = datetime.datetime.now().isoformat(),
                    match_status = room['status']
                )
                return
            break
        await asyncio.create_task(updatingGame(self, room))
        await asyncio.sleep(0.020)
    await runOverGame(self, room, ballProps, rooms)

async def startGame(self, data, rooms):
    room = rooms.get(str(data['message']['roomID']))
    if room:
        ballProps = {
            "velocityX": 5,
            "velocityY": 5,
            "speed": 5
        }
        await asyncio.create_task(runOverGame(self, room, ballProps, rooms))

##### when the game already started and some or all players getout from the playing page ##### =====> /play/:id

async def changedPage(self, data, rooms):
    message = data['message']
    room = rooms.get(str(message['roomID']))
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
                asyncio.create_task(cdBeforeEndingGame(self, message['roomID'], rooms))

async def cdBeforeEndingGame(self, roomID, rooms):
    room = rooms.get(str(roomID))
    countdown = 10
    if room:
        for i in range(60):
            await asyncio.sleep(1)
            countdown -= 1
            if room['status'] == 'started' and (room['players'][0]['state'] == 'inactive' or room['players'][1]['state'] == 'inactive'):
                if countdown == 0:
                    room['status'] = 'finished'
                    if room['players'][0]['state'] == 'inactive':
                        room['players'][0]['status'] = 'loser'
                        room['players'][1]['status'] = 'winner'
                    elif room['players'][1]['state'] == 'inactive':
                        room['players'][1]['status'] = 'loser'
                        room['players'][0]['status'] = 'winner'
                    await asyncio.create_task(gameFinished(self, room))
                    break
            else:
                break


async def move_paddle(self, data, rooms):
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

async def move_mouse(self, data, rooms):
    room = rooms.get(data['message']['roomID'])
    if room:
        player = room['players'][data['message']['playerNo'] - 1]
        player['paddleY'] = data['message']['mousePos'] - data['message']['canvasTop'] - 50
        if player['paddleY'] < 0:
            player['paddleY'] = 0
        elif player['paddleY'] + 100 > 400:
            player['paddleY'] = 300

async def user_exited(self, data, rooms):
    message = data['message']
    room = rooms.get(str(message['roomID']))

    if room:
        room['status'] = 'finished'
        if room['players'][0]['user'] == message['user']:
            room['players'][0]['status'] = 'loser'
            room['players'][1]['status'] = 'winner'
        elif room['players'][1]['user'] == message['user']:
            room['players'][1]['status'] = 'loser'
            room['players'][0]['status'] = 'winner'

##### invite a friend from the friends to play with #####
async def invite_friend(self, data, rooms, tmp_rooms, user_channels):
    active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
    for active_match in active_matches:
        player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match).first)()
        player_username = await sync_to_async(lambda: player_state.player.username)()
        if player_username == data['message']['user']:
            await self.send(text_data=json.dumps({
                'type': 'alreadySearching',
                'message': 'alreadySearching'
            }))
            return
        if player_username == data['message']['target']:
            await self.send(text_data=json.dumps({
                'type': 'alreadySearching',
                'message': 'alreadySearching'
            }))
            return
    for key, value in rooms.items():
        print(f"ROOMS ARE : {rooms}")
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
    friend_match = await sync_to_async(FriendMatch.objects.filter(creator=creator).first)()
    if friend_match:
        friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
        already_invited = await sync_to_async(ParticipatedFriends.objects.filter(friend_match=friend_match, friend=friend).first)()
        if not already_invited:
            if friend and friend.is_online and not friend.is_playing:
                friend_channel = user_channels.get(data['message']['target'])
                if friend_channel:
                    user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
                    with user.avatar.open('rb') as f:
                        image_data = base64.b64encode(f.read()).decode('utf-8')
                        await self.channel_layer.send(friend_channel, {
                            'type': 'receiveFriendGame',
                            'message': {
                                'user': data['message']['user'],
                                'avatar': image_data
                            }
                        })
        return
    room_id = await generate_unique_room_id(self)
    creator = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
    friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
    friend_match = await sync_to_async(FriendMatch.objects.create)(
        creator = creator,
        room_id = room_id,
        room_type = 'friend',
        mode = '1vs1',
    )
    await sync_to_async(ParticipatedFriends.objects.create)(
        friend_match = friend_match,
        friend = friend
    )
    friend = await sync_to_async(customuser.objects.filter(username=data['message']['target']).first)()
    if friend and friend.is_online and not friend.is_playing:
        friend_channel = user_channels.get(data['message']['target'])
        print(user_channels)
        if friend_channel:
            user = await sync_to_async(customuser.objects.filter(username=data['message']['user']).first)()
            with user.avatar.open('rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
                await self.channel_layer.send(friend_channel, {
                    'type': 'receiveFriendGame',
                    'message': {
                        'user': data['message']['user'],
                        'avatar': image_data
                    }
                })

async def accept_game_invite(self, data, rooms, user_channels):
    active_matches = await sync_to_async(list)(ActiveMatch.objects.all())
    print(f"ACCEPTING A MATCH FRIEND")
    for active_match in active_matches:
        player_state = await sync_to_async(PlayerState.objects.filter(active_match=active_match).first)()
        player_username = await sync_to_async(lambda: player_state.player.username)()
        print(f"ROOM RUNNING NOW")
        if player_username == data['message']['user']:
            await self.send(text_data=json.dumps({
                'type': 'alreadyPlaying',
                'message': 'alreadyPlaying'
            }))
            return
        if player_username == data['message']['target']:
            await self.send(text_data=json.dumps({
                'type': 'alreadyPlaying',
                'message': 'alreadyPlaying'
            }))
            return
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
    friend_match = await sync_to_async(FriendMatch.objects.filter(creator=creator).first)()
    if friend_match:
        room = {
            'id': friend_match.room_id,
            'players': [{
                'user': creator.username,
                'state': 'Ready',
                'playerNo': 1,
                'paddleX': 5,
                'paddleY': 150,
                'score': 0,
                'status': ''
            }, {
                'user': friend.username,
                'state': 'Ready',
                'playerNo': 2,
                'paddleX': 585,
                'paddleY': 150,
                'score': 0,
                'status': ''
            }],
            'ball': {
                'ballX': 300,
                'ballY': 200
            },
            'winner': 0,
            'status': 'notStarted',
            'mode': '1vs1',
            'type': 'friend',
            'date_started': datetime.datetime.now().isoformat()
        }
        rooms[str(room['id'])] = room
        await self.channel_layer.group_add(str(room['id']), self.channel_name)
        await self.channel_layer.group_add(str(room['id']), user_channels[data['message']['user']])
        await sync_to_async(friend_match.delete)()
        await self.channel_layer.group_send(str(room['id']), {
            'type': 'goToGamingPage',
            'message': {
                'roomID': room['id']
            }
        })