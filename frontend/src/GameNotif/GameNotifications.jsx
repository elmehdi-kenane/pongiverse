import React, { useState, useEffect, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import * as Icons from "../assets/navbar-sidebar";
import AuthContext from "../navbar-sidebar/Authcontext";
import styles from "../assets/Game/gamemodes.module.css";
import playSoloImage from "../assets/Game/playSoloMode.svg";
import createTournamentImage from "../assets/Game/createTournamentMode.svg";
import joinTournamentImage from "../assets/Game/joinTournamentMode.svg";
import toast, { Toaster } from "react-hot-toast";
const GameNotifications = () => {
    const [roomID, setRoomID] = useState(null)
    let { socket, user, setAllGameNotifs,
        allGameNotifs, notifsImgs, notifSocket,
        setSocket, socketRef } = useContext(AuthContext)
    const gamePlayRegex = /^\/mainpage\/(game|play)(\/[\w\d-]*)*$/;
    const navigate = useNavigate()
    const location = useLocation()
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

    const notifyError = (message) =>
        toast.error(message, {
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
                    }
                    else if (data.Case === "User_is_in_tournament")
                        navigate("/mainpage/game/createtournament");
                    else if (data.Case === "Tournament_started" || data.Case === "Tournament_is_full") {
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
        setAllGameNotifs((prevGameNotif) => prevGameNotif.filter((notif) => notif.tournament_id === tournament_id && notif.user === user));
    };


    useEffect(() => {
        if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            notifSocket.onmessage = (event) => {
                let data = JSON.parse(event.data);
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
                    notifyError("your game In tournament will start in 15 seconds");
                } else if (type === "invited_to_tournament") {
                    setAllGameNotifs((prevGameNotif) => {
                        const isDuplicate = prevGameNotif.some(
                            (notif) => notif.tournament_id === message.tournament_id && notif.user === message.user);
                        if (!isDuplicate)
                            return [...prevGameNotif, message];
                        return prevGameNotif;
                    });
                } else if (type === "deny_tournament_invitation") {
                    setAllGameNotifs(
                        allGameNotifs.filter((user) => user.user !== message.user)
                    );
                } else if (type === 'remove_tournament_notif')
                    removeNotification(message.tournament_id, message.user);
            };
        }
    }, [notifSocket]);

    return (
        <>
            <div className="cancel-game-invite-request">
                {allGameNotifs.length ? (
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
