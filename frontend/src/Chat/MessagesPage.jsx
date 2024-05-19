import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import MyMessage from "./MyMessage";
import AuthContext from "../navbar-sidebar/Authcontext";
import OtherMessage from "./OtherMessage";
import * as ChatIcons from "../assets/chat/media";

import "../assets/chat/Chat.css";

const MessagesContainer = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [recivedMessages, setRecivedMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const { user } = useContext(AuthContext);
  const { socket } = useContext(AuthContext);
  const { selectedChannel } = useContext(AuthContext);
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
            room_id : roomId,
            sender: user,
            message: newMessage,
          },
        })
      );
      setNewMessage("");
    }
  };

  const getMessage = (e) => {
    setNewMessage(e.target.value);
  };

  useEffect(
    () => {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/chatAPI/channels/messages/${roomId}`
          );
          const data = await response.json();
          setMessages(data);
          console.log("the data messages: ", data)
        } catch (error) {
          console.log(error);
        }
      };
      if (roomId) fetchMessages();
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    },
    [roomId]
  );

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("recived messages: ", data.data);
        if (data.type === "newMessage") setRecivedMessages(data.data);
      };
      console.log(roomId)
    }
  }, [socket]);

  useEffect(() => {
    if (recivedMessages) {
      setMessages((prev) => [...prev, recivedMessages]);
    }
  }, [recivedMessages]);

  useEffect(() => {
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
        {messages.map((message) =>
          message.sender === user ? (
            <MyMessage key={message.id} content={message.content} />
          ) : (
            <OtherMessage key={message.id} content={message.content} />
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
