import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import { use } from "react";
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
  const [allFriends, setAllFriends] = useState([]);
  const allFriendsRef = useRef(allFriends);
  const [allChatRoomMembers, setAllChatRoomMembers] = useState([]);
  // const [directs, setDirects] = useState([]);
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
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRoomInvitations/${user}`,{
            credentials: "include"
          }
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
          }:8000/chatAPI/suggestedChatRooms/${user}`,
          {
            credentials: "include",
          }
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
  };
  return (
    <ChatContext.Provider value={contextData}>{child}</ChatContext.Provider>
  );
};
