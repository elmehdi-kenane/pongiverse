import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import { use } from "react";
const ChatContext = createContext();
export default ChatContext;

export const ChatProvider = ({ child }) => {
  let location = useLocation();
  const navigate = useNavigate();
  const { user, chatSocket } = useContext(AuthContext);
  const [isHome, setIsHome] = useState(true);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const chatRoomInvitationsRef = useRef(chatRoomInvitations);
  const suggestedChatRoomsRef = useRef(suggestedChatRooms);
  const [allFriends, setAllFriends] = useState([]);
  const allFriendsRef = useRef(allFriends);
  const [allChatRoomMembers, setAllChatRoomMembers] = useState([]);
  // const [directs, setDirects] = useState([]);
  const [myChatRooms, setMyChatRooms] = useState([]);
  const myChatRoomsRef = useRef(myChatRooms);
  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  useEffect(() => {
    myChatRoomsRef.current = myChatRooms;
  }, [myChatRooms]);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    allFriendsRef.current = allFriends;
  }, [allFriends]);

  const [selectedChatRoom, setSelectedChatRoom] = useState({
    id: "",
    name: "",
    membersCount: "",
    icon: "",
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
    const fetchChatRoomInvitations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/chatAPI/chatRoomInvitations/${user}`,
          {
            credentials: "include",
          }
        );
        let data = await response.json();
        if (response.ok) {
          setChatRoomInvitations(data);
        } else if (response.status === 401) {
          navigate('/signin')
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSuggestedChatRooms = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/chatAPI/suggestedChatRooms/${user}`,
          {
            credentials: "include",
          }
        );
        let data = await response.json();
        if (response.ok) {
          setSuggestedChatRooms(data);
        } else if (response.status === 401)
          navigate('/signin')
        else console.log("opps!, something went wrong");
      } catch (error) {
        console.log(error);
      }
    };
    if (user && location.pathname === "/mainpage/groups") {
      fetchChatRoomInvitations();
      fetchSuggestedChatRooms();
      // fetchAllFriends();
    } else if (user && location.pathname === "/mainpage/chat") {
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
    allFriends: allFriends,
    setAllFriends: setAllFriends,
    allFriendsRef: allFriendsRef,
    allChatRoomMembers: allChatRoomMembers,
    myChatRooms: myChatRooms,
    setMyChatRooms: setMyChatRooms,
    myChatRoomsRef: myChatRoomsRef,
    hasMoreRooms: hasMoreRooms,
    setHasMoreRooms: setHasMoreRooms,
  };
  return (
    <ChatContext.Provider value={contextData}>{child}</ChatContext.Provider>
  );
};
