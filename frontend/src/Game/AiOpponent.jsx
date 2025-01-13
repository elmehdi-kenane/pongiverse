import "../assets/Game/aiOpponent.css";
import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import aiOpponentAvatar from "../assets/Game/aiOpponentAvatar.svg";

const AiOpponent = () => {
  const { user, userImg } = useContext(AuthContext);

  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem("savedScore");
    return savedScore ? JSON.parse(savedScore) : { user: 0, bot: 0 };
  });

  const navigate = useNavigate();

  const [gameActive, setGameActive] = useState(true);
  const [loading, setLoading] = useState({ state: true, step: 3 });

  const [screen, setScreen] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const canvasWidth =
    screen.width > 616 ? (screen.width > 768 ? 800 : 600) : 300;
  const canvasHeight = canvasWidth / 2;
  const paddleWidth = canvasWidth >= 600 ? 10 : 7;
  const paddleHeight = canvasWidth >= 600 ? 50 : 35;
  const botPaddleOffset = canvasWidth >= 600 ? 15 : 10;
  const paddleSpeedMovement = canvasWidth === 800 ? 5 : (canvasWidth === 600 ? 3.5 : 2);
  const ballRadius = canvasWidth >= 600 ? 7 : 4;
  const maxScore = 5;

  let startTime = Date.now();
  // console.log(`Start time: ${new Date(startTime).toISOString()}`);

  let animationId;

  const keys = { up: false, down: false };

  const canvasRef = useRef(null);
  const ballPositionRef = useRef({ x: canvasWidth / 2, y: canvasHeight / 2 });
  const ballVelocityRef = useRef({
    x: canvasWidth === 800 ? 5 : (canvasWidth === 600 ? 3.5 : 2),
    y: canvasWidth === 800 ? 5 : (canvasWidth === 600 ? 3.5 : 2),
  });
  console.log("ballVelocityRef", ballVelocityRef);
  console.log("paddleSpeedMovement", paddleSpeedMovement);
  const userObj = {
    topOfPaddle: canvasHeight / 2 - paddleHeight / 2 - canvasHeight / 4,
    x: botPaddleOffset,
  };

  const bot = {
    movement: paddleSpeedMovement,
    topOfPaddle: canvasHeight / 2 - paddleHeight / 2 + canvasHeight / 4,
    x: canvasWidth - botPaddleOffset,
    ballPosition: { x: 0, y: 0 },
    ballVelocity: { x: 0, y: 0 },
  };
  useEffect(() => {
    if (loading.state) {
      const timeout = setTimeout(() => {
        if (loading.step > 1) {
          setLoading({ state: true, step: loading.step - 1 });
        } else if (loading.step === 1)
          setLoading({
            state: true,
            step:
              localStorage.getItem("savedScore") !== null &&
              score.bot !== 0 &&
              score.user !== 0
                ? "CONTINUE"
                : "START",
          });
        else {
          setLoading({ state: false, step: 3 });
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  });

  useEffect(() => {
    if (score.bot === maxScore || score.user === maxScore) {
      setGameActive(false);
      cancelAnimationFrame(animationId);
    }
    localStorage.setItem("savedScore", JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    if (canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const createPaddle = () => {
      const paddle = context.createImageData(paddleWidth, paddleHeight);
      for (let i = 0; i < paddle.data.length; i += 4) {
        paddle.data[i + 0] = 68; // R value
        paddle.data[i + 1] = 45; // G value
        paddle.data[i + 2] = 106; // B value
        paddle.data[i + 3] = 255; // A value
      }
      return paddle;
    };

    const moveUserPaddle = () => {
      if (
        keys.up === true &&
        userObj.topOfPaddle - paddleSpeedMovement >= botPaddleOffset / 3
      ) {
        userObj.topOfPaddle -= paddleSpeedMovement;
      }
      if (
        keys.down === true &&
        userObj.topOfPaddle + paddleSpeedMovement <=
          canvasHeight - paddleHeight - botPaddleOffset / 3
      ) {
        userObj.topOfPaddle += paddleSpeedMovement;
      }
      const userPaddle = createPaddle();
      context.putImageData(
        userPaddle,
        botPaddleOffset - paddleWidth,
        userObj.topOfPaddle
      );
    };

    const moveBotPaddle = () => {
      const t = (bot.x - bot.ballPosition.x) / bot.ballVelocity.x;
      let predictedY = bot.ballPosition.y + bot.ballVelocity.y * t;

      const botPaddle = createPaddle();
      const cornerHit = 70;
      if (
        predictedY < -cornerHit ||
        predictedY > canvasHeight + cornerHit ||
        bot.ballVelocity.x < 0 ||
        bot.ballPosition.x < canvasWidth * (2 / 4)
      ) {
        // the ball going to the opposite side or the ball position is between 0 and 3/4 of the canvasWidth
        bot.movement = 0;
        context.putImageData(botPaddle, bot.x, bot.topOfPaddle);
        //console.log("the ball will not hit the bot-side");
      } else {
        // handle the cornerHit cases
        if (predictedY < 0) predictedY = -predictedY;
        else if (predictedY > canvasHeight) {
          const diff = predictedY - canvasHeight;
          predictedY = canvasHeight - diff;
        }
        if (
          bot.topOfPaddle < predictedY - ballRadius &&
          predictedY + ballRadius < bot.topOfPaddle + paddleHeight
        ) {
          // bot is able to hit the ball with its current y so just keep the bot paddle in its current place
          // the condition means that the y-predicted is between the head of the bot-paddle and the middle of the bot-paddle
          // I added/subtracted the 20 value to make sure the ball will hit the bot-paddle
          //  console.log("the bot is able to hit the ball with its current position");
          context.putImageData(botPaddle, bot.x, bot.topOfPaddle);
        } else {
          // the current-y of the bot-paddle is still incapable to hit the ball
          let nextY = 0;
          bot.movement = paddleSpeedMovement;
          if (predictedY + ballRadius >= bot.topOfPaddle + paddleHeight) {
            nextY = bot.topOfPaddle + bot.movement;
            if (nextY + paddleHeight + botPaddleOffset / 3 > canvasHeight) {
              // if the paddle go down outside the canvas
              nextY = canvasHeight - paddleHeight - botPaddleOffset / 3;
            }
            context.putImageData(botPaddle, bot.x, nextY);
            bot.topOfPaddle = nextY;
          } else if (predictedY - ballRadius <= bot.topOfPaddle) {
            // the bot.topOfPaddle is the top of the paddle so i add the (+ paddleHeight / 3) so just to make sure the predictedY is between the bot.topOfPaddle which is the top of the paddle and the (bot.topOfPaddle + paddleHeight) which is the bottom of the bot paddle
            nextY = bot.topOfPaddle - bot.movement;
            if (nextY < botPaddleOffset / 3) {
              nextY = botPaddleOffset / 3;
            }
            context.putImageData(botPaddle, bot.x, nextY);
            bot.topOfPaddle = nextY;
          } else console.log("Error");
        }
      }
    };

    const drawBall = () => {
      context.beginPath();
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      context.arc(
        ballPositionRef.current.x,
        ballPositionRef.current.y,
        ballRadius,
        startAngle,
        endAngle
      );
      context.fillStyle = "#913dce";
      context.fill();
      context.closePath();
    };

    const changeBallYDirection = () => {
      ballVelocityRef.current.y =
        -ballVelocityRef.current.y + (Math.random() * 0.5 - 0.25);
      ballPositionRef.current.y = Math.min(
        Math.max(ballPositionRef.current.y, ballRadius),
        canvasHeight - ballRadius
      );
    };

    const changeBallXDirection = () => {
      ballVelocityRef.current.x =
        -ballVelocityRef.current.x + (Math.random() * 0.5 - 0.25);
      ballPositionRef.current.x = Math.min(
        Math.max(ballPositionRef.current.x, ballRadius),
        canvasWidth - ballRadius
      );
    };

    const drawBotPaddleOffset = () => {
      context.beginPath();
      context.moveTo(canvasWidth - 70, 0);
      context.lineTo(canvasWidth - 70, canvasHeight);
      context.closePath();
      context.stroke();
    };

    const drawBallLinePath = () => {
      if (bot.ballVelocity.x > 0) {
        let hitX = -1;
        let hitY = -1;
        let step = 1;
        let nextBallX = 0;
        let nextBallY = 0;
        context.beginPath();
        context.moveTo(bot.ballPosition.x, bot.ballPosition.y);
        while (1) {
          if (hitX === -1) {
            nextBallX = bot.ballPosition.x + bot.ballVelocity.x * step;
            nextBallY =
              bot.ballPosition.y +
              bot.ballVelocity.y * (hitY <= 0 ? step : -step);
          } else {
            nextBallX = hitX + bot.ballVelocity.x * step;
            nextBallY =
              hitY +
              (hitY <= 0
                ? Math.abs(bot.ballVelocity.y * step)
                : Math.abs(bot.ballVelocity.y * step) * -1);
          }
          if (
            nextBallX <= 0 ||
            nextBallX >= canvasWidth ||
            nextBallY <= 0 ||
            nextBallY >= canvasHeight
          ) {
            if (nextBallX <= 0) {
              hitX = 0;
              hitY = nextBallY;
            } else if (nextBallX >= canvasWidth) {
              hitX = canvasWidth;
              hitY = nextBallY;
            } else if (nextBallY <= 0) {
              hitY = 0;
              hitX = nextBallX;
            } else if (nextBallY >= canvasHeight) {
              hitY = canvasHeight;
              hitX = nextBallX;
            }
            context.lineTo(hitX, hitY);
            context.stroke();
            if (hitX === canvasWidth) break;
          }
          step++;
        }
      }
    };

    const moveBall = () => {
      drawBall();
      if (loading.state === true) return;
      const nextBallPositionY =
        ballPositionRef.current.y + ballVelocityRef.current.y;
      const nextBallPositionX =
        ballPositionRef.current.x + ballVelocityRef.current.x;
      if (ballVelocityRef.current.x > 0) {
        // if (
        //   Math.floor(ballPositionRef.current.x + ballRadius) >= canvasWidth ||
        //   bot.topOfPaddle >= ballPositionRef.current.y + ballRadius ||
        //   bot.topOfPaddle + paddleHeight <=
        //     ballPositionRef.current.y - ballRadius
        // ) {
        if (
          Math.floor(nextBallPositionX + ballRadius) >= bot.x &&
          bot.topOfPaddle <= nextBallPositionY - ballRadius &&
          bot.topOfPaddle + paddleHeight >= nextBallPositionY + ballRadius
        ) {
          //  console.log("============ ======== ============");
          //  console.log("============ BOT SIDE ============");
          //   console.log(ballVelocityRef.current.y > 0 ? "from up" : "from down");
          //  console.log("top", bot.topOfPaddle);
          //  console.log("ball.y + ballRadius", nextBallPositionY + ballRadius);
          //   console.log(
          //     "Math.floor(nextBallPositionX + ballRadius)",
          //     Math.floor(nextBallPositionX + ballRadius),
          //     "bot.x",
          //     bot.x
          //   );
          //  console.log("bottom", bot.topOfPaddle + paddleHeight);
          changeBallXDirection();
        } else if (Math.floor(nextBallPositionX + ballRadius) >= canvasWidth) {
          //  console.log("============ ======== ============");
          //  console.log("============ BOT SIDE ============");
          //   console.log(
          //     "+++++++ new goal +++++++",
          //     "Math.floor(nextBallPositionX + ballRadius)",
          //     Math.floor(nextBallPositionX + ballRadius),
          //     "bot.x",
          //     bot.x
          //   );
          setScore((prevScore) => {
            return { ...prevScore, user: prevScore.user + 1 };
          });
          ballPositionRef.current.x = canvasWidth / 2;
          ballPositionRef.current.y = canvasHeight / 2;
          changeBallXDirection();
        }
        // }
      } else if (ballVelocityRef.current.x < 0) {
        // if (
        //   Math.floor(nextBallPositionX - ballRadius) <= 0 ||
        //   userObj.topOfPaddle >= nextBallPositionY + ballRadius ||
        //   userObj.topOfPaddle + paddleHeight <= nextBallPositionY - ballRadius
        // ) {
        if (
          Math.floor(nextBallPositionX - ballRadius) < userObj.x &&
          userObj.topOfPaddle <= nextBallPositionY &&
          userObj.topOfPaddle + paddleHeight >= nextBallPositionY
        ) {
          //  console.log("============ ======== ============");
          //  console.log("============ USER SIDE ===========");
          //   console.log(
          //     "the user paddle hit the ball nextBallPositionX",
          //     nextBallPositionX,
          //     "userObj.x",
          //     userObj.x
          //   );
          //   console.log(ballVelocityRef.current.y > 0 ? "from up" : "from down");
          //  console.log("top", userObj.topOfPaddle);
          //   console.log(
          //     "ball.y",
          //     nextBallPositionY
          //   );
          //   console.log(
          //     "Math.floor(nextBallPositionX)",
          //     Math.floor(nextBallPositionX),
          //     "userObj.x",
          //     userObj.x
          //   );
          //  console.log("bottom", userObj.topOfPaddle + paddleHeight);
          changeBallXDirection();
        }
        if (Math.floor(nextBallPositionX - ballRadius) <= 0) {
          //console.log("============ ======== ============");
          //console.log("============ USER SIDE ===========");
          // console.log(
          //   "+++++++ new goal +++++++",
          //   "Math.floor(nextBallPositionX + ballRadius)",
          //   Math.floor(nextBallPositionX + ballRadius),
          //   "nextBallPositionX",
          //   nextBallPositionX,
          //   "ballRadius",
          //   ballRadius,
          //   "userObj.x",
          //   userObj.x
          // );
          setScore((prevScore) => {
            return { ...prevScore, bot: prevScore.bot + 1 };
          });
          ballPositionRef.current.x = canvasWidth / 2;
          ballPositionRef.current.y = canvasHeight / 2;
          changeBallXDirection();
        }
        // }
      }
      if (
        nextBallPositionY + ballRadius > canvasHeight ||
        nextBallPositionY - ballRadius < 0
      ) {
        changeBallYDirection();
      }
      ballPositionRef.current.y += ballVelocityRef.current.y;
      ballPositionRef.current.x += ballVelocityRef.current.x;
    };

    const updateBotView = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= 1000) {
        bot.ballPosition = {
          x: ballPositionRef.current.x,
          y: ballPositionRef.current.y,
        };
        bot.ballVelocity = {
          x: ballVelocityRef.current.x,
          y: ballVelocityRef.current.y,
        };
        startTime = Date.now();
      }
      //   console.log(
      //     "ballPositionRef.current",
      //     ballPositionRef.current,
      //     "bot.ballPosition",
      //     bot.ballPosition
      //   );
    };

    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp") keys.up = true;
      else if (event.key === "ArrowDown") keys.down = true;
    };

    const handleKeyUp = (event) => {
      if (event.key === "ArrowUp") keys.up = false;
      else if (event.key === "ArrowDown") keys.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const animate = () => {
      if (!gameActive) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      updateBotView();
      moveBotPaddle();
      moveUserPaddle();
      moveBall();
      //   drawBotPaddleOffset();
      //   drawBallLinePath();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameActive, screen, loading]);

  const handleRestartBtn = () => {
    setScore({ bot: 0, user: 0 });
    ballPositionRef.current = { x: canvasWidth / 2, y: canvasHeight / 2 };
    setGameActive(true);
    setLoading({ state: true, step: 3 });
  };

  const handleExitBtn = () => {
    localStorage.removeItem("savedScore");
    navigate("/mainpage/game/solo");
  };

  useEffect(() => {
    const handleResize = () => {
      setScreen({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="container">
      {(score.bot === maxScore || score.user === maxScore) && (
        <div className="final">
          <p>Final Result</p>
        </div>
      )}
      <ScoreBarDesktop
        score={score}
        username={user}
        avatar={userImg}
      ></ScoreBarDesktop>
      <ScoreBarMobile
        score={score}
        username={user}
        avatar={userImg}
      ></ScoreBarMobile>
      {score.bot === maxScore || score.user === maxScore ? (
        <div
          style={{ width: canvasWidth, height: canvasHeight }}
          className="result"
        >
          {score.bot === maxScore ? (
            <div>
              <p className="header">You LOST 😢</p>
              <p className="sub-header">This might not be your moment...</p>
            </div>
          ) : (
            <div>
              <p className="header">You WON 👾</p>
              <p className="sub-header">Victory is yours!</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {loading.state === true && (
            <div
              style={{ width: canvasWidth, height: canvasHeight }}
              className={`loading-screen`}
            >
              <p
                key={loading.step} // Force React to re-create the element
                className={`step-${loading.step}`}
              >
                {loading.step}
              </p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="canvas-element"
            width={canvasWidth}
            height={canvasHeight}
          />
        </>
      )}
      <div className="aiOpponent-optionBtns">
        <button onClick={handleRestartBtn}>RESTART</button>
        <button onClick={handleExitBtn}>EXIT</button>
      </div>
    </div>
  );
};

export default AiOpponent;

const ScoreBarDesktop = ({ score, username, avatar }) => {
  return (
    <div className="score-bar">
      <div className="player">
        <img src={avatar} alt={avatar} />
        <p className="name">{username}</p>
        <p className="score">{score.user}</p>
      </div>
      <div className="aiOpponent-separator">-</div>
      <div className="player">
        <p className="score">{score.bot}</p>
        <p className="name">AiOpponent</p>
        <img src={aiOpponentAvatar} alt={aiOpponentAvatar} />
      </div>
    </div>
  );
};

const ScoreBarMobile = ({ score, username, avatar }) => {
  return (
    <div className="score-bar-mobile">
      <div className="player">
        <div className="avatarAndName">
          <img src={avatar} alt={avatar} />
          <p className="name">{username}</p>
        </div>
      </div>
      <div className="score">
        <p className="scoreNumber">{score.user}</p>
        <div className="aiOpponent-separator">-</div>
        <p className="scoreNumber">{score.bot}</p>
      </div>
      <div className="player">
        <div className="avatarAndName">
          <img src={aiOpponentAvatar} alt={aiOpponentAvatar} />
          <p className="name">aiOpponent</p>
        </div>
      </div>
    </div>
  );
};
