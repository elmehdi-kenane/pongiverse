import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyMessage from "./MyMessage";
import OtherMessage from "./OtherMessage";

const ChatRoomConversation = () => {
  const { selectedChatRoom, setSelectedChatRoom} = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [recivedMessage, setRecivedMessage] = useState(null);
  const { user, socket, userImg } = useContext(AuthContext);
  const messageEndRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      messageToSend.trim() !== ""
    ) {
      socket.send(
        JSON.stringify({
          type: "message",
          data: {
            name: selectedChatRoom.name,
            sender: user,
            message: messageToSend,
          },
        })
      );
      setMessageToSend("");
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/channels/messages/${selectedChatRoom.roomId}`
        );
        const data = await response.json();
        if (data) setMessages(data);
        console.log("the data messages: ", data);
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedChatRoom){
      fetchMessages();
    } 
  }, [selectedChatRoom]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "newMessage") setRecivedMessage(data.data);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (recivedMessage !== null) {
      setMessages((prev) => [...prev, recivedMessage]);
    }
  }, [recivedMessage]);

  useEffect(() => {
    if (messages) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);
  return (
    <>
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() =>
              setSelectedChatRoom({
                name: "",
                status: "",
              })
            }
          />
          <img
            src={selectedChatRoom.icon}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedChatRoom.name}</div>
            <div className="conversation-info">
              {selectedChatRoom.members} 10 Members
            </div>
          </div>
        </div>
        <div className="conversation-options">
          <img
            src={ChatIcons.InviteToPlay}
            alt="Invite"
            className="conversation-invite-icon"
          />
          <img
            src={ChatIcons.ThreePoints}
            alt="Options"
            className="conversation-options-icon"
          />
        </div>
      </div>
      <div className="conversation-body" id="start">
        {messages.length !== 0 &&
          messages.map((message, index) =>
            message.sender === user ? (
              <MyMessage key={index} content={message.content} avatar={userImg}/>
            ) : (
              <OtherMessage key={index} content={message.content} />
            )
          )}
        <div ref={messageEndRef}></div>
      </div>
      <form action="submit" className="conversation-send-form" onSubmit={sendMessage}>
        <input type="text" className="conversation-input" value={messageToSend} onChange={(e)=>setMessageToSend(e.target.value)} placeholder="Enter your message"/>
        <img src={ChatIcons.sendIcon} className="conversation-send-icon" onClick={sendMessage}/>
      </form>
    </>
  );
};

export default ChatRoomConversation;
