import "../assets/chat/Chat.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import ChatContext from "../Context/ChatContext";
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
    setChatRoomConversations,
    selectedChatRoomRef,
    selectedDirect,
  } = useContext(ChatContext);

  const { chatSocket, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [hasMoreDirects, setHasMoreDirects] = useState(true);
  const [currentDirectPage, setCurrentDirectPage] = useState(1);
  const [directs, setDirects] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentChatRoomPage, setCurrentChatRoomPage] = useState(1);
  const [hasMoreChatRooms, setHasMoreChatRooms] = useState(true);
  const chatRoomsListInnerRef = useRef(null);
  const directsListInnerRef = useRef(null);
  useEffect(() => {
    if (!chatSocket) return;

    const handleNewDirectMessage = (data) => {
      const currentDirect = selectedDirectRef.current;

      const isCurrentSender =
        currentDirect.name === data.sender || user === data.sender;
      if (isCurrentSender) {
        setMessages((prev) => [...prev, data]);
        setDirects((prevConversations) =>
          prevConversations.map((friend) =>
            friend.id === data.senderId || friend.id === data.receiverId
              ? { ...friend, lastMessage: data.content }
              : friend
          )
        );
        resetUnreadMessages(user, currentDirect.id);
      } else {
        setDirects((prevConversations) => {
          const conversationExists = prevConversations.some(
            (conv) => conv.name === data.sender
          );

          if (!conversationExists) {
            const newConversation = {
              id: data.senderId,
              name: data.sender,
              avatar: data.senderAvatar,
              lastMessage: data.content,
              unreadCount: "1",
            };
            return [newConversation, ...prevConversations];
          }

          return prevConversations.map((friend) =>
            friend.id === data.senderId
              ? {
                  ...friend,
                  unreadCount: String(Number(friend.unreadCount) + 1),
                  lastMessage: data.content,
                }
              : friend
          );
        });
      }
    };

    const handleNewMessage = (data) => {
      const currentRoom = selectedChatRoomRef.current;

      if (currentRoom.roomId === data.roomId) {
        setMessages((prev) => [...prev, data]);
        setChatRoomConversations((prevConversations) =>
          prevConversations.map((room) =>
            room.id === data.roomId
              ? { ...room, lastMessage: data.content }
              : room
          )
        );
        if (data.sender !== user) {
          resetChatRoomUnreadMessages(user, data.roomId);
        }
      } else {
        setChatRoomConversations((prevConversations) =>
          prevConversations.map((room) =>
            room.id === data.roomId
              ? {
                  ...room,
                  unreadCount: String(Number(room.unreadCount) + 1),
                  lastMessage: data.content,
                }
              : room
          )
        );
      }
    };

    const handleMessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "newDirect") {
        handleNewDirectMessage(data.data);
      } else if (data.type === "newMessage") {
        handleNewMessage(data.data);
      } else if (data.type === "goToGamingPage") {
        console.log("Navigating to gaming page");
        navigate("/mainpage/game/solo/1vs1/friends");
      }
    };

    chatSocket.onmessage = handleMessage;

    return () => {
      chatSocket.onmessage = null;
    };
  }, [chatSocket]);

  useEffect(() => {
    const fetchDirectsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/firendwithdirects/${user}?page=${currentDirectPage}`
        );
        const { next, results } = await response.json();
        if (response.ok) {
          console.log("Directs: ",results.length);
          console.log(next);
          setDirects([...directs, ...results]);
          if (!next) setHasMoreDirects(false);
          if (Object.values(selectedDirect).every((value) => value !== "")) {
            let currentDirects = results;
            const conversationExists = currentDirects.some(
              (conv) => conv.name === selectedDirect.name
            );
            if (!conversationExists) {
              const newConversation = {
                id: selectedDirect.id,
                name: selectedDirect.name,
                avatar: selectedDirect.avatar,
                is_online: selectedDirect.status,
                lastMessage: "",
                unreadCount: "0",
              };
              setDirects((prevConversations) => [
                newConversation,
                ...prevConversations,
              ]);
            } else {
              let allDirects = results;
              const updatedDirects = allDirects.map((friend) => {
                if (selectedDirect.id === friend.id) {
                  return { ...friend, unreadCount: 0 };
                }
                return friend;
              });
              setDirects(updatedDirects);
              resetUnreadMessages(user, selectedDirect.id);
            }
          }
        } else console.error("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if (user) fetchDirectsWithMessage();
  }, [currentDirectPage, user]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRooms/${user}?page=${currentChatRoomPage}`
        )
        const {next, results} = await response.json();
        if (response.ok) {
          console.log("Rooms: ",results.length);
          setChatRooms([...chatRooms, ...results]);
          if (!next) setHasMoreChatRooms(false);
        } else console.error("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchChatRooms();
    }
  }, [currentChatRoomPage, user]);

  const directsOnScroll = () => {
    console.log("scrolling directs");
    if (directsListInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        directsListInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight - 1 && hasMoreDirects) {
        setCurrentDirectPage((prev) => prev + 1);
      }
    }
  };
  const chatRoomsOnScroll = () => {
    console.log("scrolling chat rooms");
    if (chatRoomsListInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatRoomsListInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight - 1 && hasMoreChatRooms) {
        setCurrentChatRoomPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="chat-page">
      <Toaster />
      <div className="chat-container">
        <ChatSideBar
          directs={directs}
          setDirects={setDirects}
          directsOnScroll={directsOnScroll}
          directsListInnerRef={directsListInnerRef}
          chatRooms={chatRooms}
          setChatRooms={setChatRooms}
          chatRoomsOnScroll={chatRoomsOnScroll}
          chatRoomsListInnerRef={chatRoomsListInnerRef}
        />
        <ChatWindow messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
};

export default Chat;
