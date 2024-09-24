import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();
export default ChatContext;

export const ChatProvider = ({ child }) => {
  let location = useLocation();
  const { user, chatSocket } = useContext(AuthContext);
  const [isHome, setIsHome] = useState(true);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const chatRoomInvitationsRef = useRef(chatRoomInvitations);
  const suggestedChatRoomsRef = useRef(suggestedChatRooms);
  const [chatRooms, setChatRooms] = useState([]);
  const [myChatRooms, setMyChatRooms] = useState([]);
  const myChatRoomsRef = useRef(myChatRooms);
  const chatRoomsRef = useRef(chatRooms);
  const [socketData, setSocketData] = useState(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState({
    name: "",
    membersCount: "",
    icon: "",
    cover: "",
    roomId: "",
    topic: "",
  });
  const [selectedDirect, setSelectedDirect] = useState({
    id: "",
    name: "",
    status: "",
    avatar: "",
  });
  const selectedDirectRef = useRef(selectedDirect);
  const selectedChatRoomRef = useRef(selectedChatRoom);


  useEffect(() => {
    myChatRoomsRef.current = myChatRooms;
  }, [myChatRooms]);

  useEffect(() => {
    chatRoomsRef.current = chatRooms;
  }, [chatRooms]);


  useEffect(() => {
    suggestedChatRoomsRef.current = suggestedChatRooms;
  }, [suggestedChatRooms]);

  useEffect(() => {
    selectedDirectRef.current = selectedDirect;
  }, [selectedDirect]);

  useEffect(() => {
    selectedChatRoomRef.current = selectedChatRoom;
  }, [selectedChatRoom]);


  useEffect(() => {
    chatRoomInvitationsRef.current = chatRoomInvitations;
  }, [chatRoomInvitations]);

  useEffect(() => {
    const addUserChannelGroup = () => {
      chatSocket.send(
        JSON.stringify({
          type: "addUserChannelGroup",
          user: user,
        })
      );
    };
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      user &&
      (location.pathname === "/mainpage/chat" ||
        location.pathname === "/mainpage/groups")
    )
      addUserChannelGroup();
  }, [chatSocket, user, location.pathname]);


  useEffect(() => {
    console.log("CHAT SOCKET: ", chatSocket);
    if (!chatSocket) return;
    chatSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSocketData(data);
      // if (data.type === "chatRoomInvitation") {
      //   setChatRoomInvitations([...chatRoomInvitationsRef.current, data.data]);
      // } else if (data.type === "chatRoomDeleted" || data.type === "chatRoomLeft") {
      //   console.log("CHAT ROOM DELETED: ", data);
      //   const currentMyChatRooms = chatRoomsRef.current;
      //   const updatedMyChatRooms = currentMyChatRooms.filter(
      //     (room) => room.id !== data.roomId
      //   );
      //   console.log("UPDATED MY CHAT ROOMS: ", updatedMyChatRooms);
      //   setChatRooms(updatedMyChatRooms);
      //   const currentChatRooms = myChatRoomsRef.current;
      //   const updatedChatRooms = currentChatRooms.filter(
      //     (room) => room.id !== data.roomId
      //   );
      //   console.log("UPDATED CHAT ROOMS: ", updatedChatRooms);
      //   setMyChatRooms(updatedChatRooms);
      // }
    }
    return () => {
      chatSocket.onmessage = null;
    }
  }, [chatSocket]);

  useEffect(() => {
    const fetchChatRoomInvitations = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRoomInvitations/${user}`
        );
        let data = await response.json();
        if (response.ok) {
          setChatRoomInvitations(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSuggestedChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/suggestedChatRooms/${user}`
        );
        let data = await response.json();
        if (response.ok) {
          setSuggestedChatRooms(data);
        } else console.log("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if (user && location.pathname === "/mainpage/groups") {
      fetchChatRoomInvitations();
      fetchSuggestedChatRooms();
    }
  }, [location.pathname, user]);

  let contextData = {
    setSelectedChatRoom: setSelectedChatRoom,
    selectedChatRoom: selectedChatRoom,
    selectedDirect: selectedDirect,
    setSelectedDirect: setSelectedDirect,
    isHome: isHome,
    setIsHome: setIsHome,
    chatRoomInvitations: chatRoomInvitations,
    setChatRoomInvitations: setChatRoomInvitations,
    suggestedChatRooms: suggestedChatRooms,
    setSuggestedChatRooms: setSuggestedChatRooms,
    chatRoomInvitationsRef: chatRoomInvitationsRef,
    selectedDirectRef: selectedDirectRef,
    selectedItem: selectedItem,
    setSelectedItem: setSelectedItem,
    suggestedChatRoomsRef: suggestedChatRoomsRef,
    selectedChatRoomRef: selectedChatRoomRef,
    chatRooms: chatRooms,
    setChatRooms: setChatRooms,
    myChatRooms: myChatRooms,
    setMyChatRooms: setMyChatRooms,
    socketData: socketData,
  };
  return (
    <ChatContext.Provider value={contextData}>{child}</ChatContext.Provider>
  );
};
