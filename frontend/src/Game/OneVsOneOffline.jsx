import React, { useRef, useEffect, useContext, useState } from 'react';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css';
import OneVsOneStats from './OneVsOneStats';
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
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

const OneVsOneOffline = () => {
  let { gameCustomize } = useContext(AuthContext)

  const [gameAborted, setGameAborted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [canvasContext, setCanvasContext] = useState(null);
  const [time, setTime] = useState(0);
  const [alreadyStarted, setalreadyStarted] = useState(0)
  const [startGame, setStartGame] = useState(false)
  const [difficultyMode, setDifficultyMode] = useState(0)
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
      alreadyStarted: 0
    }
  ])

  const navigate = useNavigate()

  let canvasRef = useRef(null);
  let player1 = useRef(null)
  let player2 = useRef(null)
  let ball = useRef(null)
  let edges = useRef(null)
  const canvasContextRef = useRef(canvasContext);
  const gameCustomizeRef = useRef(gameCustomize);
  const wrapperRef = useRef(null);
  const resultRef = useRef(null);
  const alreadyStartedRef = useRef(alreadyStarted)
  const playersInfosRef = useRef(playersInfos)
  const timeRef = useRef(time)
  const startGameRef = useRef(startGame)
  const gameState = useRef(null)

  let isOut = false
  let isGameStarted = false
  let isGameFinished = false
  let keys = {
    player1: {
      KeyW: false,
      KeyS: false
    },
    player2: {
      ArrowUp: false,
      ArrowDown: false
    }
  }
  const aspectRatio = 710 / 400
  const originalPositions = {
    player1_x: 15,
    player1_y: 165,
    player2_x: 685,
    player2_y: 165,
    ball_x: 355,
    ball_y: 200
  }
  let timer;
  let firstDraw = false
  let particles = [];

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


  const draw = () => {
    const ctx = canvasContextRef.current
    const canvas = canvasRef.current;
    const gameCustom = gameCustomizeRef.current
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
    canvasContextRef.current = canvasContext
    gameCustomizeRef.current = gameCustomize
    startGameRef.current = startGame
    resizeCanvas()
  }, [canvasContext, gameCustomize, startGame]);

  useEffect(() => {
    playersInfosRef.current = playersInfos
    alreadyStartedRef.current = alreadyStarted
    timeRef.current = time
  }, [playersInfosRef, alreadyStartedRef, time])

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
    }
  }

  function resetBall() {
    const canvas = canvasRef.current
    ball.current.x = canvas.width / 2
    ball.current.y = canvas.height / 2
    originalPositions.ball_x = 355
    originalPositions.ball_y = 200
    let serveX = Math.round(Math.random())
    let serveY = Math.round(Math.random())
    ball.current.velocityX = serveX ? 5 : -5
    ball.current.velocityY = serveY ? 5 : -5
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
  }

  const update = () => {
    const canvas = canvasRef.current
    if (canvas && player1.current && player2.current && ball.current) {
      const originalHeight = 400 / canvas.height
      const originalWidth = 710 / canvas.width

      const heightScalingFactor = canvas.height / 400
      const widthScalingFactor = canvas.width / 710

      if (keys.player1['KeyW'] || keys.player2['ArrowUp']) {
        //console.log("ARROW UP")
        if (keys.player1['KeyW']) {
          if (!((player1.current.y - (8 * heightScalingFactor)) <= edges.current.height)) {
            player1.current.y -= (8 * heightScalingFactor);
            originalPositions.player1_y -= 8
          } else {
            player1.current.y = edges.current.height
            originalPositions.player1_y = 10
          }
        }
        if (keys.player2['ArrowUp']) {
          if (!((player2.current.y - (8 * heightScalingFactor)) <= edges.current.height)) {
            player2.current.y -= (8 * heightScalingFactor);
            originalPositions.player1_y -= 8
          } else {
            player2.current.y = edges.current.height
            originalPositions.player1_y = 10
          }
        }
      } else if (keys.player1['KeyS'] || keys.player2['ArrowDown']) {
        //console.log("ARROW DOWN")
        if (keys.player1['KeyS']) {
          if (!(((player1.current.y + player1.current.height) + (8 * heightScalingFactor)) >= (canvas.height - edges.current.height))) {
            player1.current.y += (8 * heightScalingFactor)
            originalPositions.player1_y += 8
          } else {
            player1.current.y = ((canvas.height - edges.current.height) - player1.current.height)
            originalPositions.player1_y = 320
          }
        }
        if (keys.player2['ArrowDown']) {
          if (!(((player2.current.y + player2.current.height) + (8 * heightScalingFactor)) >= (canvas.height - edges.current.height))) {
            player2.current.y += (8 * heightScalingFactor)
            originalPositions.player1_y += 8
          } else {
            player2.current.y = ((canvas.height - edges.current.height) - player2.current.height)
            originalPositions.player1_y = 320
          }
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
      }

      if (localBall.ballY - 7 < 10)
        localBall.ballY += 5
      if (localBall.ballY + 7 > 390)
        localBall.ballY -= 5

      let localPlayer = (localBall.ballX < 355) ? [localPlayer1, 0] : [localPlayer2, 1];

      if (collision(localBall, localPlayer)) {
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
      }
      ball.current.x = localBall.ballX * widthScalingFactor
      ball.current.y = localBall.ballY * heightScalingFactor
      originalPositions.ball_x = localBall.ballX
      originalPositions.ball_y = localBall.ballY
      if (localBall.ballX - 7 < 0) {
        player2.current.score++
        let allPlayersInfos = [...playersInfos]
        allPlayersInfos[1].totalScore += 1
        allPlayersInfos[1].score += allPlayersInfos[1].tmpScore
        setPlayersInfos(allPlayersInfos)
        resetBall()
        // alreadyStartedVar = alreadyStarted
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
        resetBall()
        // alreadyStartedVar = alreadyStarted
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
    }
  }

  let gameAlreadyCheck = false

  useEffect(() => {
    if (gameAlreadyCheck) {
      let fiendGameStatusJson = localStorage.getItem('fiendGameStatus')
      if (fiendGameStatusJson) {
        let fiendGameStatus = JSON.parse(fiendGameStatusJson)
        // console.log(fiendGameStatus)
        localStorage.removeItem('fiendGameStatus')
        setalreadyStarted(fiendGameStatus[2].alreadyStarted)
        setTime(fiendGameStatus[2].time)
        setPlayersInfos(fiendGameStatus)
        setalreadyStarted(1)
        // console.log('already a running game')
      } else {
        setTimeout(() => setalreadyStarted(1), 3000);
        // console.log('not a single running game')
      }
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
          // alreadyStartedVar = 0
          originalPositions.ball_x = 355
          originalPositions.ball_y = 200
          originalPositions.player1_x = 15
          originalPositions.player1_y = 165
          originalPositions.player2_x = 685
          originalPositions.player2_y = 165
          clearInterval(loop)
        } else
          gameLoop()
      }, 1000 / 50);
    }, 2000);
  }

  useEffect(() => {
    if (alreadyStarted && canvasRef && !firstDraw) {
      firstDraw = true
      const canvas = canvasRef.current
      const allPlayersInfos = playersInfosRef.current
      const context = canvas.getContext('2d')
      player1.current = new Player(15, 165, 10, 70, gameCustomize[0], allPlayersInfos[0].score)
      player2.current = new Player(685, 165, 10, 70, gameCustomize[0], allPlayersInfos[1].score)
      ball.current = new Ball(355, 200, 7, gameCustomize[1], 5, 5, 5)
      edges.current = new Edges(10, 'white')
      resizeCanvas()
      setCanvasContext(context);
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      window.addEventListener('resize', resizeCanvas)
      //console.log("DRAWING THE SHAPES")
      isGameStarted = true
      // alreadyStartedVar = alreadyStarted
      setStartGame(true)
      runGame()
    }
  }, [canvasRef, alreadyStarted])

  const handleKeyDown = (e) => {
    //console.log("key down", )
    const gameStarted = startGameRef.current
    if (gameStarted && (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS')) {
      if (e.code === 'KeyW' || e.code === 'KeyS')
        keys.player1[e.code] = true;
      else
        keys.player2[e.code] = true;
    }
  }

  const handleKeyUp = (e) => {
    //console.log("key up")
    const gameStarted = startGameRef.current
    if (gameStarted && (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS')) {
      if (e.code === 'KeyW' || e.code === 'KeyS')
        keys.player1[e.code] = false;
      else
        keys.player2[e.code] = false;
    }
  }

  const exitTheGame = () => {
    setStartGame(false)
    startGameRef.current = false
    navigate('/localmodes')
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
    const handleBeforeUnload = () => {
      const startedGame = startGameRef.current
      const allPlayersInfos = playersInfosRef.current
      const difficultyLvl = alreadyStartedRef.current
      const timeCount = timeRef.current
      if (startedGame) {
        let allPlayersStats = [...allPlayersInfos]
        allPlayersInfos[2].time = timeCount
        allPlayersInfos[2].alreadyStarted = difficultyLvl
        localStorage.setItem('fiendGameStatus', JSON.stringify(allPlayersStats))
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
        const difficultyLvl = alreadyStartedRef.current
        const timeCount = timeRef.current
        if (startedGame) {
          let allPlayersStats = [...allPlayersInfos]
          allPlayersInfos[2].time = timeCount
          allPlayersInfos[2].alreadyStarted = difficultyLvl
          localStorage.setItem('fiendGameStatus', JSON.stringify(allPlayersStats))
        }
      } else
        isOut = true
    }
  }, [])

  const restartGame = () => {
    setGameFinished(false)
    firstDraw = false
    setalreadyStarted(0)
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
        alreadyStarted: 0
      }
    ])
    setTime(0)
    setTimeout(() => setalreadyStarted(1), 3000);
  }

  const exitOfflineGame = () => {
    navigate('/localmodes')
  }

  return (
    <>
      {gameFinished &&
        <OneVsOneStats
          gameFinished={gameFinished}
          userName1='player 1'
          userName2='player 2'
          playersInfos={playersInfos}
          exitOfflineGame={exitOfflineGame}
          restartGame={restartGame}
          mode='offline'
        />
      }
      {(alreadyStarted && !gameFinished) && (
        <div className='onevsone-pm' ref={wrapperRef} >
          <div ref={resultRef} className='onevsone-pm-infos' >
            <div>
              <PiNumberSquareOneFill size={60} />
              <div style={{ textAlign: "center" }} ><p>player 1</p></div>
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
              <div style={{ textAlign: "center" }}><p>player 2</p></div>
              <PiNumberSquareTwoFill style={{ height: '100%' }} size={60}/>
            </div>
          </div>
          <canvas ref={canvasRef} ></canvas>
        </div>
      )}
      {(!alreadyStarted && !gameFinished) && (
        <div className='onevsone'>
          <div className='onevsone-dashboard' >
            <div className='onevsone-dashboard-opponents' style={{ position: "relative" }}>
              <div className='onevsone-dashboard-opponent'>
                <div><PiNumberSquareOneFill style={{ borderRadius: '50%' }} size={60} /></div>
                <div className='onevsone-opponent-infos'>
                  <p>player 1</p>
                </div>
              </div>
              <div className='onevsone-dashboard-logo' >
                <img id='versus-logo' src={Icons.versus} alt="profile-pic" />
              </div>
              <div className='onevsone-dashboard-opponent'>
                <div><PiNumberSquareTwoFill style={{ borderRadius: '50%' }} size={60}/></div>
                <div className='onevsone-opponent-infos'>
                  <p>player 2</p>
                </div>
              </div>
            </div>
          </div>
          {/* {gameStarted && (<div className='onevsone-cancel' ><div className='onevsone-cancel-game' onClick={cancelTheGame} >cancel</div></div>)} */}
        </div>
      )}
    </>
  );
}

export default OneVsOneOffline