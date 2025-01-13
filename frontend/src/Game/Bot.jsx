import React, { useRef, useEffect, useContext, useState } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css';

import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import { Icon } from '@mui/material';

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
  constructor(x, y, radius, color, velocityX, velocityY, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.speed = speed;
  }

  changeProperties(newX, newY, newRadius, newColor, newVelocityX, newVelocityY, newSpeed) {
    this.x = newX
    this.y = newY
    this.radius = newRadius
    this.color = newColor
    this.velocityX = newVelocityX
    this.velocityY = newVelocityY
    this.speed = newSpeed
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

const Bot = () => {
  let { privateCheckAuth, gameCustomize, user, userImg } = useContext(AuthContext)
  const [canvasDrawing, setCanvasDrawing] = useState(false)
  const [gameAborted, setGameAborted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [userName1, setUserName1] = useState(null)
  const [userName2, setUserName2] = useState(null)
  const navigate = useNavigate()
  let canvasRef = useRef(null);
  let isOut = false

  let isGameStarted = false
  let isGameFinished = false
  let playerNo = 0

  let player1 = useRef(null)
  let player2 = useRef(null)
  let ball = useRef(null)
  let edges = useRef(null)

  // let player1 = {}
  // let player2 = {}
  // let ball = {}
  // let edges = {}

  let [score1, setScore1] = useState(0)
  let [score2, setScore2] = useState(0)
  let audio;
  let keys = {
    ArrowDown: false,
    ArrowUp: false,
    MouseMove: false,
    Event: null,
  }

  const [canvasContext, setCanvasContext] = useState(null);
  const canvasContextRef = useRef(canvasContext);
  // const [canvasDimensions, setCanvasDimensions] = useState(null);
  // const canvasDimensionsRef = useRef(canvasDimensions);
  const gameCustomizeRef = useRef(gameCustomize);
  // const gameFinishedRef = useRef(gameFinished);
  const gameAbortedRef = useRef(gameAborted);
  const wrapperRef = useRef(null);
  const resultRef = useRef(null);
  const aspectRatio = 710 / 400

  // const [canvasDims, setCanvasDims] = useState(null);
  // const canvasDimsRef = useRef(canvasDims);

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
  let firstDraw = false

  let particles = [];

  const [difficulty, setDifficulty] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useState(0)
  const [startGame, setStartGame] = useState(false)
  const startGameRef = useRef(startGame)

  const gameState = useRef(null)

  const [difficultyMode, setDifficultyMode] = useState(0)

  let ballComingTowardsAI = false;
  let difficultyLevelVar = 0
  let goalScored = 0

  const [pageSetted, setSettedPage] = useState(false)

  const [playersInfos, setPlayersInfos] = useState([
    {
      totalScore: 0,
      tmpScore: 0,
      score: 0,
      hit: 0,
      accuracy: 0,
      rating: 0,
    },
    {
      totalScore: 0,
      tmpScore: 0,
      score: 0,
      hit: 0,
      accuracy: 0,
      rating: 0
    },
    {
      time: 0,
      difficultyLevel: 0
    }
  ])

  const difficultyLevelRef = useRef(difficultyLevel)
  const playersInfosRef = useRef(playersInfos)
  const timeRef = useRef(time)
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
      radius: Math.random() + 0.2,
      color: `hsl(${Math.random() * 40 + 20}, 100%, 50%)`,
      speedX: Math.random() - 0.8,
      speedY: Math.random() - 0.8,
      life: Math.random() * 50 + 40
    };
    particles.push(particle);
  }

  // useEffect(() => {
  //   privateCheckAuth()
  // }, [])

  const draw = () => {
    const ctx = canvasContextRef.current
    const canvas = canvasRef.current;
    const gameCustom = gameCustomizeRef.current
    //console.log("starting drawing", `ctx : ${ctx}`, `canvas : ${canvas}`, 'others : ', player1.current, player2.current, ball.current)
    if (ctx && canvas && player1.current && player2.current && ball.current && edges.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = gameCustom[2]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      edges.current.draw(ctx)
      player1.current.draw(ctx)
      player2.current.draw(ctx)
      if (isGameStarted && gameCustom[3]) {
        particles.forEach((particle, index) => {
          particle.life--;
          if (particle.life <= 0) {
            particles.splice(index, 1);
            return;
          }
          particle.x += particle.speedX;
          particle.y += particle.speedY;
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
      player1.current.changeProperties(player1.current.x, player1.current.y, player1.current.width, player1.current.height, gameCustomize[0], player1.current.score)
      player2.current.changeProperties(player2.current.x, player2.current.y, player2.current.width, player2.current.height, '#B38EF0', player2.current.score)
      ball.current.changeProperties(ball.current.x, ball.current.y, ball.current.radius, gameCustomize[1])
    }
  }, [gameCustomize])

  useEffect(() => {
    //console.log("gggg", canvasContext)
    canvasContextRef.current = canvasContext
    gameCustomizeRef.current = gameCustomize
    startGameRef.current = startGame
    
    // gameFinishedRef.current = gameFinished
    // if ()
    resizeCanvas()
    // canvasDimensionsRef.current = canvasDimensions;
    //     gameAbortedRef.current = gameAborted
    //     canvasDimsRef.current = canvasDims
  }, [canvasContext, gameCustomize, startGame]);

  useEffect(() => {
    playersInfosRef.current = playersInfos
    difficultyLevelRef.current = difficultyLevel
    timeRef.current = time
  }, [playersInfosRef, difficultyLevelRef, time])

  function resizeCanvas() {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    const result = resultRef.current
    const state = gameState.current
    if (canvas && wrapper && result) {
      let { width: wrapperWidth, height: wrapperHeight } = wrapper.getBoundingClientRect()
      let { width: resWrapperWidth, height: resWrapperHeight } = result.getBoundingClientRect()

      wrapperHeight -= resWrapperHeight
      if (wrapperWidth / aspectRatio < wrapperHeight) {
        canvas.width = wrapperWidth
        canvas.height = (wrapperWidth / aspectRatio)
        result.style.width = wrapperWidth + 'px'
        if (state) {
          state.style.width = wrapperWidth + 'px'
          state.style.height = (wrapperWidth / aspectRatio) + 'px'
        }
      } else {
        canvas.height = wrapperHeight
        canvas.width = (wrapperHeight * aspectRatio)
        result.style.width = (wrapperHeight * aspectRatio) + 'px';
        if (state) {
          state.style.width = (wrapperHeight * aspectRatio) + 'px'
          state.style.height = wrapperHeight + 'px'
        }
      }
      // setCanvasDimensions(canvas.getBoundingClientRect())
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

    if (gameCustom && player1.current && player2.current && ball.current && edges.current) {
      player1.current.changeProperties((15 * widthScalingFactor), (originalPositions.player1_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), gameCustom[0], player1.current.score);
      player2.current.changeProperties((685 * widthScalingFactor), (originalPositions.player2_y * heightScalingFactor), (10 * widthScalingFactor), (70 * heightScalingFactor), '#B38EF0', player2.current.score);
      ball.current.changeProperties((originalPositions.ball_x * widthScalingFactor), (originalPositions.ball_y * heightScalingFactor), (7 * scalingFactor), gameCustom[1], ball.current.velocityX, ball.current.velocityY, ball.current.speed);
      edges.current.changeProperties((10 * scalingFactor), 'white');
      //console.log("inside the update game properties : ", ball.current.x, ball.current.y)
    }
  }

  function resetBall() {
    const canvas = canvasRef.current
    ball.current.x = canvas.width / 2
    ball.current.y = canvas.height / 2
    originalPositions.ball_x = 355
    originalPositions.ball_y = 200
    ball.current.velocityX = 5
    ball.current.velocityY = 5
    ball.current.speed = 5
  }

  function collision(b, p) {
    const playerTop = p[0].playerY
    const playerBottom = p[0].playerY + 70
    const playerLeft = p[0].playerX
    const playerRight = p[0].playerX + 10

    const ballTop = b.ballY - 7
    const ballBottom = b.ballY + 7
    const ballLeft = b.ballX - 7
    const ballRight = b.ballX + 7

    let check = (playerLeft < ballRight && playerTop < ballBottom && playerRight > ballLeft && playerBottom > ballTop)
    if (check) {
      let allPlayersInfos = [...playersInfos]
      allPlayersInfos[0].tmpScore = 0
      allPlayersInfos[1].tmpScore = 0
      allPlayersInfos[p[1]].hit += 1
      allPlayersInfos[p[1]].tmpScore = 1
      setPlayersInfos(allPlayersInfos)
      return 1
    }
    return 0
    // return playerLeft < ballRight && playerTop < ballBottom && playerRight > ballLeft && playerBottom > ballTop
  }

  // function predictBallY(ball, aiX, canvas) {
  function predictBallY(localBall, player2X) {
    // let predictedY = ball.y;
    let predictedY = localBall.ballY;
    // let velocityY = ball.velocityY;
    let velocityY = ball.current.velocityY;
    // let timeToReachAI = (aiX - ball.x) / ball.velocityX;
    let timeToReachAI = (player2X - localBall.ballX) / ball.current.velocityX;

    while (timeToReachAI > 0) {
      let timeToWall;

      if (velocityY > 0)
        timeToWall = (400 - 7 - predictedY) / velocityY;
      else
        timeToWall = (7 - predictedY) / velocityY;

      if (timeToWall < timeToReachAI) {
        predictedY += velocityY * timeToWall;
        velocityY = -velocityY; // Ball bounces off the wall
        timeToReachAI -= timeToWall;
      } else {
        predictedY += velocityY * timeToReachAI;
        timeToReachAI = 0;
      }
    }

    return predictedY;
  }

  const update = () => {
    const canvas = canvasRef.current
    // console.log(ball.current.x, ball.current.y)
    // if (goalScored)
    //   goalScored--
    if (canvas && player1.current && player2.current && ball.current) {
      //console.log("inside", ball.current.x, ball.current.y)
      const originalHeight = 400 / canvas.height
      const originalWidth = 710 / canvas.width

      const heightScalingFactor = canvas.height / 400
      const widthScalingFactor = canvas.width / 710

      // console.log(keys)
      if (keys['ArrowUp']) {
        if (!((player1.current.y - (8 * heightScalingFactor)) <= edges.current.height)) {
          player1.current.y -= (8 * heightScalingFactor);
          originalPositions.player1_y -= 8
        } else {
          player1.current.y = edges.current.height
          originalPositions.player1_y = 10
        }
      } else if (keys['ArrowDown']) {
        if (!(((player1.current.y + player1.current.height) + (8 * heightScalingFactor)) >= (canvas.height - edges.current.height))) {
          player1.current.y += (8 * heightScalingFactor)
          originalPositions.player1_y += 8
        } else {
          player1.current.y = ((canvas.height - edges.current.height) - player1.current.height)
          originalPositions.player1_y = 320
        }
      }

      const localBall = {
        ballX: ball.current.x * originalWidth,
        ballY: ball.current.y * originalHeight
      }

      const localPlayer1 = {
        playerX: player1.current.x * originalWidth,
        playerY: player1.current.y * originalHeight
      }

      const localPlayer2 = {
        playerX: player2.current.x * originalWidth,
        playerY: player2.current.y * originalHeight
      }

      localBall.ballX += ball.current.velocityX
      localBall.ballY += ball.current.velocityY

      if (localBall.ballY + 7 > 390 || localBall.ballY - 7 < 10) {
        ball.current.velocityY = -ball.current.velocityY;
        // wall.play(); // sound
      }

      if (localBall.ballY - 7 < 10)
        localBall.ballY += 5
      if (localBall.ballY + 7 > 390)
        localBall.ballY -= 5

      let localPlayer = (localBall.ballX < 355) ? [localPlayer1, 0] : [localPlayer2, 1];

      if (collision(localBall, localPlayer)) {
        // hit.play(); // sound
        let collidePoint = localBall.ballY - (localPlayer[0].playerY + 35)
        collidePoint = collidePoint / 35
        let angleRad = collidePoint * Math.PI / 4
        let direction = (localBall.ballX < 355) ? 1 : -1;
        ball.current.velocityX = direction * ball.current.speed * Math.cos(angleRad);
        ball.current.velocityY = ball.current.speed * Math.sin(angleRad);
        if (ball.current.speed < 15) {
          ball.current.speed += 0.5
        } else if (ball.current.speed < 16)
          ball.current.speed += 0.001
        if (localPlayer === localPlayer2)
          ballComingTowardsAI = false;
      }

      // player1.current.x = localPlayer1.playerX * widthScalingFactor
      // player1.current.y = localPlayer1.playerY * heightScalingFactor
      // player2.current.x = localPlayer2.playerX * widthScalingFactor
      // player2.current.y = localPlayer2.playerY * heightScalingFactor
      ball.current.x = localBall.ballX * widthScalingFactor
      ball.current.y = localBall.ballY * heightScalingFactor
      originalPositions.ball_x = localBall.ballX
      originalPositions.ball_y = localBall.ballY

      // console.log(localBall.ballX * widthScalingFactor, localBall.ballX * widthScalingFactor)

      if (localBall.ballX - 7 < 0) {
        player2.current.score++
        let allPlayersInfos = [...playersInfos]
        allPlayersInfos[1].totalScore += 1
        allPlayersInfos[1].score += allPlayersInfos[1].tmpScore
        setPlayersInfos(allPlayersInfos)
        // setScore2(prevScore2 => prevScore2 + 1)
        // comScore.play() // sound
        resetBall()
        ballComingTowardsAI = false
        // goalScored = 10
        difficultyLevelVar = difficultyLevel //
        if (player2.current.score === 3) {
          isGameFinished = true
          const allPlayersInfos = [...playersInfosRef.current]
          allPlayersInfos[0].accuracy = (allPlayersInfos[0].score * allPlayersInfos[0].hit) / 100
          allPlayersInfos[1].accuracy = (allPlayersInfos[1].score * allPlayersInfos[1].hit) / 100
          setPlayersInfos(allPlayersInfos)
        }
      } else if (localBall.ballX + 7 > 710) {
        player1.current.score++
        let allPlayersInfos = [...playersInfos]
        allPlayersInfos[0].totalScore += 1
        allPlayersInfos[0].score += allPlayersInfos[0].tmpScore
        setPlayersInfos(allPlayersInfos)
        // setScore1(prevScore1 => prevScore1 + 1)
        // userScore.play() // sound
        resetBall()
        ballComingTowardsAI = true
        // goalScored = 10
        difficultyLevelVar = difficultyLevel //
        if (player1.current.score === 3) {
          isGameFinished = true
          const allPlayersInfos = [...playersInfosRef.current]
          allPlayersInfos[0].accuracy = (allPlayersInfos[0].score * allPlayersInfos[0].hit) / 100
          allPlayersInfos[1].accuracy = (allPlayersInfos[1].score * allPlayersInfos[1].hit) / 100
          setPlayersInfos(allPlayersInfos)          
        }
      }

      localBall.ballX = ball.current.x * originalWidth
      localBall.ballY = ball.current.y * originalHeight

      if (localBall.ballX > 355) {
        if (ball.current.velocityX > 0)
          ballComingTowardsAI = true;
        else
          ballComingTowardsAI = false;

        if (ballComingTowardsAI) {
          const predictedY = predictBallY(localBall, localPlayer2.playerX);
          const tolerance = 5; // Adjust this value as needed for smoothness
          if (Math.abs(localPlayer2.playerY + 35 - predictedY) > tolerance) {
            if (predictedY < localPlayer2.playerY + 70 / 2) {
              localPlayer2.playerY -= difficultyLevelVar * ball.current.speed; // Move up, adjust speed based on ball speed
            } else if (predictedY > localPlayer2.playerY + 70 / 2) {
              localPlayer2.playerY += difficultyLevelVar * ball.current.speed; // Move down, adjust speed based on ball speed
            }
          }

          // localPlayer2.playerY = Math.max(Math.min(localPlayer2.playerY, 400 - 70), 0); // Prevent AI from moving out of canvas
          if (localPlayer2.playerY < 10)
            localPlayer2.playerY = 10
          else if (localPlayer2.playerY + 70 > 390)
            localPlayer2.playerY = 320
          player2.current.y = localPlayer2.playerY * heightScalingFactor
          originalPositions.player2_y = localPlayer2.playerY
        }
      }
    }
  }

  let gameAlreadyCheck = false

  useEffect(() => {
    if (gameAlreadyCheck) {
      let botGameStatusJson = localStorage.getItem('botGameStatus')
      let botGameStatus = JSON.parse(botGameStatusJson)
      if (botGameStatus) {
        localStorage.removeItem('botGameStatus')
        setDifficultyLevel(botGameStatus[2].difficultyLevel)
        setTime(botGameStatus[2].time)
        setPlayersInfos(botGameStatus)
      }
      else
        console.log('not a single running game')
    } else
      gameAlreadyCheck = true
  }, [])

  const gameLoop = () => {
    update();
    draw();
  };

  const runGame = () => {
    setTimeout(() => {
      startTimer()
      let loop = setInterval(() => {
        if (isGameFinished) {
          setGameFinished(true)
          setStartGame(false)
          isGameStarted = false
          difficultyLevelVar = 0
          ballComingTowardsAI = false
          originalPositions.ball_x = 355
          originalPositions.ball_y = 200
          originalPositions.player1_x = 15
          originalPositions.player1_y = 165
          originalPositions.player2_x = 685
          originalPositions.player2_y = 165
          //console.log("players infos : ", playersInfos, difficultyLevel)
          clearInterval(loop)
        } else
          gameLoop()
      }, 1000 / 50);
    }, 2000);
  }

  useEffect(() => {
    if (difficultyLevel && canvasRef && !firstDraw) { ////////  && gameCustomize.length
      firstDraw = true
      // setCanvasDrawing(true)
      const canvas = canvasRef.current
      const allPlayersInfos = playersInfosRef.current
      const context = canvas.getContext('2d')
      player1.current = new Player(15, 165, 10, 70, gameCustomize[0], allPlayersInfos[0].score)
      player2.current = new Player(685, 165, 10, 70, gameCustomize[0], allPlayersInfos[1].score)
      ball.current = new Ball(355, 200, 7, gameCustomize[1], 5, 5, 5)
      edges.current = new Edges(10, 'white')
      resizeCanvas()
      // const rectDim = canvas.getBoundingClientRect()
      //console.log("context : ", context)
      setCanvasContext(context);
      // setCanvasDimensions(rectDim)
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      canvas.addEventListener("mousemove", handleMouseMove)
      window.addEventListener('resize', resizeCanvas)
      isGameStarted = true
      difficultyLevelVar = difficultyLevel //
      setStartGame(true)
      runGame() //////
      // setTimeout(() => {
      //   startTimer()
      //   let loop = setInterval(() => {
      //     if (isGameFinished) {
      //       // setDifficultyLevel(0)
      //       setGameFinished(true)
      //       isGameStarted = false
      //       firstDraw = false
      //       difficultyLevelVar = 0
      //       ballComingTowardsAI = false
      //       clearInterval(loop)
      //       // return
      //     } else
      //       gameLoop()
      //   },1000/50);
      // }, 5000);
    }
  }, [canvasRef, difficultyLevel])

  // const update = () => {
  //   if (!isGameStarted)
  //     return;
  //   const canvas = canvasRef.current;
  //   if (playerNo) {
  //     if (canvas) {
  //       const heightScalingFactor = canvas.height / 400;
  //       if (keys['ArrowUp']) {
  //         if (!((playerNo === 1 && (player1.current.y - (8 * heightScalingFactor)) < edges.current.height)
  //           || (playerNo === 2 && (player2.current.y - (8 * heightScalingFactor)) < edges.current.height))) {
  //           if (socket && socket.readyState === WebSocket.OPEN) {
  //             playerNo === 1 ? player1.current.y -= (8 * heightScalingFactor) : player2.current.y -= (8 * heightScalingFactor);
  //             playerNo === 1 ? originalPositions.player1_y -= 8 : originalPositions.player2_y -= 8  ////
  //             socket.send(JSON.stringify({
  //               type: 'moveKey',
  //               message: {
  //                 roomID: roomID,
  //                 playerNo: playerNo,
  //                 direction: 'up'
  //               }
  //             }))
  //           }
  //         }
  //       }
  //       else if (keys['ArrowDown']) {
  //         if (!((playerNo === 1 && (((player1.current.y + player1.current.height) + (8 * heightScalingFactor)) > (canvas.height - edges.current.height)))
  //           || (playerNo === 2 && (((player2.current.y + player2.current.height) + (8 * heightScalingFactor)) > (canvas.height - edges.current.height))))) {
  //           if (socket && socket.readyState === WebSocket.OPEN) {
  //             playerNo === 1 ? player1.current.y += (8 * heightScalingFactor) : player2.current.y += (8 * heightScalingFactor);
  //             playerNo === 1 ? originalPositions.player1_y += 8 : originalPositions.player2_y += 8 ////
  //             socket.send(JSON.stringify({
  //               type: 'moveKey',
  //               message: {
  //                 roomID: roomID,
  //                 playerNo: playerNo,
  //                 direction: 'down'
  //               }
  //             }))
  //           }
  //         }
  //       }
  //     }
  //   }
  //   setScore1(player1.current.score)
  //   setScore2(player2.current.score)
  // }

  const handleKeyDown = (e) => {
    const gameStarted = startGameRef.current
    if (gameStarted && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
      // console.log(e.code)
      keys[e.code] = true;
    }
  }

  const handleKeyUp = (e) => {
    const gameStarted = startGameRef.current
    if (gameStarted && (e.code === 'ArrowUp' || e.code === 'ArrowDown'))
      keys[e.code] = false;
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect()
    const gameStarted = startGameRef.current
    if (!gameStarted)
      return
    if (player1.current) {
      player1.current.y = e.clientY - rect.top - (player1.current.height / 2)
      originalPositions.player1_y = ((e.clientY - rect.top) * (400 / canvas.height)) - 35
      if (player1.current.y < edges.current.height) {
        player1.current.y = edges.current.height
        originalPositions.player1_y = 10
      } else if (player1.current.y + player1.current.height > (canvas.height - edges.current.height)) {
        player1.current.y = ((canvas.height - edges.current.height) - player1.current.height)
        originalPositions.player1_y = 320
      }
    }
  }

  const easySelected = () => {
    setDifficultyMode(0.3)
  }

  const normalSelected = () => {
    setDifficultyMode(0.6)
  }

  const hardSelected = () => {
    setDifficultyMode(0.7)
  }



  const exitTheGame = () => {
    setStartGame(false)
    startGameRef.current = false
    navigate('../game/solo/1vs1')
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
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60

    if (minutes >= 60)
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const startedGame = startGameRef.current
      const allPlayersInfos = playersInfosRef.current
      const difficultyLvl = difficultyLevelRef.current
      const timeCount = timeRef.current
      if (startedGame) {
        let allPlayersStats = [...allPlayersInfos]
        allPlayersInfos[2].time = timeCount
        allPlayersInfos[2].difficultyLevel = difficultyLvl
        localStorage.setItem('botGameStatus', JSON.stringify(allPlayersStats))
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', JSON.stringify(handleBeforeUnload))
    }
  }, [])

  useEffect(() => {
    return () => {
      if (isOut) {
        const startedGame = startGameRef.current
        const allPlayersInfos = playersInfosRef.current
        const difficultyLvl = difficultyLevelRef.current
        const timeCount = timeRef.current
        if (startedGame) {
          let allPlayersStats = [...allPlayersInfos]
          allPlayersInfos[2].time = timeCount
          allPlayersInfos[2].difficultyLevel = difficultyLvl
          localStorage.setItem('botGameStatus', allPlayersStats)
        }
      } else
        isOut = true
    }
  }, [])

  const saveDifficultyLevel = () => {
    if (difficultyMode)
      setDifficultyLevel(difficultyMode)
  }

  const restartGame = () => {
    setGameFinished(false)
    firstDraw = false
    setDifficultyLevel(0)
    setPlayersInfos([
      {
        totalScore: 0,
        tmpScore: 0,
        score: 0,
        hit: 0,
        accuracy: 0,
        rating: 0,
      },
      {
        totalScore: 0,
        tmpScore: 0,
        score: 0,
        hit: 0,
        accuracy: 0,
        rating: 0
      },
      {
        time: 0,
        difficultyLevel: 0
      }
    ])
    setTime(0)
    // setScore1(0)
    // setScore2(0)
    // originalPositions.player1_x = 15
    // originalPositions.player1_y = 165
    // originalPositions.player2_x = 685
    // originalPositions.player2_y = 165
    // originalPositions.ball_x = 355
    // originalPositions.ball_y = 200
  }

  const exitBotGame = () => {
    navigate('../game/solo')
  }

  return (
    <>
      {gameFinished && (
        <div className='onevsone' style={{position: 'relative'}} >
          <div className='match-ended' ></div>
          {(playersInfos[0].totalScore > playersInfos[1].totalScore) && (<div className='winner_cup' >
            <img src={Icons.winnerCup} alt="winner cup" />
          </div>)}
          {(playersInfos[0].totalScore === 3) ? (<p className='winner_congrats' >WINNER WINNER CHICKEN DINNER!</p>) : (<p className='loser_support' >BETTER LUCK NEXT TIME!</p>)}
          <div className='gameStats_container' >
            <div className='gameStats_playerInfos' >
              <div className='gameStats_playerInfos-details' >
                <div>
                  <img src={userImg} alt="user image" />
                  <p>{user}</p>
                </div>
                <div>
                  <p>Bot</p>
                  <img src={Icons.AiBot} alt="user image" />
                </div>
              </div>
            </div>
            <div className='gameStats_details' >
              <div>
                <p>{playersInfos[0].totalScore}</p>
                <p>Score</p>
                <p>{playersInfos[1].totalScore}</p>
              </div>
            </div>
            <div className='gameStats_details' >
              <div>
                <p>{playersInfos[0].score}</p>
                <p>Goals</p>
                <p>{playersInfos[1].score}</p>
              </div>
            </div>
            <div className='gameStats_details' >
              <div>
                <p>{playersInfos[0].hit}</p>
                <p>Hit</p>
                <p>{playersInfos[1].hit}</p>
              </div>
            </div>
            <div className='gameStats_details' >
              <div>
                {(playersInfos[0].hit) ?
                  (<p>{Math.floor((playersInfos[0].score / playersInfos[0].hit ) * 100)}%</p>) :
                  (<p>0%</p>)
                }
                <p>Accuracy</p>
                {(playersInfos[1].hit) ?
                  (<p>{Math.floor((playersInfos[1].score / playersInfos[1].hit ) * 100)}%</p>) :
                  (<p>0%</p>)
                }
              </div>
            </div>
            <div className='gameStats_details' >
              <div>
                <p>{playersInfos[0].rating}</p>
                <p>Rating</p>
                <p>{playersInfos[1].rating}</p>
              </div>
            </div>
          </div>
          <div className='stats-selects' >
            <button onClick={exitBotGame} >Exit</button>
            <button onClick={restartGame} >Restart</button>
          </div>
        </div>)}
        {/* // {<div style={{fontWeight:"bolder", textAlign:"center", color:"white", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        //   <p>GAME FINISHED</p>
        //   <button onClick={restartGame} >restart</button>
        // </div>}
      // )} */}
      {(difficultyLevel && !gameFinished) && (
        <div className='onevsone-pm' ref={wrapperRef} >
          <div ref={resultRef} className='onevsone-pm-infos' >
            <div>
              {userImg ? (<img src={userImg} alt="" style={{ height: '100%' }} />) : (<img src={Icons.solidGrey} alt="" style={{ height: '100%' }} />)}
              <div style={{ textAlign: "center" }} ><p>{user}</p></div>
            </div>
            <div>
              <p>{playersInfos[0].totalScore}</p>
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
              <p>{playersInfos[1].totalScore}</p>
            </div>
            <div>
              <div style={{ textAlign: "center" }}><p>Bot</p></div>
              <img src={Icons.AiBot} alt="" style={{ height: '100%' }} />
            </div>
          </div>
          <canvas ref={canvasRef} ></canvas>
        </div>
      )}
      {(!difficultyLevel && !gameFinished) && (
        <div className='onevsone'>
          <h1 className='difficulty-title' >SELECT DIFFICULTY</h1>
          <div className='difficulty-container' >
            <div className={(difficultyMode === 0.3) ? 'novice_level difficulty_level_selected' : 'novice_level'} onClick={easySelected} >
              <img src={Icons.easyMode} alt="" />
              <div>
                <p>Novice</p>
                <p>Ideal for beginners. The AI offers a gentle challenge to help you learn the basics.</p>
              </div>
            </div>
            <div className={(difficultyMode === 0.6) ? 'skilled_level difficulty_level_selected' : 'skilled_level'} onClick={normalSelected} >
              <img src={Icons.normalMode} alt="" />
              <div>
                <p>Skilled</p>
                <p>For experienced players. The AI provides a balanced challenge to test your skills.</p>
              </div>
            </div>
            <div className={(difficultyMode === 0.7) ? 'master_level difficulty_level_selected' : 'master_level'} onClick={hardSelected} >
              <img src={Icons.hardMode} alt="" />
              <div>
                <p>Master</p>
                <p>For experts. The AI is fast and competitive, pushing you to your limits.</p>
              </div>
            </div>
          </div>
          <div className='difficulty-selects' >
            <button>Back</button>
            {difficultyMode ? (<button onClick={saveDifficultyLevel} >Save</button>) : (<button id='difficulty-selects-saving' >Save</button>)}
          </div>
        </div>
      )}
    </>
  );
}

export default Bot