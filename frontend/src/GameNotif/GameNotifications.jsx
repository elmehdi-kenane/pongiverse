import React, { useState, useEffect, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import * as Icons from "../assets/navbar-sidebar";
import AuthContext from "../navbar-sidebar/Authcontext";
import styles from "../assets/Game/gamemodes.module.css";
import playSoloImage from "../assets/Game/playSoloMode.svg";
import createTournamentImage from "../assets/Game/createTournamentMode.svg";
import joinTournamentImage from "../assets/Game/joinTournamentMode.svg";
import toastDrari, { Toaster } from "react-hot-toast";
import { toast, Bounce } from "react-toastify";
import NotificationPopupCard from "../navbar-sidebar/NotificationPopupCard";
import { ImWarning } from "react-icons/im";
const GameNotifications = (props) => {
  const [roomID, setRoomID] = useState(null);
  let {
    socket,
    user,
    setAllGameNotifs,
    allGameNotifs,
    notifsImgs,
    notifSocket,
    setSocket,
    socketRef,
  } = useContext(AuthContext);
  const gamePlayRegex = /^\/mainpage\/(game|play)(\/[\w\d-]*)*$/;
  const navigate = useNavigate();
  const location = useLocation();
  const [createdAt, setCreatedAt] = useState(null);
  const [timeDiff, setTimeDiff] = useState(null);
  const [friendReq, setFriendReq] = useState("");
  const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);
  const [dataSocket, setDataSocket] = useState(null);
  const [newReceivedFriendReqNotif, setNewReceivedFriendReqNotif] =
    useState(false);

  // friendReq notification functionality
  useEffect(() => {
    if (dataSocket !== null) {
      if (dataSocket.type === "receive-friend-request") {
        setNewReceivedFriendReqNotif(true);
        setRemoveFriendReqNotif(false);
        setFriendReq(dataSocket.message);
      } else if (
        dataSocket.type === "confirm-friend-request" &&
        dataSocket.message.second_username === friendReq.username
      ) {
        setRemoveFriendReqNotif(true);
      } else if (
        dataSocket.type === "remove-friend-request" &&
        dataSocket.message.second_username === friendReq.username
      ) {
        setRemoveFriendReqNotif(true);
      } else console.log("unknown notif type");
    }
  }, [dataSocket?.message.to_user, dataSocket?.type]);

  const notify = () => {
    setNewReceivedFriendReqNotif(false);
    toast(
      <NotificationPopupCard
        secondUsername={friendReq.second_username}
        avatar={friendReq.avatar}
      />,
      {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      }
    );
  };

  useEffect(() => {
    {
      newReceivedFriendReqNotif && location.pathname !== "/mainpage/friends"
        ? notify()
        : console.log("");
    }
  }, [newReceivedFriendReqNotif]);

  const refuseInvitation = (creator) => {
    let notifSelected = allGameNotifs.filter(
      (user) => user.user === creator.user
    );
    setAllGameNotifs(
      allGameNotifs.filter((user) => user.user !== creator.user)
    );
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
      if (creator.mode === "1vs1") {
        notifSocket.send(
          JSON.stringify({
            type: "refuseInvitation",
            message: {
              user: notifSelected[0].user,
              target: user,
              roomID: notifSelected[0].roomID,
            },
          })
        );
      } else if (creator.mode === "TournamentInvitation") {
        notifSocket.send(
          JSON.stringify({
            type: "deny-tournament-invitation",
            message: {
              user: user,
              sender: creator.user,
              tournament_id: creator.tournament_id,
            },
          })
        );
      }
    }
  };

  useEffect(() => {
    const getTournamentWarning = async () => {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS
        }:8000/api/get-tournament-warning`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.Case === "yes") setCreatedAt(new Date(data.time));
      }
    };
    if (user) getTournamentWarning();
  }, [user]);

  useEffect(() => {
    if (createdAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - createdAt) / 1000);
        if (diffInSeconds < 10) {
          setTimeDiff(10 - diffInSeconds);
        } else {
          setTimeDiff(null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [createdAt]);

  const notifyError = (message) =>
    toastDrari.error(message, {
      position: "top-center",
      duration: 3000,
    });

  const acceptInvitation = async (sender) => {
    let notifSelected = allGameNotifs.filter(
      (user) => user.user === sender.user
    );
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
      if (sender.mode === "1vs1") {
        console.log("YES!");
        notifSocket.send(
          JSON.stringify({
            type: "acceptInvitation",
            message: {
              user: notifSelected[0].user,
              target: user,
              roomID: notifSelected[0].roomID,
            },
          })
        );
      } else if (sender.mode === "TournamentInvitation") {
        console.log("YES1!");
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/api/get-tournament-size`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tournament_id: sender.tournament_id,
              user: user,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("******Case", data.Case);
          if (data.Case === "Tournament_does_not_exist") {
            removeNotification(sender.tournament_id, user);
            notifyError("Tournament does not exist");
          } else if (data.Case === "User_is_in_tournament")
            navigate("/mainpage/game/createtournament");
          else if (
            data.Case === "Tournament_started" ||
            data.Case === "Tournament_is_full"
          ) {
            if (data.Case === "Tournament_started")
              notifyError("Tournament is already started");
            else notifyError("Tournament is full");
            notifSocket.send(
              JSON.stringify({
                type: "deny-tournament-invitation",
                message: {
                  user: user,
                  sender: sender.user,
                  tournament_id: sender.tournament_id,
                },
              })
            );
          } else if (data.Case === "size_is_valide") {
            await notifSocket.send(
              JSON.stringify({
                type: "accept-tournament-invitation",
                message: {
                  user: user,
                  tournament_id: sender.tournament_id,
                },
              })
            );
          }
        } else {
          console.error("Failed to fetch data");
        }
      }
    }
  };

  const removeNotification = (tournament_id, user) => {
    setAllGameNotifs((prevGameNotif) =>
      prevGameNotif.filter(
        (notif) => notif.tournament_id === tournament_id && notif.user === user
      )
    );
  };

  useEffect(() => {
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
      notifSocket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        setDataSocket(data);
        let type = data.type;
        let message = data.message;
        console.log("MESSAGE TYPE", type);
        if (type === "goToGamingPage") {
          // console.log("navigating now")
          // navigate(`/mainpage/game/solo/1vs1/friends`)
          const socketRefer = socketRef.current;
          console.log("SOCKET........", socketRefer);
          if (socketRefer?.readyState !== WebSocket.OPEN) {
            console.log("SOCKET IS CLOSED, SHOULD OPENED");
            const newSocket = new WebSocket(
              `ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`
            );
            newSocket.onopen = () => {
              console.log("+++++++++++=======+++++++++");
              console.log(
                "GAME SOCKET OPENED AND NOW WE WILL MOVE TO FRIEND PAGE"
              );
              console.log("+++++++++++=======+++++++++");
              setSocket(newSocket);
              if (message.mode === "1vs1")
                navigate(`/mainpage/game/solo/1vs1/friends`);
              else navigate(`/mainpage/game/solo/2vs2/friends`);
            };
          } else {
            if (message.mode === "1vs1")
              navigate(`/mainpage/game/solo/1vs1/friends`);
            else navigate(`/mainpage/game/solo/2vs2/friends`);
          }
        } else if (type === "receiveFriendGame") {
          console.log("RECEIVED A GAME REQUEST");
          setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message]);
          setRoomID(message.roomID);
        } else if (type === "accepted_invitation") {
          removeNotification(message.user, message.tournament_id);
          const socketRefer = socketRef.current;
          // && gamePlayRegex.test(location.pathname)
          if (socketRefer?.readyState !== WebSocket.OPEN) {
            console.log("SOCKET IS CLOSED, SHOULD OPENED");
            const newSocket = new WebSocket(
              `ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`
            );
            newSocket.onopen = () => {
              setSocket(newSocket);
              navigate("/mainpage/game/createtournament");
            };
          } else {
            navigate("/mainpage/game/createtournament");
          }
        } else if (type === "warn_members") {
          setCreatedAt(new Date(message.time));
          // notifyError("your game In tournament will start in 15 seconds");
        } else if (type === "invited_to_tournament") {
          setAllGameNotifs((prevGameNotif) => {
            const isDuplicate = prevGameNotif.some(
              (notif) =>
                notif.tournament_id === message.tournament_id &&
                notif.user === message.user
            );
            if (!isDuplicate) return [...prevGameNotif, message];
            return prevGameNotif;
          });
        } else if (type === "deny_tournament_invitation") {
          setAllGameNotifs(
            allGameNotifs.filter((user) => user.user !== message.user)
          );
        } else if (type === "remove_tournament_notif") {
          removeNotification(message.tournament_id, message.user);
        } else if (type === "connected_again") {
          const userConnected = data.message.user;
          if (userConnected === props.userId) {
            props.setUserIsOnline(true);
          }
        } else if (type === "user_disconnected") {
          const userDisConnected = data.message.user;
          if (userDisConnected === props.userId) {
            props.setUserIsOnline(false);
          }
        }
      };
    }
  }, [notifSocket]);

  return (
    <>
      {timeDiff && (
        <div className={styles["tournament_warnings"]}>
          <ImWarning size={30} color="red" />
          Your Game will start in {timeDiff}
        </div>
      )}
      <div className="cancel-game-invite-request">
        {allGameNotifs && allGameNotifs.length ? (
          <div className="game-invitations">
            {allGameNotifs.map((user, key) => {
              return (
                <div key={key} className="game-invitation">
                  <img src={user.image} alt="profile-pic" />
                  <div className="user-infos">
                    <span>{user.user}</span>
                    <span>level 2.5</span>
                  </div>
                  <div className="invitation-mode">
                    <span>1</span>
                    <span>vs</span>
                    <span>1</span>
                  </div>
                  <div className="accept-refuse">
                    <div onClick={() => acceptInvitation(user)}>
                      <img src={Icons.copied} alt="accept-icon" />
                    </div>
                    <div onClick={() => refuseInvitation(user)}>
                      <img src={Icons.cancel} alt="refuse-icon" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default GameNotifications;
