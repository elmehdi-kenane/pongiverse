
import React, { useRef, useEffect, useContext, useState } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'

class Player {
    constructor(x, y, width, height, color, score) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = score;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class PlayerInfos {
    constructor (name) {
        this.name = name
    }
}

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Net {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        for (let i = 0; i <= ctx.canvas.height; i += 15)
            ctx.fillRect(this.x, this.y + i, this.width, this.height);
    }
}

const PlayMatch = () => {
    let { privateCheckAuth, socket,
        socketRecreated, setSocketRecreated, user } = useContext(AuthContext)
    const [canvasDrawing, setCanvasDrawing] = useState(false)
    const [gameAborted, setGameAborted] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [userName1, setUserName1] = useState(null)
    const [userName2, setUserName2] = useState(null)
    // const [allSet, setAllSet] = useState(false)
    const navigate = useNavigate()
    const { roomID } = useParams()
    let canvasRef = useRef(null);
    let isOut = false
    let drawingFirstTime = false
    // const [playerNo, setPlayerNo] = useState(0)

    let isGameStarted = false
    let playerNo = 0
    let user1 = null
    let user2 = null
    let player1 = null
    let player2 = null
    let ball = null
    let net = null
    let [score1, setScore1] = useState(0)
    let [score2, setScore2] = useState(0)
    let ctx;
    let rect;
    let audio;
    const SPEED = 5;
    let keys = {
        ArrowDown: false,
        ArrowUp: false,
        MouseMove: false,
        Event: null,
    }
    useEffect(() => {
        privateCheckAuth()
    }, [])

    const draw = () => {
        ctx.clearRect(0, 0, 600, 400);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 600, 400);
        if (ctx) {
            net.draw(ctx)
            player1.draw(ctx);
            player2.draw(ctx);
            ball.draw(ctx);
        }
    }

    const update = () => {
        if (!isGameStarted)
            return;
        if (playerNo) {
            if (keys['ArrowUp']) {
                if (!((playerNo === 1 && player1.y === 0)
                    || (playerNo === 2 && player2.y === 0))) {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        playerNo === 1 ? player1.y -= 8 : player2.y -= 8;
                        socket.send(JSON.stringify({
                            type: 'moveKey',
                            message: {
                                roomID: roomID,
                                playerNo: playerNo,
                                direction: 'up'
                            }
                        }))
                    }
                }
            }
            if (keys['ArrowDown']) {
                if (!((playerNo === 1 && player1.y + 100 === 400)
                    || (playerNo === 2 && player2.y + 100 === 400))) {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        playerNo === 1 ? player1.y += 8 : player2.y += 8;
                        socket.send(JSON.stringify({
                            type: 'moveKey',
                            message: {
                                roomID: roomID,
                                playerNo: playerNo,
                                direction: 'down'
                            }
                        }))
                    }
                }
            }
        }
        setScore1(player1.score)
        setScore2(player2.score)
    }

    const handleKeyDown = (e) => {
        keys[e.code] = true;
    }

    const handleKeyUp = (e) => {
        keys[e.code] = false;
    }

    const handleMouseMove = (e) => {
        if (!isGameStarted)
            return;
        if (playerNo === 1) {
            if (player1) {
                player1.y = e.clientY - rect.top - 50;
                if (player1.y < 0)
                    player1.y = 0;
                else if (player1.y + 100 > 400)
                    player1.y = 300
            }
        }
        if (playerNo === 2) {
            if (player2) {
                player2.y = e.clientY - rect.top - 50;
                if (player2.y < 0)
                    player2.y = 0
                else if (player2.y + 100 > 400)
                    player2.y = 300
            }
        }
        socket.send(JSON.stringify({
            type: 'moveMouse',
            message: {
                roomID: roomID,
                playerNo: playerNo,
                mousePos: e.clientY,
                canvasTop: rect.top
            }
        }))
    }

    useEffect(() => {
        if (socketRecreated && user) {
            console.log("INSIDE RESTABISHMENT")
            socket.send(JSON.stringify({
                type: 'dataBackUp',
                message: {
                    user: user,
                    roomID: roomID,
                    page: 'game',
                }
            }))
            setSocketRecreated(false)
        }
    }, [socketRecreated, user])

    useEffect(() => {
        ctx = canvasRef.current.getContext('2d')
        ctx.canvas.width = 600
        ctx.canvas.height = 400
        rect = canvasRef.current.getBoundingClientRect()
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        canvasRef.current.addEventListener("mousemove", handleMouseMove)
        if (!canvasDrawing && socket) {
            player1 = new Player(5, 150, 10, 100, 'white', 0)
            player2 = new Player(585, 150, 10, 100, 'white', 0)
            ball = new Ball(300, 200, 10, 'red')
            net = new Net(300, 0, 2, 10, 'white')
            // draw()
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, 600, 400);
            console.log("ctx is : ", ctx)
            net.draw(ctx)
            player1.draw(ctx)
            player2.draw(ctx)
            ball.draw(ctx)
            setCanvasDrawing(true)
        }
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                // console.log("THE TYPE IS : ",type)
                if (type === "setupGame") {
                    console.log("INSIDE SETUPGAME")
                    playerNo = message.playerNo
                    isGameStarted = true
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    console.log(socket)
                } else if (type === "updateGame") {
                    // console.log("INSIDE UPDATEGAME")
                    if (player1 && player2 && ball) {
                        player1.y = message.playerY1;
                        player2.y = message.playerY2;
                        player1.score = message.playerScore1;
                        player2.score = message.playerScore2;
                        ball.x = message.ballX;
                        ball.y = message.ballY;
                        update()
                        draw()
                        ctx.clearRect(0, 0, 600, 400);
                        ctx.fillStyle = 'black';
                        ctx.fillRect(0, 0, 600, 400);
                        net.draw(ctx)
                        player1.draw(ctx)
                        player2.draw(ctx)
                        ball.draw(ctx)
                    }
                } else if (type === "notAuthorized") {
                    console.log("INSIDE LEAVEGAME")
                    console.log("navigating from the playing page")
                    navigate("../game/solo/1vs1")
                } else if (type === "roomNotExist") {
                    navigate("../game/solo/1vs1")
                } else if (type === "finishedGame") {
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setGameFinished(true)
                } else if (type === "abortedGame") {
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setGameAborted(true)
                } else if (type === "serverEnded") {
                    console.log(message)
                }
            }
        }
    }, [socket, user])

    useEffect(() => {
        return () => {
            if (isOut) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    // window.alert(user, roomID)
                    socket.send(JSON.stringify({
                        type: 'playerChangedPage',
                        message: {
                            user: user,
                            roomID: roomID
                        }
                    }))
                }
            } else
                isOut = true
        }
    }, [])

    useEffect(() => {
        if (canvasDrawing && !socketRecreated && user) {
            if (socket && socket.readyState === WebSocket.OPEN && user) {
                console.log("CHECKING IF PLAYER IN ROOM")
                socket.send(JSON.stringify({
                    type: 'isPlayerInRoom',
                    message: {
                        user: user,
                        roomID: roomID
                    }
                }))
            }
        }
    }, [canvasDrawing, socket, socketRecreated, user])

    const exitTheGame = () => {
        if (user) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'userExited',
                    message: {
                        user: user,
                        roomID: roomID
                    }
                }))
                navigate('../game/solo/1vs1')
            } else {
                console.log("socket is closed, refresh the page")
            }
        }
    }

    return (
        <div style={{position:"relative", display:'flex', flexDirection:'column', alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
            {gameFinished ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME FINISHED</p></div>) : gameAborted ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME ABORTED</p></div>) : ''}
            <div style={{backgroundColor:"rgba(255,255,255,0.3)", color:"white", fontSize:"30px", display:"flex", textAlign:"center", justifyContent:"space-between", marginBottom:"100px", width:"40%", height:"100px"}}>
                <div style={{textAlign:"center"}}><p>{userName1}</p></div>
                <div style={{fontWeight:"bolder", textAlign:"center"}}><p>{score1}|{score2}</p></div>
                <div style={{textAlign:"center"}}><p>{userName2}</p></div>
            </div>
            <canvas ref={canvasRef} style={{marginTop: '-30px'}}></canvas>
            {(!gameFinished && !gameAborted) && (<button onClick={exitTheGame} style={{position:'absolute', top:"250px", right:"50%", color:"black", padding:"10px"}}>exit</button>)}
        </div>
    );
};

export default PlayMatch;