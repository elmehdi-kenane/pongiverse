import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();

export default ChatContext;

export const ChatProvider = ({ children }) => {
  let location = useLocation();
  const { user } = useContext(AuthContext);
  const [isHome, setIsHome] = useState(true);
  const [chatRoomConversations, setChatRoomConversations] = useState([]);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const chatRoomConversationsRef = useRef(chatRoomConversations);
  const chatRoomInvitationsRef = useRef(chatRoomInvitations);
  const [selectedChatRoom, setSelectedChatRoom] = useState({
    name: "",
    memberCount: "",
    icon: "",
    roomId: "",
  });
  const [selectedDirect, setSelectedDirect] = useState({
    name: "",
    status: "",
    avatar: "",
  });
  const [unreadCount, setUnreadCount] = useState(new Map());

  useEffect(() => {
    chatRoomConversationsRef.current = chatRoomConversations;
  }, [chatRoomConversations]);

  useEffect(() => {
    chatRoomInvitationsRef.current = chatRoomInvitations;
  }, [chatRoomInvitations]);

  const selectedChatRoomRef = useRef(selectedChatRoom);
  useEffect(() => {
    selectedChatRoomRef.current = selectedChatRoom;
  }, [selectedChatRoom]);


  useEffect(() => {
    if (directConversations.length) {
      const updatedUnreadCounts = new Map(
        directConversations.map(friend => [friend.id, friend.unreadCount])
      );
      setUnreadCount(updatedUnreadCounts);
    }
  }, [directConversations]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRooms/${user}`
        );
        const data = await response.json();
        setChatRoomConversations(data);
        console.log("inside the context channels", data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchDirectsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/firendwithdirects/${user}`
        );
        const data = await response.json();
        if(response.ok)
          setDirectConversations(data);
        else
          console.error("opps!, something went wrong")
      } catch (error) {
        console.log(error);
      }
    };

    const fetchChatRoomInvitations = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRoomInvitations/${user}`
        );
        let data = await response.json();
        setChatRoomInvitations(data);
        console.log("invitations: ", data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSuggestedChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/suggestedChatRooms/${user}`
        );
        let data = await response.json();
        setSuggestedChatRooms(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (
      user &&
      (location.pathname === "/mainpage/chat" ||
        location.pathname === "/mainpage/groups")
    ) {
      fetchChatRooms();
      fetchDirectsWithMessage();
      if (user && location.pathname === "/mainpage/groups") {
        fetchChatRoomInvitations();
        fetchSuggestedChatRooms();
      }
    }
  }, [location.pathname, user]);

  let contextData = {
    chatRoomConversations: chatRoomConversations,
    setChatRoomConversations: setChatRoomConversations,
    directConversations: directConversations,
    setDirectConversations: setDirectConversations,
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
    chatRoomConversationsRef: chatRoomConversationsRef,
    chatRoomInvitationsRef: chatRoomInvitationsRef,
    selectedChatRoomRef,
    unreadCount : unreadCount,
    setUnreadCount: setUnreadCount,
  };
  return (
    <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>
  );
};
