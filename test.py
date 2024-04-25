import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import time
import threading
import asyncio

rooms = []

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # we give an id to the room -'test'- or the touranment (send from the front) */
            # self.room_group_name = 'test'
        # create and add the connected sender to the the group with specifying the room group name
            # async_to_sync(self.channel_layer.group_add)(
            #     self.room_group_name,
            #     self.channel_name
            # )
        self.accept()
        self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message':'You are now connected!'
        }))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        type = text_data_json['type']
        if (type == 'move'):
            print('ENTERED : HELLLLLLLLO')
            room = 0
            index = 0
            for rm in rooms:
                if rm['id'] == message['roomID']:
                    room = rm
                    break
                index += 1
            if room:
                player = 0
                for plyr in room['players']:
                    if plyr['playerNo'] == message['playerNo']:
                        player = plyr
                        break
                if player:
                    if message['direction'] == 'up':
                        player['paddleY'] -= 10
                    elif message['direction'] == 'down':
                        player['paddleY'] += 10
                rooms[index] = room
                async_to_sync(self.channel_layer.group_send)(
                    str(room['id']), {
                        'type': 'updateGame',
                        'message': room
                    }
                )

        if (message == 'join'):
            room = 0

            if (len(rooms) > 0 and len(rooms[len(rooms) - 1]['players']) == 1):
                room = rooms[len(rooms) - 1]
            if (room):
                rooms[len(rooms) - 1]['players'].append({
                    'channel_name': self.channel_name,
                    'playerNo': 2,
                    'score': 0,
                    'paddleX': 690,
                    'paddleY': 200,
                })
                async_to_sync(self.channel_layer.group_add)(
                    str(room['id']),
                    self.channel_name
                )
                async_to_sync(self.channel_layer.group_send)(
                    str(room['id']), {
                        'type':'startingGame',
                        'message':'startingGame'
                    }
                )
                # self.sendPlayerNo(room)
                # self.initialSetupGame(room)
                threading.Thread(target=self.sendPlayerNo, args=({'playerNo': 2},)).start()
                threading.Thread(target=self.initialSetupGame, args=(room,)).start()
                self.startGame(room)
                # threading.Thread(target=self.startGame, args=(room,)).start()
                
            else:
                room = {
                    'id': len(rooms) + 1,
                    'players': [{
                        'channel_name': self.channel_name,
                        'playerNo': 1,
                        'score': 0,
                        'paddleX': 90,
                        'paddleY': 200,
                    }],
                    'ball': {
                        'ballX': 0,
                        'ballY': 0
                    }
                }
                rooms.append(room)
                async_to_sync(self.channel_layer.group_add)(
                    str(room['id']),
                    self.channel_name
                )
                threading.Thread(target=self.sendPlayerNo, args=({'playerNo': 1},)).start()

    def startingGame(self, event):
        message = event['message']

        self.send(text_data=json.dumps({
            'type': 'startingGame',
            'message':message
        }))

    def sendPlayerNo(self, room):
        message = room['playerNo']

        self.send(text_data=json.dumps({
            'type':'playerNo',
            'message':message
        }))

    def initialSetupGame(self, room):
        time.sleep(3)
        async_to_sync(self.channel_layer.group_send)(
            str(room['id']), {
                'type': 'initSetupGame',
                'message': room
            }
        )

    def initSetupGame(self, event):
        message = event['message']

        # print(f'entered ${message}')
        self.send(text_data=json.dumps({
            'type': 'startedGame',
            'message': message
        }))

    async def startGame(self, room):
        while True:
            # time.sleep(0.016)
            await asyncio.sleep(0.016)
            room['ball']['ballX'] += 1
            room['ball']['ballY'] += 1

            await self.updatingGame(room)
            # threading.Thread(target=self.updatingGame, args=(room,)).start()

    def updatingGame(self, room):
        # print(f'room ${room}')
        async_to_sync(self.channel_layer.group_send)(
            str(room['id']), {
                'type': 'updateGame',
                'message': room
            }
        )

    def updateGame(self, event):
        message = event['message']

        self.send(text_data=json.dumps({
            'type': 'updateGame',
            'message':message
        }))

















































# FFFFFFFRRRRROOOOONNNNNNNTTTTTTT EEEEEENNNNNNDDDDD



let startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', startGame);



let message = document.getElementById('message');


let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');


let player1;
let player2;
let ball;

let isGameStarted = false;
let playerNo = 0;
let roomID;


const socket = io("http://localhost:3000", {
    transports: ['websocket']
});

function startGame() {
    startBtn.style.display = 'none';

    if (socket.connected) {
        socket.emit('join');
        message.innerText = "Waiting for other player..."
    }
    else {
        message.innerText = "Refresh the page and try again..."
    }
}

socket.on("playerNo", (newPlayerNo) => {
    console.log(newPlayerNo);
    playerNo = newPlayerNo;
});

socket.on("startingGame", () => {
    isGameStarted = true;
    message.innerText = "We are going to start the game...";
});

socket.on("startedGame", (room) => {
    console.log(room);

    roomID = room.id;
    message.innerText = "";

    player1 = new Player(room.players[0].x, room.players[0].y, 20, 60, 'red');
    player2 = new Player(room.players[1].x, room.players[1].y, 20, 60, 'blue');

    player1.score = room.players[0].score;
    player2.score = room.players[1].score;


    ball = new Ball(room.ball.x, room.ball.y, 10, 'white');

    window.addEventListener('keydown', (e) => {
        if (isGameStarted) {
            if (e.keyCode === 38) {
                console.log("player move 1 up")
                socket.emit("move", {
                    roomID: roomID,
                    playerNo: playerNo,
                    direction: 'up'
                })
            } else if (e.keyCode === 40) {
                console.log("player move 1 down")
                socket.emit("move", {
                    roomID: roomID,
                    playerNo: playerNo,
                    direction: 'down'
                })
            }
        }
    });

    draw();
});

socket.on("updateGame", (room) => {
    player1.y = room.players[0].y;
    player2.y = room.players[1].y;

    player1.score = room.players[0].score;
    player2.score = room.players[1].score;

    ball.x = room.ball.x;
    ball.y = room.ball.y;

    draw();
});

socket.on("endGame", (room) => {
    isGameStarted = false;
    message.innerText = `${room.winner === playerNo ? "You are Winner!" : "You are Loser!"}`;

    socket.emit("leave", roomID);


    setTimeout(() => {
        ctx.clearRect(0, 0, 800, 500);
        startBtn.style.display = 'block';
    }, 2000);
});



function draw() {
    ctx.clearRect(0, 0, 800, 500);


    player1.draw(ctx);
    player2.draw(ctx);
    ball.draw(ctx);

    // center line
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.setLineDash([10, 10])
    ctx.moveTo(400, 5);
    ctx.lineTo(400, 495);
    ctx.stroke();
}














# BBBBBBAAAAACCCCCKKKKK EEEEEENNNNNNDDDDD



const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require('cors');
const { futimesSync } = require('fs');

app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send('<h1>PING PONG SERVER -- </h1>');
});

let rooms = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on("join", () => {
        console.log(rooms);

        // get room 
        let room;
        if (rooms.length > 0 && rooms[rooms.length - 1].players.length === 1) {
            room = rooms[rooms.length - 1];
        }

        if (room) {
            socket.join(room.id);
            socket.emit('playerNo', 2);

            // add player to room
            room.players.push({
                socketID: socket.id,
                playerNo: 2,
                score: 0,
                x: 690,
                y: 200,
            });

            // send message to room
            io.to(room.id).emit('startingGame');

            setTimeout(() => {
                io.to(room.id).emit('startedGame', room);

                // start game
                startGame(room);
            }, 3000);
        }
        else {
            room = {
                id: rooms.length + 1,
                players: [{
                    socketID: socket.id,
                    playerNo: 1,
                    score: 0,
                    x: 90,
                    y: 200,
                }],
                ball: {
                    x: 395,
                    y: 245,
                    dx: Math.random() < 0.5 ? 1 : -1,
                    dy: 0,
                },
                winner: 0,
            }
            rooms.push(room);
            socket.join(room.id);
            socket.emit('playerNo', 1);
        }
    });

    socket.on("move", (data) => {
        let room = rooms.find(room => room.id === data.roomID);

        if (room) {
            if (data.direction === 'up') {
                room.players[data.playerNo - 1].y -= 10;

                if (room.players[data.playerNo - 1].y < 0) {
                    room.players[data.playerNo - 1].y = 0;
                }
            }
            else if (data.direction === 'down') {
                room.players[data.playerNo - 1].y += 10;

                if (room.players[data.playerNo - 1].y > 440) {
                    room.players[data.playerNo - 1].y = 440;
                }
            }
        }

        // update rooms
        rooms = rooms.map(r => {
            if (r.id === room.id) {
                return room;
            }
            else {
                return r;
            }
        });

        io.to(room.id).emit('updateGame', room);
    });

    socket.on("leave", (roomID) => {
        socket.leave(roomID);
    });



    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

function startGame(room) {
    let interval = setInterval(() => {
        room.ball.x += room.ball.dx * 5;
        room.ball.y += room.ball.dy * 5;

        // check if ball hits player 1
        if (room.ball.x < 110 && room.ball.y > room.players[0].y && room.ball.y < room.players[0].y + 60) {
            room.ball.dx = 1;

            // change ball direction
            if (room.ball.y < room.players[0].y + 30) {
                room.ball.dy = -1;
            }
            else if (room.ball.y > room.players[0].y + 30) {
                room.ball.dy = 1;
            }
            else {
                room.ball.dy = 0;
            }
        }

        // check if ball hits player 2
        if (room.ball.x > 690 && room.ball.y > room.players[1].y && room.ball.y < room.players[1].y + 60) {
            room.ball.dx = -1;

            // change ball direction
            if (room.ball.y < room.players[1].y + 30) {
                room.ball.dy = -1;
            }
            else if (room.ball.y > room.players[1].y + 30) {
                room.ball.dy = 1;
            }
            else {
                room.ball.dy = 0;
            }
        }

        // up and down walls
        if (room.ball.y < 5 || room.ball.y > 490) {
            room.ball.dy *= -1;
        }


        // left and right walls
        if (room.ball.x < 5) {
            room.players[1].score += 1;
            room.ball.x = 395;
            room.ball.y = 245;
            room.ball.dx = 1;
            room.ball.dy = 0;
        }

        if (room.ball.x > 795) {
            room.players[0].score += 1;
            room.ball.x = 395;
            room.ball.y = 245;
            room.ball.dx = -1;
            room.ball.dy = 0;
        }


        if (room.players[0].score === 10) {
            room.winner = 1;
            rooms = rooms.filter(r => r.id !== room.id);
            io.to(room.id).emit('endGame', room);
            clearInterval(interval);
        }

        if (room.players[1].score === 10) {
            room.winner = 2;
            rooms = rooms.filter(r => r.id !== room.id);
            io.to(room.id).emit('endGame', room);
            clearInterval(interval);
        }

        io.to(room.id).emit('updateGame', room);
    }, 1000 / 60);
}



server.listen(3000, () => {
    console.log('listening on *:3000');
});




























































import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

const PlayMatch = ({ socket, playerNo, isGameStarted, setIsGameStarted, setLoading, player1, player2, ball, roomID, setRoomID, setPlayer1, setPlayer2, setBall, setPlayerNo }) => {
    let canvasRef = useRef(null);
    const navigate = useNavigate()
    const ctxRef = useRef(null);
    // const devicePixelRatio = window.devicePixelRatio || 1
    let ctx;
    
    const draw = () => {
        ctx.clearRect(0, 0, 800, 500);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 800, 500);
        
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(400, 5);
        ctx.lineTo(400, 495);
        ctx.stroke();
        player1.draw(ctx);
        player2.draw(ctx);
        ball.draw(ctx);
    };

    window.addEventListener('keydown', (e) => {
        if (isGameStarted) {
            switch (e.code) {
                case "ArrowUp":
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'move',
                            message: {
                                roomID: roomID,
                                playerNo: playerNo,
                                direction: 'up'
                            }
                        }))
                    }
                    break
                case "ArrowDown":
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'move',
                            message: {
                                roomID: roomID,
                                playerNo: playerNo,
                                direction: 'down'
                            }
                        }))
                    }
                    break
            }
        }
    })

    useEffect(() => {
        ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = 800;
        canvasRef.current.height = 500;

        if (socket && socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify({
                type: 'start',
                message: roomID
        }))
        draw()
    }, [])

    useEffect(() => {
        socket.onmessage = (event) => {
            let data = JSON.parse(event.data)
            let type = data.type
            let message = data.message

            if (type === "updateGame") {
                player1.y = message['players'][0]['paddleY'];
                player2.y = message['players'][1]['paddleY'];
                player1.score = message.players[0].score;
                player2.score = message.players[1].score;
                ball.x = message['ball']['ballX'];
                ball.y = message['ball']['ballY'];
                draw()
            }
            if (type === "endGame") {
                setIsGameStarted(false);
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'leave',
                        message: {
                            roomID: roomID
                        }
                    }))
                }
                setTimeout(() => {
                    ctx.clearRect(0, 0, 800, 500)
                    setLoading(false)
                    setPlayerNo(0)
                    setIsGameStarted(false)
                    setPlayer1(null)
                    setPlayer2(null)
                    setBall(null)
                    setRoomID(null)
                    navigate('/game')
                }, 1000);
            }
        }
    }, []);

    return (
        <div style={{display:'flex',flexDirection:'column' , alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
            <canvas ref={canvasRef} style={{marginTop: '-30px'}}></canvas>
        </div>
    );
};

export default PlayMatch;
























