import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();
import { resetUnreadMessages } from "../Chat/chatConversationItem";
export default ChatContext;

export const ChatProvider = ({ child }) => {
  const listInnerRef = useRef();
  const [currPage, setCurrPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  let location = useLocation();
  const { user, chatSocket } = useContext(AuthContext);
  const [isHome, setIsHome] = useState(true);
  const [chatRoomConversations, setChatRoomConversations] = useState([]);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
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
  const selectedChatRoomRef = useRef(selectedChatRoom);

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
    selectedChatRoomRef.current = selectedChatRoom;
  }, [selectedChatRoom]);

  useEffect(() => {
    chatRoomConversationsRef.current = chatRoomConversations;
  }, [chatRoomConversations]);

  useEffect(() => {
    chatRoomInvitationsRef.current = chatRoomInvitations;
  }, [chatRoomInvitations]);
  const CHAT_PATH = "/mainpage/chat";
  const GROUPS_PATH = "/mainpage/groups";
  //add user to channel Group
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
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRooms/${user}`
        );
        const data = await response.json();
        setChatRoomConversations(data);
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
      if (user && location.pathname === "/mainpage/groups") {
        fetchChatRoomInvitations();
        fetchSuggestedChatRooms();
      }
    }
  }, [location.pathname, user]);

  console.log("SELECTED DIRECT ", selectedDirect);

  useEffect(() => {
    const fetchDirectsWithMessage = async () => {
      console.log("fetching direct conversations");
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/firendwithdirects/${user}?page=${currPage}`
        );
        const { next, results } = await response.json();
        if (response.ok) {
          setDirectConversations([...directConversations, ...results]);
          if (!next) setHasMore(false);
          const currentSelectdDirect = selectedDirectRef.current;
          console.log("currentSelectdDirect ", currentSelectdDirect);
          if (Object.values(currentSelectdDirect).every((value) => value !== "")) {
            let currentDirects = results;
            const conversationExists = currentDirects.some(
              (conv) => conv.name === currentSelectdDirect.name
            );
            if (!conversationExists) {
              const newConversation = {
                id: currentSelectdDirect.id,
                name: currentSelectdDirect.name,
                avatar: currentSelectdDirect.avatar,
                is_online: currentSelectdDirect.status,
                lastMessage: "",
                unreadCount: "0",
              };
              setDirectConversations((prevConversations) => [
                ...prevConversations,
                newConversation,
              ]);
            } else {
              let allDirects = results;
              const updatedDirects = allDirects.map((friend) => {
                if (currentSelectdDirect.id === friend.id) {
                  return { ...friend, unreadCount: 0 };
                }
                return friend;
              });
              setDirectConversations(updatedDirects);
              resetUnreadMessages(user, currentSelectdDirect.id);
            }
          }
        } else console.error("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if ( user && (location.pathname === CHAT_PATH || location.pathname === GROUPS_PATH) && hasMore) {
      fetchDirectsWithMessage();
    }
  }, [location.pathname, currPage, user, selectedDirect]);

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        setCurrPage(currPage + 1);
      }
    }
  };
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
    selectedItem: selectedItem,
    setSelectedItem: setSelectedItem,
    suggestedChatRoomsRef: suggestedChatRoomsRef,
    selectedChatRoomRef: selectedChatRoomRef,
    onScroll: onScroll,
    listInnerRef: listInnerRef,
  };
  return (
    <ChatContext.Provider value={contextData}>{child}</ChatContext.Provider>
  );
};
