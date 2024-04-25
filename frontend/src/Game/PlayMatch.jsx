import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

const PlayMatch = ({ socket, playerNo, isGameStarted, setIsGameStarted, setLoading, player1, player2, ball, roomID, setRoomID, setPlayer1, setPlayer2, setBall, setPlayerNo, net }) => {
    let canvasRef = useRef(null);
    let [score1, setscore1] = useState(0)
    let [score2, setscore2] = useState(0)
    const navigate = useNavigate()
    let ctx;
    let rect;
    let audio;
    const SPEED = 5;
    let keys = {
        ArrowDown: false,
        ArrowUp: false
    }

    const draw = (speed) => {
        ctx.clearRect(0, 0, 600, 400);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 600, 400);
        net.draw(ctx, canvasRef.current)
        player1.draw(ctx);
        player2.draw(ctx);
        console.log(speed)
        ball.draw(ctx);
    }

    const update = () => {
        if (!isGameStarted)
            return;
        if (keys['ArrowUp']) {
            if (!((playerNo === 1 && player1.y === 0) || (playerNo === 2 && player2.y === 0))) {
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
            if (!((playerNo === 1 && player1.y + 100 === 400) || (playerNo === 2 && player2.y + 100 === 400))) {
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
        setscore1(player1.score)
        setscore2(player2.score)
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
            player1.y = e.clientY - rect.top - 50;
            if (player1.y < 0)
                player1.y = 0;
            else if (player1.y + 100 > 400)
                player1.y = 300
        }
        else if (playerNo === 2) {
            player2.y = e.clientY - rect.top - 50;
            if (player2.y < 0)
                player2.y = 0
            else if (player2.y + 100 > 400)
                player2.y = 300
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
        ctx = canvasRef.current.getContext('2d');
        rect = canvasRef.current.getBoundingClientRect();
        audio = new Audio()
        canvasRef.current.width = 600;
        canvasRef.current.height = 400;

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        canvasRef.current.addEventListener("mousemove", handleMouseMove)
        draw()
    }, [])

    useEffect(() => {
        socket.onmessage = (event) => {
            let data = JSON.parse(event.data)
            let type = data.type
            let message = data.message

            if (type === "updateGame") {
                player1.y = message.player1_Y;
                player2.y = message.player2_Y;
                player1.score = message.player1_Score;
                player2.score = message.player2_Score;
                ball.x = message.ball_X;
                ball.y = message.ball_Y;
                update()
                draw(message.speed)
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
                    ctx.clearRect(0, 0, 600, 400)
                    setLoading(false)
                    setPlayerNo(0)
                    setIsGameStarted(false)
                    setPlayer1(null)
                    setPlayer2(null)
                    setBall(null)
                    setRoomID(null)
                    navigate('/mainpage/game')
                }, 1000);
            }
        }
    }, []);

    return (
        // (<div>(score1) ---- (score2)</div>)
        // <div style={{display:'flex',flexDirection:'column' , alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
        //     <canvas ref={canvasRef} style={{marginTop: '-30px'}}></canvas>
        // </div>
        <div style={{display:'flex', flexDirection:'column', alignItems: 'center', justifyContent:'center', width:'100%', height:'100%'}}>
            <div style={{backgroundColor:"rgba(255,255,255,0.3)", color:"white", fontSize:"30px", display:"flex", textAlign:"center", justifyContent:"space-between", marginBottom:"100px", width:"40%", height:"100px"}}>
                <div style={{textAlign:"center"}}><p>fatima_elk</p></div>
                <div style={{fontWeight:"bolder", textAlign:"center"}}><p>{score1}|{score2}</p></div>
                <div style={{textAlign:"center"}}><p>mo_salah</p></div>
            </div>
            <canvas ref={canvasRef} style={{marginTop: '-30px'}}></canvas>
        </div>
    );
};

export default PlayMatch;