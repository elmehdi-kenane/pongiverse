import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MyMessage from "./MyMessage";
import AuthContext from "../navbar-sidebar/Authcontext";
import OtherMessage from "./OtherMessage";
import * as ChatIcons from "../assets/chat/media";

import "../assets/chat/Chat.css";
import ChatContext from "../Groups/ChatContext";
import { friends } from "../assets/navbar-sidebar";

const DirectMessages = () => {
  const [messages, setMessages] = useState([]);
  const [showDirectOptions, setShowDirectOptions] = useState(false);
  const [recivedMessages, setRecivedMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const { user, socket, userImg } = useContext(AuthContext);
  const { selectedDirect } = useContext(ChatContext);
  const messageEndRef = useRef(null);
  const selectedDirectRef = useRef(null);
  const navigate = useNavigate()

  const sendMessage = (e) => {
    e.preventDefault();
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      newMessage.trim() !== ""
    ) {
      socket.send(
        JSON.stringify({
          type: "directMessage",
          data: {
            sender: user,
            reciver: selectedDirect.name,
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
		selectedDirectRef.current = selectedDirect;
	  }, [selectedDirect]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "newDirect") {
          const currentDirect = selectedDirectRef.current;
          console.log(selectedDirect)
          console.log("reciver: ",data.data.reciver)
          console.log("sender: ", data.data.sender)
          console.log("user: ",user)
          console.log("selected: ",currentDirect.name)
          if (
            (currentDirect.name === data.data.sender &&
              data.data.reciver === user) ||
            (user === data.data.sender && data.data.reciver === user)
          )
            setRecivedMessages(data.data);
        }
        else if (data.type === 'goToGamingPage') {
          console.log("navigating now")
            navigate(`/mainpage/game/solo/1vs1/friends`)
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    if (recivedMessages !== null) {
      setMessages((prev) => [...prev, recivedMessages]);
    }
  }, [recivedMessages]);

  useEffect(() => {
    if (messages) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);

const inviteFriend = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("inside join")
    socket.send(JSON.stringify({
      type: 'inviteFriendGame',
      message: {
        user: user,
        target: selectedDirect.name,
      }
    }))
  }}

  return (
    <>
      <div className="name-container">
        <div className="name-container__conv-infos">
          <img
            src={selectedDirect.avatar}
            alt=""
            className="name-container__avatar"
          />
          <div className="name-container__name-and-members">
            <div className="name-container__name">{selectedDirect.name}</div>
            <div className="name-container__infos">
              {selectedDirect.status ? "online" : "offline"}
            </div>
          </div>
        </div>
        <div className="name-container__icons">
          <div className="name-container__invite-play">
            <img
              onClick={inviteFriend}
              src={ChatIcons.InviteToPlay}
              alt=""
              className="name-container__invite-icon"
            />
          </div>
          <div className="name-container__options">
            <img
              onClick={() => {showDirectOptions ? setShowDirectOptions(false) : setShowDirectOptions(true)}}
              src={ChatIcons.ThreePoints}
              alt=""
              className="name-container__option-icon"
              />
            {showDirectOptions ?
             <div className="direct-options-container"> 
             <div className="view-profile-option">View Profile</div>
             <div className="block-friend-option">Block</div>
             <div className="change-wallpaper-option">Wallpaper</div>
             </div> : ""}
          </div>
        </div>
      </div>
      <div id="start" className="conversation__messages">
        {messages.length !== 0 &&
          messages &&
          messages.map((message, index) =>
            message.sender === user ? (
              <MyMessage key={index} content={message.content} avatar={userImg}/>
            ) : (
              <OtherMessage key={index} content={message.content} avatar = {selectedDirect.avatar}/>
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

export default DirectMessages;
