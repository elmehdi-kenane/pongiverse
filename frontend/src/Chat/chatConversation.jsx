import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Context/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyMessage from "./myMessage";
import OtherMessage from "./otherMessage";
import { useNavigate } from "react-router-dom";
import SendMessage from "./sendMessage";

export let useClickOutSide = (handler) => {
  let domNode = useRef();
  useEffect(() => {
    let eventHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) handler();
    };
    document.addEventListener("mousedown", eventHandler);
    return () => {
      document.removeEventListener("mousedown", eventHandler);
    };
  });
  return domNode;
};

const ChatConversation = () => {
  const {
    selectedDirect,
    setSelectedDirect,
    recivedMessage,
    setMessages,
    messages,
  } = useContext(ChatContext);
  
  const [messageToSend, setMessageToSend] = useState("");
  const [showDirectOptions, setShowDirectOptions] = useState(false);
  const { user, chatSocket, userImg } = useContext(AuthContext);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  const sendMessage = () => {
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      messageToSend.trim() !== ""
    ) {
      console.log(messageToSend);
      chatSocket.send(
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
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/Directs/messages`,
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
        if (response.ok) {
          setMessages(data);
        } else console.log("error");
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedDirect.length !== 0) {
      fetchMessages();
    }
    let scrollView = document.getElementById("start");
    scrollView.scrollTop = scrollView.scrollHeight;
  }, [selectedDirect]);

  useEffect(() => {
    if (messages) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);

  const inviteFriend = () => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      console.log("inside join");
      chatSocket.send(
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
  let domNode = useClickOutSide(() => {
    setShowDirectOptions(false);
  });
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
                id: '',
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
        <div className="conversation-options" ref={domNode}>
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
                <div
                  className="view-profile-option"
                  onClick={() => navigate("/mainpage/profile")}
                >
                  View Profile
                </div>
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
                name={user}
                content={message.content}
                avatar={userImg}
                date={message.date}
              />
            ) : (
              <OtherMessage
                key={index}
                name={message.sender}
                content={message.content}
                avatar={selectedDirect.avatar}
                date={message.date}
              />
            )
          )}
        <div ref={messageEndRef}></div>
      </div>
      <SendMessage
        sendMessage={sendMessage}
        messageToSend={messageToSend}
        setMessageToSend={setMessageToSend}
      />
    </>
  );
};

export default ChatConversation;
