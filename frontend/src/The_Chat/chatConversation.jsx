import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyMessage from "./MyMessage";
import OtherMessage from "./OtherMessage";
import { useNavigate } from "react-router-dom";

const ChatConversation = () => {
  const { selectedDirect, setSelectedDirect } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [recivedMessage, setRecivedMessage] = useState(null);
  const [messageToSend, setMessageToSend] = useState("");
  const [showDirectOptions, setShowDirectOptions] = useState(false);
  const { user, socket, userImg } = useContext(AuthContext);
  const messageEndRef = useRef(null);
  const selectedDirectRef = useRef(selectedDirect);
  const navigate = useNavigate();

  useEffect(() => {
    selectedDirectRef.current = selectedDirect;
  }, [selectedDirect]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      messageToSend.trim() !== ""
    ) {
      socket.send(
        JSON.stringify({
          type: "directMessage",
          data: {
            sender: user,
            reciver: selectedDirect.name,
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
          `http://localhost:8000/chatAPI/Directs/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
              friend: selectedDirect.name,
            }),
          }
        );
        const data = await response.json();
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedDirect) {
      console.log("selected Direct: ", selectedDirect);
      fetchMessages();
    }
    let scrollView = document.getElementById("start");
    scrollView.scrollTop = scrollView.scrollHeight;
  }, [selectedDirect]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "newDirect") {
          const currentDirect = selectedDirectRef.current;
          if (
            (currentDirect.name === data.data.sender &&
              data.data.reciver === user) ||
            (user === data.data.sender && data.data.reciver === user)
          )
            setRecivedMessage(data.data);
        } else if (data.type === "goToGamingPage") {
          console.log("navigating now");
          navigate(`/mainpage/game/solo/1vs1/friends`);
        }
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

  const inviteFriend = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("inside join");
      socket.send(
        JSON.stringify({
          type: "inviteFriendGame",
          message: {
            user: user,
            target: selectedDirect.name,
          },
        })
      );
    }
  };
  return (
    <>
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() =>
              setSelectedDirect({
                name: "",
                avatar: "",
                status: "",
              })
            }
          />
          <img
            src={selectedDirect.avatar}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedDirect.name}</div>
            <div className="conversation-info">
              {selectedDirect.status ? "online" : "offline"}
            </div>
          </div>
        </div>
        <div className="conversation-options">
          <img
            src={ChatIcons.InviteToPlay}
            alt="Invite"
            className="conversation-invite-icon"
            onClick={inviteFriend}
          />
          <div className="conversation-options-wrapper">
            <img
              onClick={() => {
                showDirectOptions
                  ? setShowDirectOptions(false)
                  : setShowDirectOptions(true);
              }}
              src={ChatIcons.ThreePoints}
              alt="Options"
              className="conversation-options-icon"
            />
            {showDirectOptions ? (
              <div className="direct-options-container">
                <div className="view-profile-option">View Profile</div>
                <div className="block-friend-option">Block</div>
                <div className="change-wallpaper-option">Wallpaper</div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div className="conversation-body" id="start">
        {messages.length !== 0 &&
          messages &&
          messages.map((message, index) =>
            message.sender === user ? (
              <MyMessage
                key={index}
                content={message.content}
                avatar={userImg}
              />
            ) : (
              <OtherMessage
                key={index}
                content={message.content}
                avatar={selectedDirect.avatar}
              />
            )
          )}
        <div ref={messageEndRef}></div>
      </div>
      <form
        action="submit"
        className="conversation-send-form"
        onSubmit={sendMessage}
      >
        <input
          value={messageToSend}
          placeholder="Type your message"
          type="text"
          className="conversation-input"
          onChange={(e) => setMessageToSend(e.target.value)}
        />
        <img
          src={ChatIcons.sendIcon}
          className="conversation-send-icon"
          onClick={sendMessage}
        />
      </form>
    </>
  );
};

export default ChatConversation;
