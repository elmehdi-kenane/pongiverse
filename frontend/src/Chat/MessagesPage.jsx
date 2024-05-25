import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import MyMessage from "./MyMessage";
import AuthContext from "../navbar-sidebar/Authcontext";
import OtherMessage from "./OtherMessage";
import * as ChatIcons from "../assets/chat/media";

import "../assets/chat/Chat.css";
import ChatContext from "../Groups/ChatContext";

const MessagesContainer = () => {
  const [messages, setMessages] = useState([]);
  const [recivedMessages, setRecivedMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const { user, socket } = useContext(AuthContext);
  const { selectedChannel } = useContext(ChatContext);
  const messageEndRef = useRef(null);
  const sendMessage = (e) => {
    e.preventDefault();
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      newMessage.trim() !== ""
    ) {
      socket.send(
        JSON.stringify({
          type: "message",
          data: {
            room_id : selectedChannel.roomId,
            sender: user,
            message: newMessage,
          },
        })
      );
      setNewMessage("");
    }
  };

  const getMessage = (e) => {
    console.log("recived message: ", e.target.target)
    setNewMessage(e.target.value);
  };

  useEffect(
    () => {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/chatAPI/channels/messages/${selectedChannel.roomId}`
          );
          const data = await response.json();
          if(data)
            setMessages(data);
          console.log("the data messages: ", data)
        } catch (error) {
          console.log(error);
        }
      };
      if (selectedChannel.roomId) fetchMessages();
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    },
    [selectedChannel.roomId]
  );

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("recived messages: ", data.data);
        if (data.type === "newMessage") {
          setRecivedMessages(data.data);
          console.log("new message recived: ", data.data)
        }
      };
      console.log(selectedChannel.roomId)
    }
  }, [socket]);

  useEffect(() => {
    console.log("new message")
    if (recivedMessages !== null) {
      setMessages((prev) => [...prev, recivedMessages]);
    }
  }, [recivedMessages]);

  useEffect(() => {
    console.log("messages: ======> ",messages)
    if (messages) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="name-container">
        <div className="name-container__conv-infos">
          <img
            src={ChatIcons.DefaultAvatar}
            alt="lol"
            className="name-container__avatar"
          />
          <div className="name-container__name-and-members">
            <div className="name-container__name">
              {selectedChannel.name}
            </div>
            <div className="name-container__infos">14 Members</div>
          </div>
        </div>
        <div className="name-container__icons">
          <div className="name-container__invite-play">
            <img
              src={ChatIcons.InviteToPlay}
              alt=""
              className="name-container__invite-icon"
            />
          </div>
          <div className="name-container__options">
            <img
              src={ChatIcons.ThreePoints}
              alt=""
              className="name-container__option-icon"
            />
          </div>
        </div>
      </div>
      <div id="start" className="conversation__messages">
        { messages.length !== 0 && messages.map((message, index) =>
          message.sender === user ? (
            <MyMessage key={index} content={message.content} />
          ) : (
            <OtherMessage key={index} content={message.content} />
          )
        )}
        <div ref={messageEndRef}></div>
      </div>
      <form
        action="submit"
        onSubmit={sendMessage}
        className="converation__form"
      >
        <input
          type="text"
          className="conversation__form__input"
          placeholder="Type your message"
          value={newMessage}
          onChange={getMessage}
        />
      </form>
    </>
  );
};

export default MessagesContainer;
