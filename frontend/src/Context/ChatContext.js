import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();
import { resetUnreadMessages } from "../Chat/chatConversationItem";
export default ChatContext;

export const ChatProvider = ({ children }) => {
  let location = useLocation();
  const { user } = useContext(AuthContext);
  const [isHome, setIsHome] = useState(true);
  const [chatRoomConversations, setChatRoomConversations] = useState([]);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const chatRoomConversationsRef = useRef(chatRoomConversations);
  const chatRoomInvitationsRef = useRef(chatRoomInvitations);
  const directConversationsRef = useRef(directConversations);
  const suggestedChatRoomsRef = useRef(suggestedChatRooms);
  const [selectedChatRoom, setSelectedChatRoom] = useState({
    name: "",
    memberCount: "",
    icon: "",
    roomId: "",
  });
  const [selectedDirect, setSelectedDirect] = useState({
    id: "",
    name: "",
    status: "",
    avatar: "",
  });
  const selectedDirectRef = useRef(selectedDirect);

  useEffect(() => {
    suggestedChatRoomsRef.current = suggestedChatRooms;
  }, [suggestedChatRooms]);

  useEffect(() => {
    directConversationsRef.current = directConversations;
  }, [directConversations]);

  useEffect(() => {
    selectedDirectRef.current = selectedDirect;
  }, [selectedDirect]);

  useEffect(() => {
    chatRoomConversationsRef.current = chatRoomConversations;
  }, [chatRoomConversations]);

  useEffect(() => {
    chatRoomInvitationsRef.current = chatRoomInvitations;
  }, [chatRoomInvitations]);

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
        // console.log("inside the context channels", data);
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
        if (response.ok) {
          setDirectConversations(data);
          if (Object.values(selectedDirect).every((value) => value !== "")) {
            let currentDirects = data;
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
              setDirectConversations((prevConversations) => [
                ...prevConversations,
                newConversation,
              ]);
            }
            else {
              let allDirects = data;
              const updatedDirects = allDirects.map((friend) => {
                if (selectedDirect.id === friend.id) {
                  return { ...friend, unreadCount: 0 };
                }
                return friend;
              });
              setDirectConversations(updatedDirects)
              resetUnreadMessages(user, selectedDirect.id)
            }
          }
        } else console.error("opps!, something went wrong");
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
        if (response.ok) {
          console.log("invitations: ", data);
          setChatRoomInvitations(data);
        }
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
        if (response.ok) {
          console.log("Suggested: ", data);
          setSuggestedChatRooms(data);
        } else console.log("opps!, something went wrong");
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
    selectedDirectRef: selectedDirectRef,
    directConversationsRef: directConversationsRef,
    messages: messages,
    setMessages: setMessages,
    selectedItem: selectedItem,
    setSelectedItem: setSelectedItem,
    suggestedChatRoomsRef: suggestedChatRoomsRef,
  };
  return (
    <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>
  );
};
