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
import ChatContext from "../Context/ChatContext";

const GameNotifications = (props) => {
  const [roomID, setRoomID] = useState(null);
  let {
    socket,
    user,
    userImg,
    setAllGameNotifs,
    allGameNotifs,
    notifsImgs,
    notifSocket,
    setSocket,
    socketRef,
    setChatNotificationCounter,
    setChatRoomInvitationsCounter,
    notifications,
    setNotifications,
    setIsNotificationsRead,
  } = useContext(AuthContext);
  let { setSelectedDirect, setDirects, setDirectsSearch , selectedItem, setSelectedItem} = useContext(
    ChatContext
  );
  const gamePlayRegex = /^\/mainpage\/(game|play)(\/[\w\d-]*)*$/;
  const navigate = useNavigate();
  const location = useLocation();
  const [createdAt, setCreatedAt] = useState(null);
  const [timeDiff, setTimeDiff] = useState(null);
  const [friendReq, setFriendReq] = useState("");
  const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);
  const [newReceivedFriendReqNotif, setNewReceivedFriendReqNotif] =
    useState(false);

  const addNotificationToList = ({
    avatar,
    notificationText,
    urlRedirection,
    notifications,
    setNotifications,
    user,
  }) => {
    if (user) {
      const newNotification = {
        notification_text: trimStringWithEllipsis(notificationText),
        url_redirection: urlRedirection,
        send_at: new Date().toISOString(),
        avatar: avatar,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setIsNotificationsRead(false);
    }
  };

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
      if (
        newReceivedFriendReqNotif &&
        location.pathname !== "/mainpage/Friendship"
      ) {
        // console.log("pathname notify", location.pathname);
        notify();
      }
    }
  }, [newReceivedFriendReqNotif]);

  const refuseInvitation = (creator) => {
    let notifSelected = allGameNotifs.filter(
      (user) => user.user === creator.user
    );
    // // console.log("****AL GAME NOTT: ", allGameNotifs.filter((user) => ((user?.tournament_id && user.tournament_id !== creator.tournament_id) || (user.roomID !== creator.roomID))))
    setAllGameNotifs((prevAllGameNotifs) =>
      prevAllGameNotifs.filter(
        (user) =>
          (user?.tournament_id &&
            user.tournament_id !== creator.tournament_id) ||
          user.roomID !== creator.roomID
      )
    );
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
      if (creator.mode === "1vs1" || creator.mode === "2vs2") {
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
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${
          import.meta.env.VITE_PORT
        }/api/get-tournament-warning`,
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
      } else if (response.status === 401) navigate("/signin");
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
    setAllGameNotifs((prevAllGameNotifs) =>
      prevAllGameNotifs.filter(
        (user) =>
          (user?.tournament_id &&
            user.tournament_id !== sender.tournament_id) ||
          user.roomID !== sender.roomID
      )
    );
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
      if (sender.mode === "1vs1") {
        // console.log("YES!");
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
      } else if (sender.mode === "2vs2") {
        notifSocket.send(
          JSON.stringify({
            type: "acceptInvitationMp",
            message: {
              user: notifSelected[0].user,
              target: user,
              roomID: notifSelected[0].roomID,
            },
          })
        );
      } else if (sender.mode === "TournamentInvitation") {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${
            import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/api/get-tournament-size`,
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
          if (data.Case === "Tournament_does_not_exist") {
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
        } else if (response.status === 401) navigate("/signin");
      }
    }
  };

  const removeNotification = (tournament_id, user, mode) => {
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
        let type = data.type;
        let message = data.message;
        const friendsData = {
          message: message,
          type: type,
        };
        if (props.setData) props.setData(friendsData);
        if (type === "goToGamingPage") {
          const socketRefer = socketRef.current;
          if (socketRefer?.readyState !== WebSocket.OPEN) {
            const newSocket = new WebSocket(
              `${import.meta.env.VITE_SOCKET}://${
                import.meta.env.VITE_IPADDRESS
              }:${import.meta.env.VITE_PORT}/ws/socket-server`
            );
            newSocket.onopen = () => {
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
          // console.log("RECEIVED A GAME REQUEST");
          setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message]);
          setRoomID(message.roomID);
        } else if (type === "accepted_invitation") {
          removeNotification(message.user, message.tournament_id);
          const socketRefer = socketRef.current;
          // && gamePlayRegex.test(location.pathname)
          if (socketRefer?.readyState !== WebSocket.OPEN) {
            // console.log("SOCKET IS CLOSED, SHOULD OPENED");
            const newSocket = new WebSocket(
              `${import.meta.env.VITE_SOCKET}://${
                import.meta.env.VITE_IPADDRESS
              }:${import.meta.env.VITE_PORT}/ws/socket-server`
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
        } else if (type === "remove_tournament_notif") {
          removeNotification(message.tournament_id, message.user);
        } else if (
          type === "connected_again" &&
          location.pathname === "/mainpage/chat"
        ) {
          props.setSelectedDirect((prev) => ({ ...prev, status: true }));
          props.setDirects((prev) => {
            const updatedDirects = prev.map((friend) => {
              if (friend.name === data.message.user) {
                return {
                  ...friend,
                  is_online: true,
                };
              }
              return friend;
            });
            return updatedDirects;
          });
        } else if (
          type === "user_disconnected" &&
          location.pathname === "/mainpage/chat"
        ) {
          props.setSelectedDirect((prev) => ({ ...prev, status: false }));
          props.setDirects((prev) => {
            const updatedDirects = prev.map((friend) => {
              if (friend.name === data.message.user) {
                return {
                  ...friend,
                  is_online: false,
                };
              }
              return friend;
            });
            return updatedDirects;
          });
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
        } else if (type === "send-friend-request") {
          const addNewNotification = async () => {
            const response = await fetch(
              `${import.meta.env.VITE_PROTOCOL}://${
                import.meta.env.VITE_IPADDRESS
              }:${import.meta.env.VITE_PORT}/navBar/add_notification/`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  notification_text: `${user} sent you a friend request`,
                  url_redirection: "friendship",
                  username: message.second_username,
                  avatar: userImg,
                }),
              }
            );
          };
          addNewNotification()
        } else if (type === "receive-friend-request") {
          if (message.second_username === props.userId)
            props.setIsFriend("accept");
          setNewReceivedFriendReqNotif(true);
          setRemoveFriendReqNotif(false);
          setFriendReq(message);
          addNotificationToList({
            notificationText: `${message.second_username} sent you a friend request`,
            urlRedirection: "friendship",
            avatar: message.avatar,
            notifications: notifications,
            setNotifications: setNotifications,
            user: user,
          });
        } else if (
          type === "confirm-friend-request" &&
          message.second_username === friendReq.username
        ) {
          setRemoveFriendReqNotif(true);
        } else if (
          type === "remove-friend-request" &&
          message.second_username === friendReq.username
        ) {
          setRemoveFriendReqNotif(true);
        } else if (
          type === "friend-request-accepted" &&
          message.second_username === props.userId
        ) {
          props.setIsFriend("true");
          props.getUserFriends();
        } else if (
          type === "confirm-friend-request" &&
          message.second_username === props.userId
        ) {
          props.getUserFriends();
          props.setIsFriend("true");
        } else if (
          type === "cancel-friend-request" &&
          message.second_username === props.userId
        ) {
          props.setIsFriend("false");
        } else if (
          type === "remove-friendship" &&
          message.second_username === props.userId
        ) {
          props.setIsFriend("false");
          props.getUserFriends();
          setDirects((prev) => prev.filter((direct) => direct.name !== message.second_username));
          setSelectedDirect({
            id: "",
            name: "",
            status: "",
            avatar: "",
          });
          setSelectedItem("");
          setDirectsSearch([]);
        } else if (type === "blocked-friend" && message.second_username === props.userId) {
          navigate("/mainpage/dashboard");
          setDirects(prev => prev.filter(direct => direct.name !== message.second_username))
          setSelectedDirect({
            id: "",
            name: "",
            status: "",
            avatar: "",
          });
          setDirectsSearch([]);
        } else if (data.type === "chatNotificationCounter" && location.pathname !== "/mainpage/chat") {
          setChatNotificationCounter(data.count);
        } else if ( data.type === "roomInvitation" && location.pathname !== "/mainpage/groups") {
          setChatRoomInvitationsCounter((prev) => prev + 1);
        } else if ( location.pathname === "/mainpage/groups" && (type === "remove-friendship" || type === "blocked-friend")) {
          props.setAllFriends((prev) =>
            prev.filter((friend) => friend.name !== message.second_username)
          );
          props.setAllChatRoomMembers((prev) =>
            prev.filter((member) => member.name !== message.second_username)
          );
          setDirects(prev => prev.filter(direct => direct.name !== message.second_username))
          setSelectedDirect({
            id: "",
            name: "",
            status: "",
            avatar: "",
          });
          setDirectsSearch([]);
        } else if ( location.pathname === "/mainpage/chat" && (type === "remove-friendship" || type === "blocked-friend")) {
          props.setDirects((prev) =>
            prev.filter((direct) => direct.name !== message.second_username)
          );
          props.setSelectedDirect({
            id: "",
            name: "",
            status: "",
            avatar: "",
          });
          setDirectsSearch([]);
        }else if  (type ==='remove-friendship' || type === 'blocked-friend')
          {
            setDirects(prev => prev.filter(direct => direct.name !== message.second_username))
            if (selectedItem === message.second_username) {
              setSelectedItem("")
            setSelectedDirect({
              id: "",
              name: "",
              status: "",
              avatar: "",
            })};
            
            setDirectsSearch([]);
          } else if (
          type === "user_join_tournament" &&
          location.pathname === "/mainpage/game/jointournament"
        ) {
          let tournament_id = message.tournament_id;
          props.setTournamentSuggestions((prevSuggestions) =>
            prevSuggestions.map((tournament) =>
              tournament.tournament_id == tournament_id
                ? { ...tournament, size: tournament.size + 1 }
                : tournament
            )
          );
        }
      };
    }
  }, [notifSocket, location.pathname]);

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
                    <span>{user.level}</span>
                  </div>
                  <div className="invitation-mode">
                    {user.mode === "1vs1" ? (
                      <>
                        <span>1</span>
                        <span>vs</span>
                        <span>1</span>
                      </>
                    ) : user.mode === "2vs2" ? (
                      <>
                        <span>2</span>
                        <span>vs</span>
                        <span>2</span>
                      </>
                    ) : (
                      <>
                        <span>Cup</span>
                      </>
                    )}
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

export function trimStringWithEllipsis(str) {
  const maxLength = 30;
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "...";
  }
  return str;
}
