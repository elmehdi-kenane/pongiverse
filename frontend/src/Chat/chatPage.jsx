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
import GameNotifications from '../GameNotif/GameNotifications'
const Chat = () => {
  const {
    selectedDirectRef,
    selectedChatRoomRef,
    selectedDirect,
    selectedChatRoom,
    setSelectedDirect,
    setSelectedChatRoom,
    chatRooms,
    setChatRooms,
  } = useContext(ChatContext);

  const { chatSocket, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [chatRoomMessages, setChatRoomMessages] = useState([]);
  const [hasMoreDirects, setHasMoreDirects] = useState(true);
  const [currentDirectPage, setCurrentDirectPage] = useState(1);
  const [directs, setDirects] = useState([]);
  const [currentChatRoomPage, setCurrentChatRoomPage] = useState(1);
  const [hasMoreChatRooms, setHasMoreChatRooms] = useState(true);
  const chatRoomsListInnerRef = useRef(null);
  const directsListInnerRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [directsSearch, setDirectsSearch] = useState([]);
  const [chatRoomsSearch, setChatRoomsSearch] = useState([]);


  useEffect(() => {
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

    const handleChatRoomNewMesssage = (data) => {
      const currentRoom = selectedChatRoomRef.current;
      if (currentRoom.id === data.roomId) {
        setChatRoomMessages((prev) => [...prev, data]);
        setChatRooms((prevConversations) =>
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
        setChatRooms((prevConversations) =>
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

    const moveDirectToTop = (senderId, receiverId) => {
      setDirects((prevConversations) => {
        const updatedDirects = prevConversations.filter(
          (friend) => friend.id !== senderId && friend.id !== receiverId
        );
        const friendToMove = prevConversations.find(
          (friend) => friend.id === senderId || friend.id === receiverId
        );
        return [friendToMove, ...updatedDirects];
      });
    };

    const moveChatRoomToTop = (roomId) => {
      setChatRooms((prevConversations) => {
        const updatedRooms = prevConversations.filter(
          (room) => room.id !== roomId
        );
        const roomToMove = prevConversations.find((room) => room.id === roomId);
        return [roomToMove, ...updatedRooms];
      });
    };

    const chatRoomDeleted = (roomId) => {
      const currentChatRooms = chatRooms;
      const updatedChatRooms = currentChatRooms.filter(
        (room) => room.id !== roomId
      );
      console.log("UPDATED CHAT ROOMS: ", updatedChatRooms);
      setChatRooms(updatedChatRooms);
      setSelectedChatRoom({
        id: "",
        name: "",
        membersCount: "",
        icon: "",
        cover: "",
        topic: "",
      });
    };

    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("DATA: ", data.type);
        if (data.type === "newDirect") {
          handleNewDirectMessage(data.data);
          moveDirectToTop(data.data.senderId, data.data.receiverId);
        } else if (data.type === "newMessage") {
          handleChatRoomNewMesssage(data.data);
          moveChatRoomToTop(data.data.roomId);
        } else if (data.type === "goToGamingPage") {
          navigate("/mainpage/game/solo/1vs1/friends");
        } else if (
          data.type === "chatRoomLeft" ||
          data.type === "chatRoomDeleted"
        ) {
          chatRoomDeleted(data.roomId);
        } else if (data.type === "youAreBlocked") {
          setDirects((prevConversations) => {
            const updatedDirects = prevConversations.filter(
              (friend) => friend.id !== data.data.id
            );
            return updatedDirects;
          });
          setSelectedDirect({
            id: "",
            name: "",
            avatar: "",
            status: "",
          });
        }
      };
    }
  }, [currentChatRoomPage, user, chatSocket]);


  useEffect(() => {
    const fetchDirectsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/firendwithdirects/${user}?page=${currentDirectPage}`, {
          credentials: 'include'
        }
        );
        const { next, results } = await response.json();
        if (response.ok) {
          // console.log("RESPONSE: ", response)
          setDirects((prevConversations) => {
            let allDirects = [...prevConversations, ...results];
            if (Object.values(selectedDirect).every((value) => value !== "")) {
              const conversationExists = allDirects.some(
                (conv) => conv.id === selectedDirect.id
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
                allDirects = [newConversation, ...allDirects];
              } else {
                resetUnreadMessages(user, selectedDirect.id);
              }
            }
            // check if thiere is duplicates
            const seen = new Set();
            const filteredDirects = allDirects.filter((el) => {
              const duplicate = seen.has(el.id);
              seen.add(el.id);
              return !duplicate;
            });
            return filteredDirects;
          });

          if (!next) setHasMoreDirects(false);
        } else console.error("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if (user) fetchDirectsWithMessage();
  }, [currentDirectPage, user, selectedDirect]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRooms/${user}?page=${currentChatRoomPage}`, {
            credentials: 'include'
        }
        );
        const { next, results } = await response.json();
        console.log("CHAT ROOMS: ", results);
        if (response.ok) {
          setChatRooms((prevConversations) => {
            let allChatRooms = [...prevConversations, ...results];
            if (
              Object.values(selectedChatRoom).every((value) => value !== "")
            ) {
              const conversationExists = allChatRooms.some(
                (conv) => conv.id === selectedChatRoom.id
              );
              if (!conversationExists) {
                const newConversation = {
                  id: selectedChatRoom.id,
                  name: selectedChatRoom.name,
                  membersCount: selectedChatRoom.membersCount,
                  icon: selectedChatRoom.icon,
                  cover: selectedChatRoom.cover,
                  topic: selectedChatRoom.topic,
                  lastMessage: "",
                  unreadCount: "0",
                };
                allChatRooms = [newConversation, ...allChatRooms];
              } else {
                resetChatRoomUnreadMessages(user, selectedChatRoom.id);
              }
            }
            // check if thiere is duplicates
            const seen = new Set();
            const filteredChatRooms = allChatRooms.filter((el) => {
              const duplicate = seen.has(el.id);
              seen.add(el.id);
              return !duplicate;
            });
            return filteredChatRooms;
          });
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
      if (scrollTop + clientHeight === scrollHeight && hasMoreDirects) {
        setCurrentDirectPage((prev) => prev + 1);
      }
    }
  };
  const chatRoomsOnScroll = () => {
    console.log("scrolling chat rooms");
    if (chatRoomsListInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatRoomsListInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight && hasMoreChatRooms) {
        setCurrentChatRoomPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="chat-page">
      <Toaster />
      <GameNotifications setDirects={setDirects} directs={directs} setSelectedDirect={setSelectedDirect}/>
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
          setChatRoomMessages={setChatRoomMessages}
          setMessages={setMessages}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          directsSearch={directsSearch}
          setDirectsSearch={setDirectsSearch}
          chatRoomsSearch={chatRoomsSearch}
          setChatRoomsSearch={setChatRoomsSearch}
        />
        <ChatWindow
          messages={messages}
          setMessages={setMessages}
          chatRoomMessages={chatRoomMessages}
          setChatRoomMessages={setChatRoomMessages}
          directs={directs}
          setDirects={setDirects}
          chatRooms={chatRooms}
          setChatRooms={setChatRooms}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          directsSearch={directsSearch}
          chatRoomsSearch={chatRoomsSearch}
          setDirectsSearch={setDirectsSearch}
          setChatRoomsSearch={setChatRoomsSearch}
        />
      </div>
    </div>
  );
};

export default Chat;
