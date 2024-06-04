import React, { useRef, useEffect, useContext, useState } from 'react';
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
        socketRecreated, setSocketRecreated, user } = useContext(AuthContext)
    const [canvasDrawing, setCanvasDrawing] = useState(false)
    const [gameAborted, setGameAborted] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [userName1, setUserName1] = useState(null)
    const [userName2, setUserName2] = useState(null)
    const [userName3, setUserName3] = useState(null)
    const [userName4, setUserName4] = useState(null)
    const [userImage1, setUserImage1] = useState(null)
    const [userImage2, setUserImage2] = useState(null)
    const [userImage3, setUserImage3] = useState(null)
    const [userImage4, setUserImage4] = useState(null)
    const [playersPics, setPlayersPics] = useState([])
    // const [allSet, setAllSet] = useState(false)
    const navigate = useNavigate()
    const { roomID } = useParams()
    let canvasRef = useRef(null);
    let isOut = false
    let drawingFirstTime = false
    // const [playerNo, setPlayerNo] = useState(0)

    let isGameStarted = false
    let playerNo = 0
    // let user1 = null
    // let user2 = null
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
                    || (playerNo === 2 && player2.y === 200)
                    || (playerNo === 3 && player2.y === 0)
                    || (playerNo === 4 && player2.y === 200))) {
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
            if (keys['ArrowDown']) {
                if (!((playerNo === 1 && player1.y + 100 === 200)
                    || (playerNo === 2 && player2.y + 100 === 400)
                    || (playerNo === 3 && player3.y + 100 === 200)
                    || (playerNo === 4 && player4.y + 100 === 200))) {
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
        if (playerNo === 1) {
            if (player1) {
                player1.y = e.clientY - rect.top - 50;
                if (player1.y < 0)
                    player1.y = 0;
                else if (player1.y + 100 > 200)
                    player1.y = 100
            }
        }
        else if (playerNo === 2) {
            if (player2) {
                player2.y = e.clientY - rect.top - 50;
                if (player2.y < 200)
                    player2.y = 200
                else if (player2.y + 100 > 400)
                    player2.y = 300
            }
        }
        else if (playerNo === 3) {
            if (player3) {
                player3.y = e.clientY - rect.top - 50;
                if (player3.y < 0)
                    player3.y = 0;
                else if (player3.y + 100 > 200)
                    player3.y = 100
            }
        }
        else if (playerNo === 4) {
            if (player4) {
                player4.y = e.clientY - rect.top - 50;
                if (player4.y < 200)
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

    // useEffect(() => {
    //     if (socketRecreated && user) {
    //         console.log("INSIDE RESTABISHMENT")
    //         socket.send(JSON.stringify({
    //             type: 'dataBackUp',
    //             message: {
    //                 user: user,
    //                 roomID: roomID,
    //                 page: 'game',
    //             }
    //         }))
    //         setSocketRecreated(false)
    //     }
    // }, [socketRecreated, user])

    useEffect(() => {
        ctx = canvasRef.current.getContext('2d')
        ctx.canvas.width = 600
        ctx.canvas.height = 400
        rect = canvasRef.current.getBoundingClientRect()
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        canvasRef.current.addEventListener("mousemove", handleMouseMove)
        if (!canvasDrawing && socket) {
            player1 = new Player(5, 50, 10, 100, 'white', 0)
            player2 = new Player(5, 250, 10, 100, 'white', 0)
            player3 = new Player(585, 50, 10, 100, 'white', 0)
            player4 = new Player(585, 250, 10, 100, 'white', 0)
            ball = new Ball(300, 200, 10, 'red')
            net = new Net(300, 0, 2, 10, 'white')
            // draw()
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, 600, 400);
            console.log("ctx is : ", ctx)
            net.draw(ctx)
            player1.draw(ctx)
            player2.draw(ctx)
            player3.draw(ctx)
            player4.draw(ctx)
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
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    // setPlayersPics(message.users)
                    console.log(socket)
                } else if (type === "updateGame") {
                    // console.log("INSIDE UPDATEGAME")
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
                        ctx.clearRect(0, 0, 600, 400);
                        ctx.fillStyle = 'black';
                        ctx.fillRect(0, 0, 600, 400);
                        net.draw(ctx)
                        player1.draw(ctx)
                        player2.draw(ctx)
                        player3.draw(ctx)
                        player4.draw(ctx)
                        ball.draw(ctx)
                    }
                } else if (type === "notAuthorized") {
                    console.log("INSIDE LEAVEGAME")
                    console.log("navigating from the playing page")
                    navigate("../game/solo/2vs2")
                } else if (type === "roomNotExist") {
                    navigate("../game/solo/2vs2")
                } else if (type === "finishedGame") {
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setScore3(message.playerScore3)
                    setScore4(message.playerScore4)
                    setGameFinished(true)
                } else if (type === "abortedGame") {
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setScore3(message.playerScore3)
                    setScore4(message.playerScore4)
                    setGameAborted(true)
                } else if (type === "playersInfos")
                    setPlayersPics(message.users)
            }
        }
    }, [socket, user])

    useEffect(() => {
        return () => {
            if (isOut) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    // window.alert(user, roomID)
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
        // if (user) {
        //     if (socket && socket.readyState === WebSocket.OPEN) {
        //         socket.send(JSON.stringify({
        //             type: 'userExitedMp',
        //             message: {
        //                 user: user,
        //                 roomID: roomID
        //             }
        //         }))
        //         navigate('../game/solo/1vs1')
        //     } else {
        //         console.log("socket is closed, refresh the page")
        //     }
        // }
    }

    return (
        <div style={{position:"relative", display:'flex', flexDirection:'column', alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
            {gameFinished ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME FINISHED</p></div>) : gameAborted ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white"}}><p>GAME ABORTED</p></div>) : ''}
            <div style={{backgroundColor:"rgba(255,255,255,0.3)", color:"white", fontSize:"30px", display:"flex", textAlign:"center", justifyContent:"space-between", marginBottom:"100px", width:"40%", height:"100px", alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', height: '50%'}}>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[0].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                        <div style={{textAlign:"center"}}><p>{userName1}</p></div>
                    </div>
                    <div style={{display: 'flex', height: '50%'}}>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[1].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                        <div style={{textAlign:"center"}}><p>{userName2}</p></div>
                    </div>
                </div>
                <div style={{fontWeight:"bolder", textAlign:"center"}}><p>{score1}|{score3}</p></div>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{display: 'flex', height: '50%'}}>
                        <div style={{textAlign:"center"}}><p>{userName3}</p></div>
                        {playersPics.length ? (<img src={`data:image/jpeg;base64,${playersPics[2].avatar}`} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
                    </div>
                    <div style={{display: 'flex', height: '50%'}}>
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