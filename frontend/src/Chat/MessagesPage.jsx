import { useEffect, useState, useContext, useRef } from "react";
import Conversation from "./Conversation";
import MyMessage from "./MyMessage";
import AuthContext from "../navbar-sidebar/Authcontext";
import OtherMessage from "./OtherMessage";
import './Chat.css'

const MessagesContainer = (props) => {
  const [messages, setMessages] = useState([]);
  const [recivedMessages, setRecivedMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const { user } = useContext(AuthContext);
  const { socket } = useContext(AuthContext);
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
            room_id: props.selectedChannel.roomId,
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
            `http://localhost:8000/chatAPI/channels/messages/${props.selectedChannel.roomId}`
          );
          const data = await response.json();
          setMessages(data);
          // messageEndRef.current?.scrollIntoView();
        } catch (error) {
          console.log(error);
        }
      };
      if (props.selectedChannel.roomId) fetchMessages();
      let scrollView = document.getElementById('start')
    scrollView.scrollTop = scrollView.scrollHeight
    },
    [props.selectedChannel.roomId],
    [user,messages ]
  );

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("recived messages: ", data.data);
        if (data.type === "newMessage") setRecivedMessages(data.data);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (recivedMessages) {
      setMessages((prev) => [...prev, recivedMessages]);
    }
  }, [recivedMessages ]);

  useEffect(() => {
      if (messages) {
        let scrollView = document.getElementById('start')
        scrollView.scrollTop = scrollView.scrollHeight
      }
  }, [messages])

  return (
    <div className="conv-container">
      <div className="conversation__name">
        Hellow
      </div>
      <div id="start" className="conversation__messages">
        {messages.map((message) => (
          (message.sender === user) ? <MyMessage key={message.id} content={message.content} /> : <OtherMessage key={message.id} content={message.content} />)
          // <MyMessage key={message.id} content={message.content} />
        )}
      {/* <div className="tst"> */}

        <div  ref={messageEndRef}></div>
      {/* </div> */}
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
    </div>
  );
};

export default MessagesContainer;
