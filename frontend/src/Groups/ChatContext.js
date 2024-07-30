import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();

export default ChatContext;

export const ChatProvider = ({ children }) => {
  let location = useLocation();
  const { user } = useContext(AuthContext);
  const [chatRoomConversations, setChatRoomConversations] = useState([]);
  const [chatRoomInvitations, setChatRoomInvitations] = useState([]);
  const [suggestedChatRooms, setSuggestedChatRooms] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const [directsImages, setDirectsImages] = useState([]);
  const [chatRoomIcons, setChatRoomIcons] = useState([]);
  const [chatRoomInvitationsIcons, setChatRoomInvitionsIcons] = useState([]);
  const [suggestedChatRoomsIcons, setSuggestedChatRoomsIcons] = useState([]);
  const [isHome, setIsHome] = useState(true);
  const chatRoomConversationsRef = useRef(chatRoomConversations);

useEffect(() => {
  chatRoomConversationsRef.current = chatRoomConversations;
}, [chatRoomConversations]);

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

  const fetchImages = async (items, key) => {
    const promises = items.map(async (item) => {
      const response = await fetch(`http://localhost:8000/api/getImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: item[key],
        }),
      });
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    });
    return await Promise.all(promises);
  };  

  useEffect(() => {
    const fetchDirectConversationsImages = async () => {
      const images = await fetchImages(directConversations, 'image');
      setDirectsImages(images);
    };
  
    if (directConversations.length) {
      fetchDirectConversationsImages();
    }
  }, [directConversations]);
  
  useEffect(() => {
    const fetchChatRoomInvitationsIcons = async () => {
      const images = await fetchImages(chatRoomInvitations, 'icon_url');
      setChatRoomInvitionsIcons(images);
    };
  
    if (chatRoomInvitations.length) {
      fetchChatRoomInvitationsIcons();
    }
  }, [chatRoomInvitations]);
  
  useEffect(() => {
    const fetchSuggestedChatRoomsIcons = async () => {
      const images = await fetchImages(suggestedChatRooms, 'icon_url');
      setSuggestedChatRoomsIcons(images);
    };
  
    if (suggestedChatRooms.length) {
      fetchSuggestedChatRoomsIcons();
    }
  }, [suggestedChatRooms]);
  
  useEffect(() => {
    const fetchChatRoomConversationsIcons = async () => {
      const images = await fetchImages(chatRoomConversations, 'icon_url');
      setChatRoomIcons(images);
    };
  
    if (chatRoomConversations.length) {
      fetchChatRoomConversationsIcons();
    }
  }, [chatRoomConversations]);
  
  useEffect(() => {

    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/chatRooms/${user}`
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
          `http://localhost:8000/profile/firendwithdirects/${user}`
        );
        const data = await response.json();
        console.log(data);
        setDirectConversations(data);
        console.log("inside the context Friends: ", data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchChatRoomInvitations = async () => {
      try {
        const response = await fetch (
          `http://localhost:8000/chatAPI/chatRoomInvitations/${user}`
        )
        let data = await response.json()
        setChatRoomInvitations(data)
      }
      catch (error) {
        console.log(error)
      }
    }

    const fetchSuggestedChatRooms = async () => {
      try {
        const response = await fetch (
          `http://localhost:8000/chatAPI/suggestedChatRooms/${user}`
        )
        let data = await response.json()
        setSuggestedChatRooms(data)
      }
      catch (error) {
        console.log(error)
      }
    }
    if (user && (location.pathname === "/mainpage/chat" || location.pathname === "/mainpage/groups")) {
      fetchChatRooms();
      fetchDirectsWithMessage();
    if(user && location.pathname === '/mainpage/groups') {
      fetchChatRoomInvitations()
      fetchSuggestedChatRooms()
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
    directsImages: directsImages,
    chatRoomIcons: chatRoomIcons,
    setDirectsImages: setDirectsImages,
    selectedDirect: selectedDirect,
    setSelectedDirect: setSelectedDirect,
    isHome: isHome,
    setIsHome: setIsHome,
    chatRoomInvitations: chatRoomInvitations,
    setChatRoomInvitations: setChatRoomInvitations,
    chatRoomInvitationsIcons:chatRoomInvitationsIcons,
    suggestedChatRooms: suggestedChatRooms,
    setSuggestedChatRooms: setSuggestedChatRooms,
    suggestedChatRoomsIcons:suggestedChatRoomsIcons
  };
  return (
    <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>
  );
};
