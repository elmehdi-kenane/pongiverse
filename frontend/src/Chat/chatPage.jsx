import "../assets/chat/Chat.css";
import ChatContext from "../Context/ChatContext";
import { useContext, useEffect, useState } from "react";

import { Toaster } from "react-hot-toast";
import AuthContext from "../navbar-sidebar/Authcontext";
import {
  resetUnreadMessages,
  resetChatRoomUnreadMessages,
} from "./chatConversationItem";
import ChatSideBar from "./chatPageSidebar";
import ChatWindow from "./chatPageWindow";
const Chat = () => {
  const {
    selectedDirectRef,
    setDirectConversations,
    setChatRoomConversations,
    selectedChatRoomRef,
  } = useContext(ChatContext);
  const { chatSocket, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "newDirect") {
          const currentDirect = selectedDirectRef.current;
          if (
            currentDirect.name === data.data.sender ||
            user === data.data.sender
          ) {
            if (data.data) {
              setMessages((prev) => [...prev, data.data]);
              setDirectConversations((prevConversations) => {
                return prevConversations.map((friend) => {
                  if (
                    data.data.senderId === friend.id ||
                    data.data.receiverId === friend.id
                  ) {
                    return {
                      ...friend,
                      lastMessage: data.data.content,
                    };
                  }
                  return friend;
                });
              });
              if (currentDirect.id) resetUnreadMessages(user, currentDirect.id);
            }
          } else {
            setDirectConversations((prevConversations) => {
              const conversationExists = prevConversations.some(
                (conv) => conv.name === data.data.sender
              );

              if (!conversationExists) {
                console.log("conversation is not found");

                const newConversation = {
                  id: data.data.senderId,
                  name: data.data.sender,
                  avatar: data.data.senderAvatar,
                  lastMessage: data.data.content,
                  unreadCount: "1",
                };

                console.log("newConversation ", newConversation);
                return [...prevConversations, newConversation];
              }

              return prevConversations.map((friend) => {
                if (data.data.senderId === friend.id) {
                  return {
                    ...friend,
                    unreadCount: String(Number(friend.unreadCount) + 1),
                    lastMessage: data.data.content,
                  };
                }
                return friend;
              });
            });
          }
        } else if (data.type === "goToGamingPage") {
          console.log("navigating now");
          navigate(`/mainpage/game/solo/1vs1/friends`);
        } else if (data.type === "newMessage") {
          let currentRoom = selectedChatRoomRef.current;
          if (currentRoom.roomId === data.data.roomId) {
            setMessages((prev) => [...prev, data.data]);
            setChatRoomConversations((prevConversations) => {
              return prevConversations.map((room) => {
                if (room.id === data.data.roomId) {
                  return {
                    ...room,
                    lastMessage: data.data.content,
                  };
                }
                return room;
              });
            });
            if (data.data.sender !== user)
              resetChatRoomUnreadMessages(user, data.data.roomId);
          } else {
            setChatRoomConversations((prevConversations) => {
              return prevConversations.map((room) => {
                if (room.id === data.data.roomId) {
                  return {
                    ...room,
                    unreadCount: String(Number(room.unreadCount) + 1),
                    lastMessage: data.data.content,
                  };
                }
                return room;
              });
            });
          }
        }
      };
    }
  }, [chatSocket]);

  return (
    <div className="chat-page">
      <Toaster />
      <div className="chat-container">
        <ChatSideBar />
        <ChatWindow 
          messages={messages} 
          setMessages={setMessages} 
        />
      </div>
    </div>
  );
};

export default Chat;
