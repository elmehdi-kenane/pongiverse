import React, { useRef, useEffect, useContext, useState } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css';

class Player {
	constructor(x, y, width, height, color, score) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.score = score;
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

	changeProperties(newX, newY, newRadius, newColor) {
		this.x = newX
		this.y = newY
		this.radius = newRadius
		this.color = newColor
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
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
		ctx.fillStyle = this.color
		ctx.fillRect(0, 0, ctx.canvas.width, this.height)
		ctx.fillStyle = this.color
		ctx.fillRect(0, ctx.canvas.height - this.height, ctx.canvas.width, this.height)
	}
}

const OneVsOnePlayTournamentMatch = () => {
	let { privateCheckAuth, gameCustomize, socket, user , notifSocket} = useContext(AuthContext)
	const [canvasDrawing, setCanvasDrawing] = useState(false)
	const [gameFinished, setGameFinished] = useState(false)
	const [userName1, setUserName1] = useState(null)
	const [userName2, setUserName2] = useState(null)
	const [playersPics, setPlayersPics] = useState([])
	const navigate = useNavigate()
	let canvasRef = useRef(null);
	let isOut = false
	let isGameStarted = false
	let playerNo = 0

	const [playerNoo, setPlayerNo] = useState(0);
	// let playerNoRef = useRef(null)
	let player1 = useRef(null)
	let player2 = useRef(null)
	let ball = useRef(null)
	let edges = useRef(null)
	let [score1, setScore1] = useState(0)
	let [score2, setScore2] = useState(0)
	let keys = {
		ArrowDown: false,
		ArrowUp: false,
		MouseMove: false,
		Event: null,
	}

	const [canvasContext, setCanvasContext] = useState(null);
	const canvasContextRef = useRef(canvasContext);
	const [canvasDimensions, setCanvasDimensions] = useState(null);
	const canvasDimensionsRef = useRef(canvasDimensions);
	const gameCustomizeRef = useRef(gameCustomize);
	const gameFinishedRef = useRef(gameFinished);
	const wrapperRef = useRef(null);
	const resultRef = useRef(null);
	const aspectRatio = 710 / 400

	const [canvasDims, setCanvasDims] = useState(null);
	const canvasDimsRef = useRef(canvasDims);

	const originalPositions = {
		player1_x: 15,
		player1_y: 165,
		player2_x: 685,
		player2_y: 165,
		ball_x: 355,
		ball_y: 200
	}

	const [time, setTime] = useState(0);
	let timer;

	const userRef = useRef(user)
	const socketRef = useRef(socket)

	let particles = [];

	const [playersInfos, setPlayersInfos] = useState([
		{
		  totalScore: 0,
		  score: 0,
		  hit: 0,
		  accuracy: 0,
		  rating: 0,
		},
		{
		  totalScore: 0,
		  score: 0,
		  hit: 0,
		  accuracy: 0,
		  rating: 0
		},
		{
		  time: 0,
		}
	  ])

	// const radius = Math.random() + 0.8


		// let particlesConst = {
		//     radius: radius,
		//     speedX: speedX,
		//     speedY: speedY
		// }
		// let particle = {
		//     x,
		//     y,
		//     radius: radius * , // Random radius between 1 and 3 ====> Math.random() * 2 + 1
		//     color: `hsl(${Math.random() * 40 + 20}, 100%, 50%)`, // Random hue for fire-like colors ====> `hsl(${Math.random() * 40 + 20}, 100%, 50%)`
		//     speedX: Math.random() * 6 - 3, // Random horizontal speed between -3 and 3
		//     speedY: Math.random() * 6 - 3, // Random vertical speed between -3 and 3
		//     life: Math.random() * 50 + 50 // Random lifetime between 50 and 100 frames
		// };
		// particles.push(particle);

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
	// 	privateCheckAuth()
	// }, [])

	const draw = () => {
		const ctx = canvasContextRef.current
		const canvas = canvasRef.current;
		const gameCustom = gameCustomizeRef.current
		if (ctx && canvas && player1.current && player2.current && ball.current) {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.fillStyle = gameCustom[2]
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			edges.current.draw(ctx)
			// net.current.draw(ctx)
			player1.current.draw(ctx)
			player2.current.draw(ctx)

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
		if (player1.current && player2.current && ball.current) {
			if (playerNo === 1) {
				player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, gameCustomize[0], player1.current.score)
				player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, '#B38EF0', player2.current.score)
			} else if (playerNo === 2) {
				player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, '#B38EF0', player1.current.score)
				player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, gameCustomize[0], player2.current.score)
			} else {
				player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, gameCustomize[0], player1.current.score)
				player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, gameCustomize[0], player2.current.score)
			}
			ball.current.changeProperties(ball.current.x, ball.current.y, ball.current.radius, gameCustomize[1])
		}
	}, [gameCustomize])

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			const user = userRef.current
			const socket = socketRef.current
			if (socket && socket.readyState === WebSocket.OPEN && user) {
				socket.send(JSON.stringify({
					type: 'userExitedTournamentGame',
					message: {
						user: user,
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
				if (socket && socket.readyState === WebSocket.OPEN && user) {
					socket.send(JSON.stringify({
						type: 'userExitedTournamentGame',
					message: {
						user: user,
					}
					}))
				}
			} else
				isOut = true
		}
	}, [])



	useEffect(() => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN && user) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'youWinTheGame'){
					////console.log("tournament_id : ", message)
					if (message.round_reached !== 'WINNER')
						navigate("../game/tournamentbracket")
					else{
						navigate("../game/tournamentcel", { state: { tournament_id: message.tournament_id } });
					}
				}
			}
		}
	}, [notifSocket, user])

	useEffect(() => {
		const check_player_situation = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/player-situation`, {
				method: "POST",
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				if (data.Case === 'joining a tournament but not in a room')
					navigate("../game/createtournament")
				if (data.Case === 'not joining a tournament')
					navigate("../game")
			} else {
				navigate("/signin")
			}
		}
		if (user)
			check_player_situation()
	},[user])


	useEffect(() => {
		canvasContextRef.current = canvasContext;
		canvasDimensionsRef.current = canvasDimensions;
		gameCustomizeRef.current = gameCustomize
		gameFinishedRef.current = gameFinished
		canvasDimsRef.current = canvasDims
	}, [canvasContext, canvasDimensions, gameCustomize, gameFinished, canvasDims]);

	function resizeCanvas() {
		const canvas = canvasRef.current;
		const wrapper = wrapperRef.current;
		const result = resultRef.current;
		if (canvas && wrapper && result) {
			let { width: wrapperWidth, height: wrapperHeight } = wrapper.getBoundingClientRect();
			let { width: resWrapperWidth, height: resWrapperHeight } = result.getBoundingClientRect();

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
			setCanvasDimensions(canvas.getBoundingClientRect())
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
				player2.current.changeProperties((685 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
			} else if (playerNo === 2) {
				player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0');
				player2.current.changeProperties((685 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
			} else {
				player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
				player2.current.changeProperties((685 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
			}
			ball.current.changeProperties((originalPositions.ball_x * widthScalingFactor), (originalPositions.ball_y * heightScalingFactor), (7 * scalingFactor), gameCustom[1]);
			edges.current.changeProperties((10 * scalingFactor), 'white');
		}
		// net.current.changeProperties((354 * widthScalingFactor), 0, (2 * scalingFactor), 10, 'white');
	}

	useEffect(() => {
		if (canvasRef && !canvasDrawing && gameCustomize.length && socket) {
			////console.log("testing : ", canvasRef, canvasDrawing)
			const canvas = canvasRef.current;
			const context = canvas.getContext('2d')
			player1.current = new Player(15, 165, 10, 70, gameCustomize[0], 0)
			player2.current = new Player(685, 165, 10, 70, gameCustomize[0], 0)
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
			////console.log("DRAWING THE SHAPES")
			setCanvasDrawing(true)
		}
	}, [canvasRef, canvasDrawing, socket]);

	const update = () => {
		if (!isGameStarted)
			return;
		const canvas = canvasRef.current;
		if (playerNo) {
			if (canvas) {
				const heightScalingFactor = canvas.height / 400;
				if (keys['ArrowUp']) {
					if (!((playerNo === 1 && (player1.current.y - (8 * heightScalingFactor)) < edges.current.height)
						|| (playerNo === 2 && (player2.current.y - (8 * heightScalingFactor)) < edges.current.height))) {
						if (socket && socket.readyState === WebSocket.OPEN) {
							playerNo === 1 ? player1.current.y -= (8 * heightScalingFactor) : player2.current.y -= (8 * heightScalingFactor);
							playerNo === 1 ? originalPositions.player1_y -= 8 : originalPositions.player2_y -= 8  ////
							socket.send(JSON.stringify({
								type: 'moveKeyTournamentGame',
								message: {
									user: user,
									playerNo: playerNo,
									direction: 'up'
								}
							}))
						}
					}
				}
				else if (keys['ArrowDown']) {
					if (!((playerNo === 1 && (((player1.current.y + player1.current.height) + (8 * heightScalingFactor)) > (canvas.height - edges.current.height)))
						|| (playerNo === 2 && (((player2.current.y + player2.current.height) + (8 * heightScalingFactor)) > (canvas.height - edges.current.height))))) {
						if (socket && socket.readyState === WebSocket.OPEN) {
							playerNo === 1 ? player1.current.y += (8 * heightScalingFactor) : player2.current.y += (8 * heightScalingFactor);
							playerNo === 1 ? originalPositions.player1_y += 8 : originalPositions.player2_y += 8 ////
							socket.send(JSON.stringify({
								type: 'moveKeyTournamentGame',
								message: {
									user: user,
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
	}

	const handleKeyDown = (e) => {
		keys[e.code] = true;
	}

	const handleKeyUp = (e) => {
		keys[e.code] = false;
	}

	const handleMouseMove = (e) => {
		// console.log(player1.current.height)
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect()
		// const heightScalingFactor = 400 / canvas.height;
		// const distance = (e.clientY - rect.top) * heightScalingFactor
		// console.log(canvas.height / 400, distance)
		if (!isGameStarted)
			return;
		// const rect = canvasDimensionsRef.current
		// if (rect && canvas) {
			if (playerNo === 1) {
				if (player1.current) {
					player1.current.y = e.clientY - rect.top - (player1.current.height / 2)
					originalPositions.player1_y = e.clientY - rect.top - 35;
					if (player1.current.y < edges.current.height) {
						player1.current.y = edges.current.height;
						originalPositions.player1_y = 10;
					} else if (player1.current.y + player1.current.height > (canvas.height - edges.current.height)) {
						player1.current.y = ((canvas.height - edges.current.height) - player1.current.height)
						originalPositions.player1_y = 320
					}
					// console.log((e.clientY - rect.top),rect.bottom, player1.current.y + player1.current.height)
				}
			}
			else if (playerNo === 2) {
				if (player2.current) {
					player2.current.y = e.clientY - rect.top - (player2.current.height / 2)
					originalPositions.player2_y = e.clientY - rect.top - 35;
					if (player2.current.y < edges.current.height) {
						player2.current.y = edges.current.height
						originalPositions.player2_y = 10;
					} else if (player2.current.y + player2.current.height > (canvas.height - edges.current.height)) {
						player2.current.y = ((canvas.height - edges.current.height) - player2.current.height)
						originalPositions.player2_y = 320
					}
					// console.log((e.clientY - rect.top),rect.bottom, player2.current.y + player2.current.height)
				}
			}
			const heightScalingFactor = 400 / canvas.height;
			const distance = (e.clientY - rect.top) * heightScalingFactor
			socket.send(JSON.stringify({
				type: 'moveMouseTournamentGame',
				message: {
					user: user,
					playerNo: playerNo,
					distance: distance
				}
			}))
		// }
	}

	const gamefinishedAborted = (message) => {
		setUserName1(message.user1)
		setUserName2(message.user2)
		setScore1(message.playerScore1)
		setScore2(message.playerScore2)
		isGameStarted = false
		particles = []
		const canvas = canvasRef.current;
		const gameCustom = gameCustomizeRef.current
		if (canvas && gameCustom) {
			const widthScalingFactor = canvas.width / 710;
			const heightScalingFactor = canvas.height / 400;
			const scalingFactor = Math.min(widthScalingFactor, heightScalingFactor);
			player1.current.changeProperties((15 * widthScalingFactor), (165 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
			player2.current.changeProperties((685 * widthScalingFactor), (165 * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0]);
			ball.current.changeProperties((355 * widthScalingFactor), (200 * heightScalingFactor), (7 * scalingFactor), gameCustom[1]);
		}
		draw()
	}

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === "setupGame") {
					playerNo = message.playerNo
					////console.log("INSIDE SETUPGAME")
					isGameStarted = true
					setUserName1(message.user1)
					setUserName2(message.user2)
					setTime(message.time)
					startTimer()
				} else if (type === "updateGame") {
					const canvas = canvasRef.current;
					if (canvas) {
						const widthScalingFactor = canvas.width / 710;
						const heightScalingFactor = canvas.height / 400;
						player1.current.y = message.playerY1 * heightScalingFactor;
						player2.current.y = message.playerY2 * heightScalingFactor;
						player1.current.score = message.playerScore1;
						player2.current.score = message.playerScore2;
						ball.current.x = message.ballX * widthScalingFactor;
						ball.current.y = message.ballY * heightScalingFactor;

						originalPositions.player1_y = message.playerY1
						originalPositions.player2_y = message.playerY2
						originalPositions.ball_x = message.ballX
						originalPositions.ball_y = message.ballY
						update()
						resizeCanvas()
						draw()
					}
				} else if (type === "finishedGame") {
					let allPlayersStats = [...playersInfos]
					setUserName1(message.user1)
					setUserName2(message.user2)
					setScore1(message.playerScore1)
					setScore2(message.playerScore2)
					setGameFinished(true)
					gamefinishedAborted(message)
					setTime(message.time)
					allPlayersStats[0].totalScore = message.score[0]
					allPlayersStats[1].totalScore = message.score[1]
					allPlayersStats[0].score = message.selfScore[0]
					allPlayersStats[1].score = message.selfScore[1]
					allPlayersStats[0].hit = message.hit[0]
					allPlayersStats[1].hit = message.hit[1]
					allPlayersStats[0].accuracy = message.accuracy[0]
					allPlayersStats[1].accuracy = message.accuracy[1]
					allPlayersStats[0].rating = message.rating[0]
					allPlayersStats[1].rating = message.rating[1]
					allPlayersStats[2].time = message.time
					setPlayersInfos(allPlayersStats)
					////console.log("playerNo when it is finished : ", playerNo)
				} else if (type === "playersInfos")
					setPlayersPics(message.users)
				else if (type === 'hmed') {
					socket.close()
				} else if (type === 'youWinTheGame'){
					////console.log("tournament_id : ", message)
					if (message.round_reached !== 'WINNER')
						navigate("../game/tournamentbracket")
					else{
						navigate("../game/tournamentcelebration", { state: message.tournament_id })
					}
				}
				 else if (type === 'youLoseTheGame'){
					navigate("../game")
				}
					
			}
		}
	}, [socket, user])


	useEffect(() => {
		if (canvasDrawing && user) {
			if (socket && socket.readyState === WebSocket.OPEN && user) {
				////console.log("CHECKING IF PLAYER IN ROOM")
				socket.send(JSON.stringify({
					type: 'isPlayerInRoomTournamentGame',
					message: {
						user: user
					}
				}))
			}
		}
	}, [canvasDrawing, socket, user])

	const exitTheGame = () => {
		if (user) {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({
					type: 'userExitedTournamentGame',
					message: {
						user: user,
					}
				}))
				navigate('../game')
			} else {
				////console.log("socket is closed, refresh the page")
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

	useEffect(() => { // TODO: CHECK THIS OUT LATER
		userRef.current = user;
		socketRef.current = socket;
	}, [user, socket]);

	return (
		<div className='onevsone-pm' ref={wrapperRef} >
			<div ref={resultRef} className='onevsone-pm-infos' >
				<div>
					{playersPics.length ? (<img src={playersPics[0].avatar} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
					<div style={{textAlign:"center"}} ><p>{userName1}</p></div>
				</div>
				<div>
					<p>{score1}</p>
					<div className='onevsone-pm-infos-stats' >
						<div>
							<p>Goal: 5</p>
							<div onClick={exitTheGame} >
								<img src={Icons.logout} alt="" />
								<p>Exit</p>
							</div>
						</div>
						<div>{formatTime(time)}</div>
					</div>
					<p>{score2}</p>
				</div>
				<div>
					<div style={{textAlign:"center"}}><p>{userName2}</p></div>
					{playersPics.length ? (<img src={playersPics[1].avatar} alt="" style={{height: '100%'}} />) : (<img src={Icons.solidGrey} alt="" style={{height: '100%'}} />)}
				</div>
			</div>
			<canvas ref={canvasRef} ></canvas>
		</div>
	);
};

export default OneVsOnePlayTournamentMatch;