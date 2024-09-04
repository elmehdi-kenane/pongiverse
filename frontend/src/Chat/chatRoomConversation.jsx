import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Context/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyMessage from "./myMessage";
import OtherMessage from "./otherMessage";
import { useClickOutSide } from "../Chat/chatConversation";
import SendMessage from "./sendMessage";
import LeaveChatRoomPopUp from "./chatRoomOptions/leaveChatRoomPopUp";
import ChatRoomMembersList from "./chatRoomOptions/chatRoomMembersList";
import ChatRoomInfos from "./chatRoomOptions/chatRoomInfos";

const ChatRoomConversation = (props) => {
  const { selectedChatRoom, setSelectedChatRoom, messages, setMessages } = useContext(ChatContext);
  const [showChatRoomInfos, setShowChatRoomInfos] = useState(false);
  const [showChatRoomMembers, setShowChatRoomMembers] = useState(false);
  const [showLeaveRoomPopUp, setShowLeaveRoomPopUp] = useState(false);
  const [showChatRoomOptions, setShowChatRoomOptions] = useState(false);
  const [messageToSend, setMessageToSend] = useState("");
  const { user, chatSocket} = useContext(AuthContext);
  const messageEndRef = useRef(null);

  const sendMessage = () => {
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      messageToSend.trim() !== ""
    ) {
      chatSocket.send(
        JSON.stringify({
          type: "message",
          data: {
            id: selectedChatRoom.roomId,
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
          `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/chatRoom/messages/${selectedChatRoom.roomId}`
        );
        const data = await response.json();
        if (data) setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedChatRoom) {
      fetchMessages();
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    if (messages) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);

  let domNode = useClickOutSide(() => {
    setShowChatRoomOptions(false);
  });
  return (
    <>
      {showLeaveRoomPopUp && (
        <LeaveChatRoomPopUp
          setShowLeaveRoomPopUp={setShowLeaveRoomPopUp}
          roomId={selectedChatRoom.roomId}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      {showChatRoomMembers && (
        <ChatRoomMembersList
          showChatRoomMembers={showChatRoomMembers}
          setShowChatRoomMembers={setShowChatRoomMembers}
          roomId={selectedChatRoom.roomId}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      {showChatRoomInfos && (
        <ChatRoomInfos
          setShowChatRoomInfos={setShowChatRoomInfos}
          roomId={selectedChatRoom.roomId}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() => {
              setSelectedChatRoom({
                name: "",
                status: "",
              });
              props.setSelectedItem("");
            }}
          />
          <img
            src={selectedChatRoom.icon}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedChatRoom.name}</div>
            <div className="conversation-info">
              {selectedChatRoom.memberCount} Members
            </div>
          </div>
        </div>
        <div className="conversation-options-wrapper" ref={domNode}>
          <img
            onClick={() => {
              showChatRoomOptions
                ? setShowChatRoomOptions(false)
                : setShowChatRoomOptions(true);
            }}
            src={ChatIcons.ThreePoints}
            alt="Options"
            className="conversation-options-icon"
          />
          {showChatRoomOptions ? (
            <div className="room-options-container">
              <div
                className="leave-chat-room-option"
                onClick={() => {
                  setShowLeaveRoomPopUp(true);
                  setShowChatRoomOptions(false);
                }}
              >
                Leave Chat Room
              </div>
              <div
                className="chat-room-info-option"
                onClick={() => {
                  setShowChatRoomInfos(true);
                  setShowChatRoomOptions(false);
                }}
              >
                Chat Room Info
              </div>
              <div
                className="members-list-option"
                onClick={() => {
                  setShowChatRoomMembers(true);
                  setShowChatRoomOptions(false);
                }}
              >
                Members List
              </div>
              <div className="change-wallpaper-option">Wallpaper</div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="conversation-body" id="start">
        {messages.length !== 0 &&
          messages.map((message, index) =>
            message.sender === user ? (
              <MyMessage
                key={index}
                name={user}
                content={message.content}
                date={message.date}
                
              />
            ) : (
              <OtherMessage
                key={index}
                name={message.sender}
                content={message.content}
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

export default ChatRoomConversation;
