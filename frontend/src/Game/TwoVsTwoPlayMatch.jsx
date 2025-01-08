import React, { useRef, useEffect, useContext, useState, useCallback } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css';
import TwoVsTwoStats from './TwoVsTwoStats';

class Player {
    constructor(x, y, width, height, color, score) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.score = score
    }
    
    changeProperties(newX, newY, newWidth, newHeight, newColor, newScore) {
        this.x = newX
        this.y = newY
        this.width = newWidth
        this.height = newHeight
        this.color = newColor
        this.score = newScore
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

// class PlayerInfos {
//     constructor (name) {
//         this.name = name
//     }
// }

class Ball {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    changeProperties(newX, newY, newRadius, newColor) {
        this.x = newX
        this.y = newY
        this.radius = newRadius
        this.color = newColor
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
    }
}

class Net {
    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
    }

    changeProperties(newX, newY, newWidth, newHeight, newColor) {
        this.x = newX
        this.y = newY
        this.width = newWidth
        this.height = newHeight
        this.color = newColor
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        for (let i = 0; i <= ctx.canvas.height; i += 15)
            ctx.fillRect(this.x, this.y + i, this.width, this.height)
    }
}

class Edges {
    constructor(newHeight, newColor) {
        this.height = newHeight
        this.color = newColor
    }

    changeProperties(newHeight) {
        this.height = newHeight
    }

    draw(ctx) {
        // ctx.fillStyle = this.color
        // for (let i = 0; i <= ctx.canvas.height; i += 15)
        //     ctx.fillRect(this.x, this.y + i, this.width, this.height)
        ctx.fillStyle = this.color
        ctx.fillRect(0, 0, ctx.canvas.width, this.height)
        ctx.fillStyle = this.color
        ctx.fillRect(0, ctx.canvas.height - this.height, ctx.canvas.width, this.height)
    }
}

const TwoVsTwoPlayMatch = () => {
    let { gameCustomize, privateCheckAuth, socket,
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

    let isGameStarted = false
    let playerNo = 0
    // let player1 = null
    // let player2 = null
    // let player3 = null
    // let player4 = null
    // let ball = null
    // let net = null

    let player1 = useRef(null)
    let player2 = useRef(null)
    let player3 = useRef(null)
    let player4 = useRef(null)
    let ball = useRef(null)
    let edges = useRef(null)
    // let net = useRef(null)
    
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
    const gameCustomizeRef = useRef(gameCustomize);
    const gameFinishedRef = useRef(gameFinished);
    const gameAbortedRef = useRef(gameAborted);
    const wrapperRef = useRef(null);
    const resultRef = useRef(null);
    const aspectRatio = 710 / 400

    const [canvasDims, setCanvasDims] = useState(null);
    const canvasDimsRef = useRef(canvasDims);

    const originalPositions = {
        player1_x: 15,
        player1_y: 65,
        player2_x: 15,
        player2_y: 265,
        player3_x: 685,
        player3_y: 65,
        player4_x: 685,
        player4_y: 265,
        ball_x: 355,
        ball_y: 200
    }
    const [time, setTime] = useState(0);
    let timer;

    let isOut = false
    const userRef = useRef(user)
    const roomIdRef = useRef(roomID)
    const socketRef = useRef(socket)

    let particles = [];

    const [playersInfos, setPlayersInfos] = useState([
        {
            totalScore: 0,
            score: 0,
            hit: 0,
            accuracy: 0,
            rating: 0,
            status: 'winner'
        },
        {
            totalScore: 0,
            score: 0,
            hit: 0,
            accuracy: 0,
            rating: 0,
            status: 'winner'
        },
        {
            totalScore: 0,
            score: 0,
            hit: 0,
            accuracy: 0,
            rating: 0,
            status: 'winner'
        },
        {
            totalScore: 0,
            score: 0,
            hit: 0,
            accuracy: 0,
            rating: 0,
            status: 'winner'
        },
        {
            time: 0,
        }
    ])

    function createParticle(x, y) {
            let particle = {
                x,
                y,
                radius: Math.random() + 0.2, // Random radius between 1 and 3 ====> Math.random() * 2 + 1
                color: `hsl(${Math.random() * 40 + 20}, 100%, 50%)`, // Random hue for fire-like colors ====> `hsl(${Math.random() * 40 + 20}, 100%, 50%)`
                speedX: Math.random() - 0.8, // Random horizontal speed between -3 and 3
                speedY: Math.random() - 0.8, // Random vertical speed between -3 and 3
                life: Math.random() * 50 + 40 // Random lifetime between 50 and 100 frames
            };
            particles.push(particle);
        }
    
    // useEffect(() => {
    //     privateCheckAuth()
    // }, [])

    const draw = () => {
        const ctx = canvasContextRef.current
        const canvas = canvasRef.current;
        const gameCustom = gameCustomizeRef.current
        const userGotOut = userOutRef.current
        if (ctx && canvas && player1.current && player2.current && player3.current && player4.current && ball.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = gameCustom[2]
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            edges.current.draw(ctx)
            // net.current.draw(ctx)
            if (userGotOut && isGameStarted) {
                if (!userGotOut.includes(1))
                    player1.current.draw(ctx)
                if (!userGotOut.includes(2))
                    player2.current.draw(ctx)
                if (!userGotOut.includes(3))
                    player3.current.draw(ctx)
                if (!userGotOut.includes(4))
                    player4.current.draw(ctx)
            } else {
                player1.current.draw(ctx)
                player2.current.draw(ctx)
                player3.current.draw(ctx)
                player4.current.draw(ctx)
            }
            if (isGameStarted && gameCustom[3]) {
				particles.forEach((particle, index) => {
					// Decrease life`
					particle.life--;

					// Remove dead particles
					if (particle.life <= 0) {
						particles.splice(index, 1);
						return;
					}

					// Update position
					particle.x += particle.speedX;
					particle.y += particle.speedY;

					// Draw particle
					ctx.beginPath();
					ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
					ctx.fillStyle = particle.color;
					ctx.fill();
					ctx.closePath();
				});
				createParticle(ball.current.x, ball.current.y);
				createParticle(ball.current.x + 0.5, ball.current.y + 0.5);
				createParticle(ball.current.x + 0.5, ball.current.y + 0.5);
				createParticle(ball.current.x + 0.3, ball.current.y + 0.3);
				createParticle(ball.current.x + 0.3, ball.current.y + 0.3);
			}
            ball.current.draw(ctx)
        }
    }

    useEffect(() => {
        if (player1.current && player2.current && player3.current && player4.current && ball.current) {
            if (playerNo === 1) {
                player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, gameCustomize[0], player1.current.score)
                player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, '#B38EF0', player2.current.score)
                player3.current.changeProperties(player3.current.x, player3.current.y, player3.current.width, player3.current.height, '#B38EF0', player3.current.score)
                player4.current.changeProperties(player4.current.x, player4.current.y, player4.current.width, player4.current.height, '#B38EF0', player4.current.score)
            } else if (playerNo === 2) {
                player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, '#B38EF0', player1.current.score)
                player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, gameCustomize[0], player2.current.score)
                player3.current.changeProperties(player3.current.x, player3.current.y, player3.current.width, player3.current.height, '#B38EF0', player3.current.score)
                player4.current.changeProperties(player4.current.x, player4.current.y, player4.current.width, player4.current.height, '#B38EF0', player4.current.score)
            } else if (playerNo === 3) {
                player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, '#B38EF0', player1.current.score)
                player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, '#B38EF0', player2.current.score)
                player3.current.changeProperties(player3.current.x, player3.current.y, player3.current.width, player3.current.height, gameCustomize[0], player3.current.score)
                player4.current.changeProperties(player4.current.x, player4.current.y, player4.current.width, player4.current.height, '#B38EF0', player4.current.score)
            } else if (playerNo === 4) {
                player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, '#B38EF0', player1.current.score)
                player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, '#B38EF0', player2.current.score)
                player3.current.changeProperties(player3.current.x, player3.current.y, player3.current.width, player3.current.height, '#B38EF0', player3.current.score)
                player4.current.changeProperties(player4.current.x, player4.current.y, player4.current.width, player4.current.height, gameCustomize[0], player4.current.score)
            } else {
                player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, gameCustomize[0], player1.current.score)
                player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, gameCustomize[0], player2.current.score)
                player3.current.changeProperties(player3.current.x, player3.current.y, player3.current.width, player3.current.height, gameCustomize[0], player3.current.score)
                player4.current.changeProperties(player4.current.x, player4.current.y, player4.current.width, player4.current.height, gameCustomize[0], player4.current.score)
            }
            ball.current.changeProperties(ball.current.x, ball.current.y, ball.current.radius, gameCustomize[1])
        }
    }, [gameCustomize])

    useEffect(() => {
		canvasContextRef.current = canvasContext;
		canvasDimensionsRef.current = canvasDimensions;
		userOutRef.current = userOut;
        gameCustomizeRef.current = gameCustomize
        gameFinishedRef.current = gameFinished
        gameAbortedRef.current = gameAborted
        canvasDimsRef.current = canvasDims
	}, [canvasContext, canvasDimensions, userOut, gameCustomize, gameAborted, gameFinished, canvasDims]);

    function resizeCanvas() {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        const result = resultRef.current;
        if (canvas && wrapper && result) {
            let { width: wrapperWidth, height: wrapperHeight } = wrapper.getBoundingClientRect();
            let { width: resWrapperWidth, height: resWrapperHeight } = result.getBoundingClientRect();
        
            const rectDim = canvas.getBoundingClientRect()
            setCanvasDimensions(rectDim)
            wrapperHeight -= resWrapperHeight;
            if (wrapperWidth / aspectRatio < wrapperHeight) {
                canvas.width = wrapperWidth;
                canvas.height = (wrapperWidth / aspectRatio);
                result.style.width = wrapperWidth + 'px';
            } else {
                canvas.height = wrapperHeight;
                canvas.width = (wrapperHeight * aspectRatio);
                result.style.width = (wrapperHeight * aspectRatio) + 'px';
            }
            updateGameObjectProperties(canvas.width, canvas.height)
            draw()
        }
    }

    const updateGameObjectProperties = (width, height) => {
        const originalWidth = 710;
        const originalHeight = 400;
    
        const widthScalingFactor = width / originalWidth;
        const heightScalingFactor = height / originalHeight;
        const scalingFactor = Math.min(widthScalingFactor, heightScalingFactor);
        const gameCustom = gameCustomizeRef.current

        if (gameCustom) {
            if (playerNo === 1) {
                player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player2.current.changeProperties((15 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player3.current.changeProperties((685 * widthScalingFactor), (originalPositions.player3_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player4.current.changeProperties((685 * widthScalingFactor), (originalPositions.player4_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
            } else if (playerNo === 2) {
                player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player2.current.changeProperties((15 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player3.current.changeProperties((685 * widthScalingFactor), (originalPositions.player3_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player4.current.changeProperties((685 * widthScalingFactor), (originalPositions.player4_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
            } else if (playerNo === 3) {
                player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player2.current.changeProperties((15 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player3.current.changeProperties((685 * widthScalingFactor), (originalPositions.player3_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player4.current.changeProperties((685 * widthScalingFactor), (originalPositions.player4_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
            } else if (playerNo === 4) {
                player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player2.current.changeProperties((15 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player3.current.changeProperties((685 * widthScalingFactor), (originalPositions.player3_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
                player4.current.changeProperties((685 * widthScalingFactor), (originalPositions.player4_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
            } else {
                player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player2.current.changeProperties((15 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player3.current.changeProperties((685 * widthScalingFactor), (originalPositions.player3_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
                player4.current.changeProperties((685 * widthScalingFactor), (originalPositions.player4_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
            }
            ball.current.changeProperties((originalPositions.ball_x * widthScalingFactor), (originalPositions.ball_y * heightScalingFactor), (7 * scalingFactor), gameCustom[1]);
            edges.current.changeProperties((10 * scalingFactor), 'white');
        }
        // net.current.changeProperties((354 * widthScalingFactor), 0, (2 * scalingFactor), 10, 'white');
    }

	useEffect(() => {
        if (canvasRef && !canvasDrawing && gameCustomize.length && socket) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d')
            player1.current = new Player(15, 65, 10, 70, gameCustomize[0], 0)
            player2.current = new Player(15, 265, 10, 70, gameCustomize[0], 0)
            player3.current = new Player(685, 65, 10, 70, gameCustomize[0], 0)
            player4.current = new Player(685, 265, 10, 70, gameCustomize[0], 0)
            ball.current = new Ball(355, 200, 7, gameCustomize[1])
            edges.current = new Edges(10, 'white')
            // net.current = new Net(354, 0, 2, 10, 'white')
            resizeCanvas()
            const rectDim = canvas.getBoundingClientRect()
            setCanvasContext(context);
            setCanvasDimensions(rectDim)
            window.addEventListener("keydown", handleKeyDown)
            window.addEventListener("keyup", handleKeyUp)
            canvas.addEventListener("mousemove", handleMouseMove)
            window.addEventListener('resize', resizeCanvas);
            setCanvasDrawing(true)
        }
	}, [canvasRef, canvasDrawing, socket]);

    const update = () => {
        if (!isGameStarted)
            return;
        if (playerNo) {
            const userGotOut = userOutRef.current
            const canvas = canvasRef.current;
            if (userGotOut && canvas) {
                if (keys['ArrowUp']) {
                    const playerTop2 = (userGotOut.includes(1) ? edges.current.height : (canvas.height / 2))
                    const playerTop4 = (userGotOut.includes(3) ? edges.current.height : (canvas.height / 2))
                    if (!((playerNo === 1 && player1.current.y === edges.current.height)
                        || (playerNo === 2 && player2.current.y === playerTop2)
                        || (playerNo === 3 && player3.current.y === edges.current.height)
                        || (playerNo === 4 && player4.current.y === playerTop4))) {
                        if (socket && socket.readyState === WebSocket.OPEN) {
                            (playerNo === 1) ? player1.current.y -= 8 : (playerNo === 2) ? player2.current.y -= 8 : (playerNo === 3) ? player3.current.y -= 8 : player4.current.y -= 8
                            (playerNo === 1) ? originalPositions.player1_y -= 8 : (playerNo === 2) ? originalPositions.player2_y -= 8 : (playerNo === 3) ? originalPositions.player3_y -= 8 : originalPositions.player4_y -= 8
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
                } else if (keys['ArrowDown']) {
                    const playerBottom1 = (userGotOut.includes(2) ? (canvas.height - edges.current.height) : (canvas.height / 2))
                    const playerBottom3 = (userGotOut.includes(4) ? (canvas.height - edges.height) : (canvas.height / 2))
                    if (!((playerNo === 1 && (player1.current.y + player1.current.height) === playerBottom1)
                        || (playerNo === 2 && (player2.current.y + player2.current.height) === (canvas.height - edges.current.height))
                        || (playerNo === 3 && (player3.current.y + player3.current.height) === playerBottom3)
                        || (playerNo === 4 && (player4.current.y + player4.current.height) === (canvas.height - edges.current.height)))) {
                        if (socket && socket.readyState === WebSocket.OPEN) {
                            (playerNo === 1) ? player1.current.y += 8 : (playerNo === 2) ? player2.current.y += 8 : (playerNo === 3) ? player3.current.y += 8 : player4.current.y += 8
                            (playerNo === 1) ? originalPositions.player1_y += 8 : (playerNo === 2) ? originalPositions.player2_y += 8 : (playerNo === 3) ? originalPositions.player3_y += 8 : originalPositions.player4_y += 8
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
        }
        setScore1(player1.current.score)
        setScore2(player2.current.score)
        setScore3(player3.current.score)
        setScore4(player4.current.score)
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
        const canvas = canvasRef.current;
        if (rect && userGotOut && canvas) {
            if (playerNo === 1) {
                if (player1.current) {
                    const playerBottom = (userGotOut.includes(2) ? (canvas.height - edges.current.height) : (canvas.height / 2))
                    player1.current.y = e.clientY - rect.top - (player1.current.height / 2);
                    originalPositions.player1_y = e.clientY - rect.top - 35;
                    if (player1.current.y < edges.current.height) {
                        player1.current.y = edges.current.height;
                        originalPositions.player1_y = 10;
                    }
                    else if (player1.current.y + player1.current.height > playerBottom) {
                        player1.current.y = ((canvas.height / 2) - player1.current.height) // this just for if the temmate is exist
                        originalPositions.player1_y = 130
                    }
                }
            }
            else if (playerNo === 2) {
                if (player2.current) {
                    const playerTop = (userGotOut.includes(1) ? edges.current.height : (canvas.height / 2))
                    player2.current.y = e.clientY - rect.top - (player2.current.height / 2);
                    originalPositions.player2_y = e.clientY - rect.top - 35;
                    if (player2.current.y < playerTop) {
                        player2.current.y = (canvas.height / 2) // this just for if the temmate is exist
                        originalPositions.player2_y = 200;
                    }
                    else if (player2.current.y + player2.current.height > (canvas.height - edges.current.height)) {
                        player2.current.y = ((canvas.height - edges.current.height) - player2.current.height)
                        originalPositions.player2_y = 320
                    }
                }
            }
            else if (playerNo === 3) {
                if (player3.current) {
                    const playerBottom = (userGotOut.includes(4) ? (canvas.height - edges.current.height) : (canvas.height / 2))
                    player3.current.y = e.clientY - rect.top - (player3.current.height / 2);
                    originalPositions.player3_y = e.clientY - rect.top - 35;
                    if (player3.current.y < edges.current.height) {
                        player3.current.y = edges.current.height;
                        originalPositions.player3_y = 10;
                    }
                    else if (player3.current.y + player3.current.height > playerBottom) {
                        player3.current.y = ((canvas.height / 2) - player3.current.height) // this just for if the temmate is exist
                        originalPositions.player3_y = 130
                    }
                }
            }
            else if (playerNo === 4) {
                if (player4.current) {
                    const playerTop = (userGotOut.includes(3) ? edges.current.height : (canvas.height / 2))
                    player4.current.y = e.clientY - rect.top - (player4.current.height / 2);
                    originalPositions.player4_y = e.clientY - rect.top - 35;
                    if (player4.current.y < playerTop) {
                        player4.current.y = (canvas.height / 2) // this just for if the temmate is exist
                        originalPositions.player4_y = 200;
                    }
                    else if (player4.current.y + player4.current.height > (canvas.height - edges.current.height)) {
                        player4.current.y = ((canvas.height - edges.current.height) - (player4.current.height))
                        originalPositions.player4_y = 320
                    }
                }
            }
            const heightScalingFactor = 400 / canvas.height;
            const distance = (e.clientY - rect.top) * heightScalingFactor
            socket.send(JSON.stringify({
                type: 'moveMouseMp',
                message: {
                    roomID: roomID,
                    playerNo: playerNo,
                    distance: distance
                }
            }))
        }
    }

    // const playerGotOut = (message) => {
    //     const ctx = canvasContextRef.current;
    //     if (ctx) {
    //         if (message.userNo === 1) {
    //             ctx.clearRect(player1.current.x, player1.current.y, player1.current.width, player1.current.height);
    //             player1.current.x = 0
    //             player1.current.y = 0
    //             player1.current.width = 0
    //             player1.current.height = 0
    //         } else if (message.userNo === 2) {
    //             ctx.clearRect(player2.current.x, player2.current.y, player2.current.width, player2.current.height);
    //             player2.current.x = 0
    //             player2.current.y = 0
    //             player2.current.width = 0
    //             player2.current.height = 0
    //         } else if (message.userNo === 3) {
    //             ctx.clearRect(player3.current.x, player3.current.y, player3.current.width, player3.current.height);
    //             player3.x = 0
    //             player3.y = 0
    //             player3.width = 0
    //             player3.height = 0
    //         } else if (message.userNo === 4) {
    //             ctx.clearRect(player4.current.x, player4.current.y, player4.current.width, player4.current.height);
    //             player4.current.x = 0
    //             player4.current.y = 0
    //             player4.current.width = 0
    //             player4.current.height = 0
    //         }
    //     }
    // }
    
    // const gamefinishedAborted = (message) => {
    //     setUserName1(message.user1)
    //     setUserName2(message.user2)
    //     setUserName3(message.user3)
    //     setUserName4(message.user4)
    //     setScore1(message.playerScore1)
    //     setScore2(message.playerScore2)
    //     setScore3(message.playerScore3)
    //     setScore4(message.playerScore4)
    //     setUserOut([])
    //     isGameStarted = false
    //     const canvas = canvasRef.current;
    //     const gameCustom = gameCustomizeRef.current
    //     if (canvas && gameCustom) {
    //         const widthScalingFactor = canvas.width / 710;
    //         const heightScalingFactor = canvas.height / 400;
    //         const scalingFactor = Math.min(widthScalingFactor, heightScalingFactor);
    //         player1.current.changeProperties((15 * widthScalingFactor), (65 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
    //         player2.current.changeProperties((15 * widthScalingFactor), (265 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
    //         player3.current.changeProperties((685 * widthScalingFactor), (65 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
    //         player4.current.changeProperties((685 * widthScalingFactor), (265 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
    //         ball.current.changeProperties((355 * widthScalingFactor), (200 * heightScalingFactor), (7 * scalingFactor), gameCustom[1]);
    //     }
    //     draw()
    // }

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === "setupGame") {
                    playerNo = message.playerNo
                    isGameStarted = true
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    setTime(message.time)
                    startTimer()
                    if (message.hasOwnProperty('userOut') && message.userOut.length) {
                        setUserOut(message.userOut)
                    }
                } else if (type === "updateGame") {
                    if (player1.current && player2.current && ball) {
                        const canvas = canvasRef.current;
                        if (canvas) {
                            //console.log("updating the front now")
                            const widthScalingFactor = canvas.width / 710;
                            const heightScalingFactor = canvas.height / 400;
                            player1.current.y = message.playerY1 * heightScalingFactor;
                            player2.current.y = message.playerY2 * heightScalingFactor;
                            player3.current.y = message.playerY3 * heightScalingFactor;
                            player4.current.y = message.playerY4 * heightScalingFactor;
                            player1.current.score = message.playerScore1;
                            player2.current.score = message.playerScore2;
                            player3.current.score = message.playerScore3;
                            player4.current.score = message.playerScore4;
                            ball.current.x = message.ballX * widthScalingFactor;
                            ball.current.y = message.ballY * heightScalingFactor;

                            originalPositions.player1_y = message.playerY1
                            originalPositions.player2_y = message.playerY2
                            originalPositions.player3_y = message.playerY3
                            originalPositions.player4_y = message.playerY4
                            originalPositions.ball_x = message.ballX
                            originalPositions.ball_y = message.ballY
                            update()
                            resizeCanvas()
                            draw()
                        }
                    }
                } else if (type === "notAuthorized") {
                    navigate("../game/solo/2vs2")
                } else if (type === "roomNotExist") {
                    navigate("../game/solo/2vs2")
                } else if (type === "finishedGame") {
                    let allPlayersStats = [...playersInfos]
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setScore3(message.playerScore3)
                    setScore4(message.playerScore4)
                    setGameFinished(true)
                    // gamefinishedAborted(message)
                    setTime(message.time)
                    allPlayersStats[0].totalScore = message.score[0]
                    allPlayersStats[1].totalScore = message.score[1]
                    allPlayersStats[2].totalScore = message.score[2]
                    allPlayersStats[3].totalScore = message.score[3]
                    allPlayersStats[0].score = message.selfScore[0]
                    allPlayersStats[1].score = message.selfScore[1]
                    allPlayersStats[2].score = message.selfScore[2]
                    allPlayersStats[3].score = message.selfScore[3]
                    allPlayersStats[0].hit = message.hit[0]
                    allPlayersStats[1].hit = message.hit[1]
                    allPlayersStats[2].hit = message.hit[2]
                    allPlayersStats[3].hit = message.hit[3]
                    allPlayersStats[0].accuracy = message.accuracy[0]
                    allPlayersStats[1].accuracy = message.accuracy[1]
                    allPlayersStats[2].accuracy = message.accuracy[2]
                    allPlayersStats[3].accuracy = message.accuracy[3]
                    allPlayersStats[0].rating = message.rating[0]
                    allPlayersStats[1].rating = message.rating[1]
                    allPlayersStats[2].rating = message.rating[2]
                    allPlayersStats[3].rating = message.rating[3]
                    allPlayersStats[0].status = message.status[0]
                    allPlayersStats[1].status = message.status[1]
                    allPlayersStats[2].status = message.status[2]
                    allPlayersStats[3].status = message.status[3]
                    setPlayersInfos(allPlayersStats)
                } else if (type === "abortedGame") {
                    let allPlayersStats = [...playersInfos]
                    setUserName1(message.user1)
                    setUserName2(message.user2)
                    setUserName3(message.user3)
                    setUserName4(message.user4)
                    setScore1(message.playerScore1)
                    setScore2(message.playerScore2)
                    setScore3(message.playerScore3)
                    setScore4(message.playerScore4)
                    setGameAborted(true)
                    // gamefinishedAborted(message)
                    setTime(message.time)
                    allPlayersStats[0].totalScore = message.score[0]
                    allPlayersStats[1].totalScore = message.score[1]
                    allPlayersStats[2].totalScore = message.score[2]
                    allPlayersStats[3].totalScore = message.score[3]
                    allPlayersStats[0].score = message.selfScore[0]
                    allPlayersStats[1].score = message.selfScore[1]
                    allPlayersStats[2].score = message.selfScore[2]
                    allPlayersStats[3].score = message.selfScore[3]
                    allPlayersStats[0].hit = message.hit[0]
                    allPlayersStats[1].hit = message.hit[1]
                    allPlayersStats[2].hit = message.hit[2]
                    allPlayersStats[3].hit = message.hit[3]
                    allPlayersStats[0].accuracy = message.accuracy[0]
                    allPlayersStats[1].accuracy = message.accuracy[1]
                    allPlayersStats[2].accuracy = message.accuracy[2]
                    allPlayersStats[3].accuracy = message.accuracy[3]
                    allPlayersStats[0].rating = message.rating[0]
                    allPlayersStats[1].rating = message.rating[1]
                    allPlayersStats[2].rating = message.rating[2]
                    allPlayersStats[3].rating = message.rating[3]
                    setPlayersInfos(allPlayersStats)
                } else if (type === "playersInfos")
                    setPlayersPics(message.users)
                else if (type === "playerOut") {
                    if (isGameStarted) {
                        const userGotOut = userOutRef.current
                        setUserOut([...userGotOut, message.userNo])
                        // playerGotOut(message)
                    }
                } else if (type === 'hmed')
                    socket.close()
            }
        }
    }, [socket, user])

    
    useEffect(() => {
        if (canvasDrawing && !socketRecreated && user) {
            if (socket && socket.readyState === WebSocket.OPEN && user) {
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
    
    const startTimer = () => {
            timer = setInterval(() => {
                if (isGameStarted)
                    setTime(prevTime => prevTime + 1);
                else
                clearInterval(timer)
        }, 1000);
    }

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        if (minutes >= 60)
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        userRef.current = user;
        roomIdRef.current = roomID;
        socketRef.current = socket;
    }, [user, roomID, socket]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const user = userRef.current
            const socket = socketRef.current
            const roomID = roomIdRef.current
            if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
                socket.send(JSON.stringify({
                    type: 'playerChangedPageMp',
                    message: {
                        user: user,
                        roomID: roomID
                    }
                }))
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    useEffect(() => {
        return () => {
            if (isOut) {
                const user = userRef.current
                const socket = socketRef.current
                const roomID = roomIdRef.current
                if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
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

    return (
        <>
            {(gameFinished || gameAborted) &&
                <TwoVsTwoStats
                    gameFinished={gameFinished}
                    user={user}
                    userName1={userName1}
                    userName2={userName2}
                    userName3={userName3}
                    userName4={userName4}
                    playersInfos={playersInfos}
                    playersPics={playersPics}
                />
            }
            {(!gameFinished && !gameAborted) && (<div className='twovstwo-pm' ref={wrapperRef} >
                {gameFinished ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}><p>GAME FINISHED</p></div>) : gameAborted ? (<div style={{fontWeight:"bolder", textAlign:"center", color:"white", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}><p>GAME ABORTED</p></div>) : ''}
                <div ref={resultRef} className='twovstwo-pm-infos' >
                    <div>
                        {playersPics.length ? (<img src={playersPics[0].avatar} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(1)) ? '0.5' : '1'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(1)) ? '0.5' : '1'}} />)}
                        {playersPics.length ? (<img src={playersPics[1].avatar} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(2)) ? '0.5' : '1'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(2)) ? '0.5' : '1'}} />)}
                        <div><p>Team 1</p></div>
                    </div>
                    <div>
                        <p>{score1}</p>
                        <div className='onevsone-pm-infos-stats' >
                            <div>
                                <p>Goal: 5</p>
                                <div onClick={(!gameFinished && !gameAborted) ? exitTheGame : undefined} >
                                    <img src={Icons.logout} alt="" />
                                    <p>Exit</p>
                                </div>
                            </div>
                            <div>{formatTime(time)}</div>
                        </div>
                        <p>{score3}</p>
                    </div>
                    <div>
                        <div><p>Team 2</p></div>
                        {playersPics.length ? (<img src={playersPics[2].avatar} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(3)) ? '0.5' : '1'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(3)) ? '0.5' : '1'}} />)}
                        {playersPics.length ? (<img src={playersPics[3].avatar} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(4)) ? '0.5' : '1'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%', opacity: (userOut.length && userOut.includes(4)) ? '0.5' : '1'}} />)}
                    </div>
                </div>
                <canvas ref={canvasRef} ></canvas>
            </div>)}
        </>
    )
}

export default TwoVsTwoPlayMatch