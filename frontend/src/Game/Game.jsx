import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Navigate, useNavigate } from 'react-router-dom'
import PlayMatch from './PlayMatch'

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
    draw(ctx, cvx) {
        ctx.fillStyle = this.color;
        for (let i = 0; i <= cvx.height; i += 15)
            ctx.fillRect(this.x, this.y + i, this.width, this.height);
    }
}

const Game = () => {
    let navigate = useNavigate()
    let [playerNo, setPlayerNo] = useState(0)
    let [isGameStarted, setIsGameStarted] = useState(false)
    let [loading, setLoading] = useState(false)
    let [socket, setSocket] = useState()
    let { privateCheckAuth, setUser } = useContext(AuthContext)
    let [roomID, setRoomID] = useState(null);
    let [player1, setPlayer1] = useState(null);
    let [player2, setPlayer2] = useState(null);
    let [ball, setBall] = useState(null);
    let [net, setNet] = useState(null);

    useEffect(() => {
        privateCheckAuth()
        const newSocket = new WebSocket(`ws://localhost:8000/ws/socket-server`) // 10.12.7.3  localhost
        newSocket.onopen = () => {
            setSocket(newSocket)
            newSocket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === "startedGame") {
                    setRoomID(message.id);
                    setPlayer1(new Player(message.players[0].paddleX, message.players[0].paddleY, 10, 100, 'white', message.players[0].score));
                    setPlayer2(new Player(message.players[1].paddleX, message.players[1].paddleY, 10, 100, 'white', message.players[1].score));
                    setBall(new Ball(message.ball.ballX, message.ball.ballY, 10, 'white'));
                    setNet(new Net(300, 0, 2, 10, 'white'));
                    setLoading(true)
                    setIsGameStarted(true)
                }
                if (type === 'playerNo')
                    setPlayerNo(message.playerNo)
            }
        }
        
        return () => {
            if (newSocket &&
                newSocket.readyState === WebSocket.OPEN) {
                newSocket.close();
            }
        };
    }, [])

    const startGame = async () => {
        try {
            let response = await fetch('http://localhost:8000/api/get', {  // 10.12.7.3  localhost
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            response = await response.json()
            if (response.detail !== "Unauthenticated") {
                setUser(response.name)
            }
            else {
                setUser('')
                setLoading(false)
                navigate('/signin')
            }
        } catch (e) {
            console.log("something wrong with fetch")
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('inside socket open')
            socket.send(JSON.stringify({
                type: 'join',
                message: 'join',
            }))
            console.log('waiting for other player')
        } else if (socket) {
            socket.onopen = function () {
                console.log('inside socket open')
                socket.send(JSON.stringify({
                    type: 'join',
                    message: 'join',
                }))
                console.log('waiting for other player')
            };
        } else {
            console.log('socket is null or not open, refresh')
        }
    }


    return (
        (!loading && (
            <div style={{height:"100px"}}>
                <div style={{color:'white', fontSize:'40px'}}>this is the gaming page</div>
                <button onClick={startGame} style={{cursor:"pointer"}}>Start match</button>
            </div>
        ) || 
            <PlayMatch
                socket={socket}
                playerNo={playerNo}
                setPlayerNo={setPlayerNo}
                isGameStarted={isGameStarted}
                setIsGameStarted={setIsGameStarted}
                setLoading={setLoading}
                roomID={roomID}
                player1={player1}
                player2={player2}
                ball={ball}
                Player={Player}
                Ball={Ball}
                setRoomID={setRoomID}
                setPlayer1={setPlayer1}
                setPlayer2={setPlayer2}
                setBall={setBall}
                net={net}
                Net={Net}
            />
        )
    )
}

export default Game