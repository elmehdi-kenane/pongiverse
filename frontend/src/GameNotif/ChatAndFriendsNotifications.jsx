import React, { useState, useEffect, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";

const ChatAndFriendsNotifications = () => {

    const [roomID, setRoomID] = useState(null);
    let {
        user,
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

    useEffect(() => {
        if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            notifSocket.onmessage = (event) => {
                let data = JSON.parse(event.data);
                let type = data.type;
                let message = data.message;
                const friendsData =
                {
                    message: message,
                    type: type,
                };
                if (data.type === "chatNotificationCounter" && location.pathname !== "/mainpage/chat") {
                    setChatNotificationCounter(data.count);
                  } 
            };
        }
    }, [notifSocket, location.pathname]);
    return (
        <></>
    );
}

export default ChatAndFriendsNotifications;