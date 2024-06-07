import { createContext, useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
const ChatContext = createContext();

export default ChatContext;

export const ChatProvider = ({ children }) => {
  let location = useLocation();
  const { user } = useContext(AuthContext);
  const [channelsConversations, setChannelsConversations] = useState([]);
  const [directsConversations, setDirectsConversations] = useState([]);
  const [directsImages, setDirectsImages] = useState([]);
  let [isBlur, setIsBlur] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState({
    name: "",
    roomId: "",
  });
  const [selectedDirect, setSelectedDirect] = useState( {
    name: "",
    status : "",
    avatar : "",
  })

  useEffect(() => {
    const fetchImages = async () => {
      const promises = directsConversations.map(async (user) => {
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
      console.log("images: " ,images)
      setDirectsImages(images);
    };
    if (directsConversations) {
      // let loadingImage = []
      // for (let i = 0; i < directsConversations.length; i++)
      //     loadingImage.push(Icons.solidGrey)
      // setDirectsImages(loadingImage)
      fetchImages();
    }
  }, [directsConversations]);

  useEffect(() => {
    const fetchChannelsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/channels/${user}`
        );
        const data = await response.json();
        setChannelsConversations(data);
        console.log("inside the context channels", data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchDirectsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/users/firendwithdirects/${user}`
        );
        const data = await response.json();
        setDirectsConversations(data);
        console.log("inside the context Friends: ", data);
      } catch (error) {
        console.log(error);
      }
    };
    if (user && location.pathname === "/mainpage/chat") {
      console.log("inside the context user: ", user);
      fetchChannelsWithMessage();
      fetchDirectsWithMessage();
    }
  }, [location.pathname, user]);

  let contextData = {
    channelsConversations: channelsConversations,
    setChannelsConversations: setChannelsConversations,
    directsConversations: directsConversations,
    setDirectsConversations: setDirectsConversations,
    setSelectedChannel: setSelectedChannel,
    selectedChannel: selectedChannel,
    directsImages : directsImages,
    setDirectsImages : setDirectsImages,
    selectedDirect : selectedDirect,
    setSelectedDirect: setSelectedDirect,
    isBlur : isBlur,
    setIsBlur: setIsBlur,
  };
  return (
    <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>
  );
};
