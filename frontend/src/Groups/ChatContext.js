import { createContext, useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();

export default ChatContext;

export const ChatProvider = ({ children }) => {
  let location = useLocation();
  const { user } = useContext(AuthContext);
  const [chatRoomConversations, setChatRoomConversations] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const [directsImages, setDirectsImages] = useState([]);
  const [chatRoomIcons, setChatRoomIcons] = useState([]);
  const [isHome, setIsHome] = useState(true);
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

  useEffect(() => {
    const fetchImages = async () => {
      const promises = directConversations.map(async (user) => {
        const response = await fetch(`http://localhost:8000/api/getImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: user.image,
          }),
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
      const images = await Promise.all(promises);
      setDirectsImages(images);
    };
    if (directConversations) {
      fetchImages();
    }
  }, [directConversations]);

  useEffect(() => {
    const fetchImages = async () => {
      const promises = chatRoomConversations.map(async (room) => {
        console.log(room.name);
        const response = await fetch(`http://localhost:8000/api/getImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: room.icon_url,
          }),
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
      const images = await Promise.all(promises);
      setChatRoomIcons(images);
    };
    if (chatRoomConversations.length !== 0) {
      fetchImages();
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
    if (user && location.pathname === "/mainpage/chat") {
      console.log("inside the context user: ", user);
      fetchChatRooms();
      fetchDirectsWithMessage();
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
  };
  return (
    <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>
  );
};
