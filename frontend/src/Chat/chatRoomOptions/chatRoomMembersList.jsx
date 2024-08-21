import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import '../../Profile/Profile.css'
import chatSvg from "../../assets/navbar-sidebar/chat.svg"
const ChatRoomMembersList = (props) => {
  const [chatRoomMembers, setChatRoomMembers] = useState([]);
  const [chatRoomMemberAvatars, setChatRoomMemberAvatars] = useState([]);

  const fetchImages = async (items, key) => {
    const promises = items.map(async (item) => {
      const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/getImage`, {
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
      // return { [item.id]: URL.createObjectURL(blob) };
    });
    return await Promise.all(promises);
  };
  //Fetch Conversations images
  useEffect(() => {
    const fetchChatRoomMemberImages = async () => {
      const images = await fetchImages(chatRoomMembers, "avatar");
      setChatRoomMemberAvatars(images);
    };

    if (chatRoomMembers.length) {
      fetchChatRoomMemberImages();
    }
  }, [chatRoomMembers]);

  
  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/chatRoomMembersList`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              id: props.roomId,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data);
          setChatRoomMembers(data);
        } else toast(data.error);
      } catch (error) {
        console.log(error);
        toast(error.error);
      }
    };
    if (props.showChatRoomMembers) {
      fetchAllChatRoomMembers();
    }
  }, [props.showChatRoomMembers]);

  return (
    <div className="chat-room-members-container">
      <div className="create-room-header">
        <h1 className="create-room-title">Chat Room Members List</h1>
        <CloseIcon
          className="create-room-close-icon"
          onClick={() => props.setShowChatRoomMembers(false)}
        />
      </div>
      <div className="chat-room-members-list">
        {chatRoomMembers.length &&
          chatRoomMembers.map((member, key) => {
            return (
              <div className="chat-room-member" key={key}>
                <div className="chat-room-member-name">
                  <img src={chatRoomMemberAvatars[key]} alt="playerImg"  className="chat-room-member-avatar"/>
                  <p> {member.username} </p>
                </div>
                <div className="chat-room-member-message-button">
                  <img src={chatSvg} alt='chatIcon'/>
                  <p style={{ cursor: "pointer" }}> message </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ChatRoomMembersList;
