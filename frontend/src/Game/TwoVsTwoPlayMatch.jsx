import React, { useRef, useEffect, useContext, useState, useCallback } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'

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

const TwoVsTwoPlayMatch = () => {
    let { privateCheckAuth, socket,
        socketRecreated, user } = useContext(AuthContext)
    const [canvasDrawing, setCanvasDrawing] = useState(false)
    const [gameAborted, setGameAborted] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [userName1, setUserName1] = useState(null)
    const [userName2, setUserName2] = useState(null)
    const [userName3, setUserName3] = useState(null)
    const [userName4, setUserName4] = useState(null)
    const [playersPics, setPlayersPics] = useState([])
    const [userOut, setUserOut] = useState([])
    // const [allSet, setAllSet] = useState(false)
    const navigate = useNavigate()
    const { roomID } = useParams()
    let canvasRef = useRef(null);
    let isOut = false

    let isGameStarted = false
    let playerNo = 0
    let player1 = null
    let player2 = null
    let player3 = null
    let player4 = null
    let ball = null
    let net = null
    let [score1, setScore1] = useState(0)
    let [score2, setScore2] = useState(0)
    let [score3, setScore3] = useState(0)
    let [score4, setScore4] = useState(0)
    // let ctx;
    // let rect;
    let audio;
    let keys = {
        ArrowDown: false,
        ArrowUp: false,
        MouseMove: false,
        Event: null,
    }

    const [canvasContext, setCanvasContext] = useState(null);
    const canvasContextRef = useRef(canvasContext);
    const userOutRef = useRef(userOut);
	const [canvasDimensions, setCanvasDimensions] = useState(null);
    const canvasDimensionsRef = useRef(canvasDimensions);
	// const canvasRef = useRef(null);

    const draw = () => {
        const ctx = canvasContextRef.current;
        if (!isGameStarted) {
            player1.x = 5
            player1.y = 50
            player1.width = 10
            player1.height = 100
            player2.x = 5
            player2.y = 250
            player2.width = 10
            player2.height = 100
            player3.x = 585
            player3.y = 50
            player3.width = 10
            player3.height = 100
            player4.x = 585
            player4.y = 250
            player4.width = 10
            player4.height = 100
        }
        if (ctx) {
            ctx.clearRect(0, 0, 600, 400);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 600, 400);
            net.draw(ctx)
            player1.draw(ctx);
            player2.draw(ctx);
            player3.draw(ctx)
            player4.draw(ctx)
            ball.draw(ctx);
        }
    }

    useEffect(() => {
		canvasContextRef.current = canvasContext;
		canvasDimensionsRef.current = canvasDimensions;
		userOutRef.current = userOut;
	}, [canvasContext, canvasDimensions, userOut]);

	useEffect(() => {
        if (canvasRef && !canvasDrawing) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d')
            canvas.width = 600;
            canvas.height = 400;
            const rectDim = canvas.getBoundingClientRect()
            setCanvasContext(context);
            setCanvasDimensions(rectDim)
            window.addEventListener("keydown", handleKeyDown)
            window.addEventListener("keyup", handleKeyUp)
            canvas.addEventListener("mousemove", handleMouseMove)
            if (!canvasDrawing && socket) {
                console.log("DRAWING THE SHAPES")
                player1 = new Player(5, 50, 10, 100, 'white', 0)
                player2 = new Player(5, 250, 10, 100, 'white', 0)
                player3 = new Player(585, 50, 10, 100, 'white', 0)
                player4 = new Player(585, 250, 10, 100, 'white', 0)
                ball = new Ball(300, 200, 10, 'red')
                net = new Net(300, 0, 2, 10, 'white')
                draw()
                setCanvasDrawing(true)
            }
        }
	}, [canvasRef, canvasDrawing, socket]);




    useEffect(() => {
        privateCheckAuth()
    }, [])

    const update = () => {
        if (!isGameStarted)
            return;
        if (playerNo) {
            const userGotOut = userOutRef.current
            if (keys['ArrowUp']) {
                const playerTop2 = (userGotOut.includes(1) ? 0 : 200)
                const playerTop4 = (userGotOut.includes(3) ? 0 : 200)
                if (!((playerNo === 1 && player1.y === 0)
                    || (playerNo === 2 && player2.y === playerTop2)
                    || (playerNo === 3 && player3.y === 0)
                    || (playerNo === 4 && player4.y === playerTop4))) {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        (playerNo === 1) ? player1.y -= 8 : (playerNo === 2) ? player2.y -= 8 : (playerNo === 3) ? player3.y -= 8 : player4.y -= 8
                        socket.send(JSON.stringify({
                            type: 'moveKeyMp',
                            message: {
                                roomID: roomID,
                                playerNo: playerNo,
                                direction: 'up'
                            }
                        }))
                    }
                }
            }
            else if (keys['ArrowDown']) {
                const playerBottom1 = (userGotOut.includes(2) ? 400 : 200)
                const playerBottom3 = (userGotOut.includes(4) ? 400 : 200)
                if (!((playerNo === 1 && (player1.y + 100) === playerBottom1)
                    || (playerNo === 2 && (player2.y + 100) === 400)
                    || (playerNo === 3 && (player3.y + 100) === playerBottom3)
                    || (playerNo === 4 && (player4.y + 100) === 200))) {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        (playerNo === 1) ? player1.y += 8 : (playerNo === 2) ? player2.y += 8 : (playerNo === 3) ? player3.y += 8 : player4.y += 8
                        socket.send(JSON.stringify({
                            type: 'moveKeyMp',
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
        setScore3(player3.score)
        setScore4(player4.score)
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
        const rect = canvasDimensionsRef.current
        const userGotOut = userOutRef.current
        if (playerNo === 1) {
            if (player1) {
                const playerBottom = (userGotOut.includes(2) ? 400 : 200)
                player1.y = e.clientY - rect.top - 50;
                if (player1.y < 0)
                    player1.y = 0;
                else if (player1.y + 100 > playerBottom)
                    player1.y = 100
            }
        }
        else if (playerNo === 2) {
            if (player2) {
                const playerTop = (userGotOut.includes(1) ? 0 : 200)
                player2.y = e.clientY - rect.top - 50;
                if (player2.y < playerTop)
                    player2.y = 200
                else if (player2.y + 100 > 400)
                    player2.y = 300
            }
        }
        else if (playerNo === 3) {
            if (player3) {
                const playerBottom = (userGotOut.includes(4) ? 400 : 200)
                player3.y = e.clientY - rect.top - 50;
                if (player3.y < 0)
                    player3.y = 0;
                else if (player3.y + 100 > playerBottom)
                    player3.y = 100
            }
        }
        else if (playerNo === 4) {
            if (player4) {
                const playerTop = (userGotOut.includes(3) ? 0 : 200)
                player4.y = e.clientY - rect.top - 50;
                if (player4.y < playerTop)
                    player4.y = 200
                else if (player4.y + 100 > 400)
                    player4.y = 300
            }
        }
        socket.send(JSON.stringify({
            type: 'moveMouseMp',
            message: {
                roomID: roomID,
                playerNo: playerNo,
                mousePos: e.clientY,
                canvasTop: rect.top
            }
        }))
    }

    const playerGotOut = (message) => {
        const ctx = canvasContextRef.current;
        if (message.userNo === 1) {
            ctx.clearRect(player1.x, player1.y, 10, 100);
            player1.x = 0
            player1.y = 0
            player1.width = 0
            player1.height = 0
        } else if (message.userNo === 2) {
            ctx.clearRect(player2.x, player2.y, 10, 100);
            player2.x = 0
            player2.y = 0
            player2.width = 0
            player2.height = 0
        } else if (message.userNo === 3) {
            ctx.clearRect(player3.x, player3.y, 10, 100);
            player3.x = 0
            player3.y = 0
            player3.width = 0
            player3.height = 0
        } else if (message.userNo === 4) {
            ctx.clearRect(player4.x, player4.y, 10, 100);
            player4.x = 0
            player4.y = 0
            player4.width = 0
            player4.height = 0
        }
    }
    
    const gamefinishedAborted = (message) => {
        setUserName1(message.user1)
        setUserName2(message.user2)
        setUserName3(message.user3)
        setUserName4(message.user4)
        setScore1(message.playerScore1)
        setScore2(message.playerScore2)
        setScore3(message.playerScore3)
        setScore4(message.playerScore4)
        setUserOut([])
        isGameStarted = false
        draw()
    }

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === "setupGame") {
                    console.log("INSIDE SETUPGAME")
                    playerNo = message.playerNo
                    isGameStarted = true
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    console.log("USER OUT IS : ", message.userOut)
                    if (message.hasOwnProperty('userOut') && message.userOut.length) {
                        setUserOut(message.userOut)
                        playerGotOut(message)
                        for (let i = 0; i < message.userOut.length; i++)
                            playerGotOut({userNo: message.userOut[i]})
                    }
                } else if (type === "updateGame") {
                    if (player1 && player2 && ball) {
                        player1.y = message.playerY1;
                        player2.y = message.playerY2;
                        player3.y = message.playerY3;
                        player4.y = message.playerY4;
                        player1.score = message.playerScore1;
                        player2.score = message.playerScore2;
                        player3.score = message.playerScore3;
                        player4.score = message.playerScore4;
                        ball.x = message.ballX;
                        ball.y = message.ballY;
                        update()
                        draw()
                    }
                } else if (type === "notAuthorized") {
                    console.log("INSIDE LEAVEGAME")
                    console.log("navigating from the playing page")
                    navigate("../game/solo/2vs2")
                } else if (type === "roomNotExist") {
                    navigate("../game/solo/2vs2")
                } else if (type === "finishedGame") {
                    setGameFinished(true)
                    gamefinishedAborted(message)
                } else if (type === "abortedGame") {
                    setGameAborted(true)
                    gamefinishedAborted(message)
                } else if (type === "playersInfos")
                    setPlayersPics(message.users)
                else if (type === "playerOut") {
                    if (isGameStarted) {
                        const userGotOut = userOutRef.current
                        setUserOut([...userGotOut, message.userNo])
                        playerGotOut(message)
                    }
                }
            }
        }
    }, [socket, user])

    useEffect(() => {
        return () => {
            if (isOut) {
                console.log("USER IS GETTING OUT ", user, roomID)
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'playerChangedPageMp',
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
                    type: 'isPlayerInRoomMp',
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
                    type: 'userExitedMp',
                    message: {
                        user: user,
                        roomID: roomID
                    }
                }))
                navigate('../game/solo/2vs2')
            } else {
                console.log("socket is closed, refresh the page")
            }
        }
    }

    return (
        <div style={{position:"relative", display:'flex', flexDirection:'column', alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
            {gameFinished ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME FINISHED</p></div>) : gameAborted ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME ABORTED</p></div>) : ''}
            <div style={{backgroundColor:"rgba(255,255,255,0.3)", color:"white", fontSize:"30px", display:"flex", textAlign:"center", justifyContent:"space-between", marginBottom:"100px", width:"40%", height:"100px", alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', height: '50%', opacity: (userOut.length && userOut.includes(1)) ? '0.5' : '1'}}>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[0].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                        <div style={{textAlign:"center"}}><p>{userName1}</p></div>
                    </div>
                    <div style={{display: 'flex', height: '50%', opacity: (userOut.length && userOut.includes(2)) ? '0.5' : '1'}}>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[1].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                        <div style={{textAlign:"center"}}><p>{userName2}</p></div>
                    </div>
                </div>
                <div style={{fontWeight:"bolder", textAlign:"center"}}><p>{score1}|{score3}</p></div>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', height: '50%', opacity: (userOut.length && userOut.includes(3)) ? '0.5' : '1'}}>
                        <div style={{textAlign:"center"}}><p>{userName3}</p></div>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[2].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                    </div>
                    <div style={{display: 'flex', height: '50%', opacity: (userOut.length && userOut.includes(4)) ? '0.5' : '1'}}>
                        <div style={{textAlign:"center"}}><p>{userName4}</p></div>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[3].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} style={{marginTop: '-30px'}}></canvas>
            {(!gameFinished && !gameAborted) && (<button onClick={exitTheGame} style={{position:'absolute', top:"250px", right:"50%", color:"black", padding:"10px"}}>exit</button>)}
        </div>
    )
}

export default TwoVsTwoPlayMatch