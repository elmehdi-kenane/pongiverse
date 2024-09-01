import CloseIcon from "@mui/icons-material/Close";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import '../../Profile/Profile.css'
import chatSvg from "../../assets/navbar-sidebar/chat.svg"
import ChatContext from "../../Context/ChatContext";
const ChatRoomMembersList = (props) => {
  const [chatRoomMembers, setChatRoomMembers] = useState([]);
  const {selectedChatRoom} = useContext(ChatContext)
  
  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      console.log(selectedChatRoom)
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/chatRoomMembersList`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              id: selectedChatRoom.roomId,
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
        {chatRoomMembers.length !== 0 &&
          chatRoomMembers.map((member, key) => {
            return (
              <div className="chat-room-member" key={key}>
                <div className="chat-room-member-name">
                  <img src={member.avatar} alt="playerImg"  className="chat-room-member-avatar"/>
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
