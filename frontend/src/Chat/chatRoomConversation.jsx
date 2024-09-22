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

const ChatRoomConversation = ({ chatRoomMessages, setChatRoomMessages, setSelectedItem }) => {
  const [showChatRoomInfos, setShowChatRoomInfos] = useState(false);
  const [showChatRoomMembers, setShowChatRoomMembers] = useState(false);
  const [showLeaveRoomPopUp, setShowLeaveRoomPopUp] = useState(false);
  const [showChatRoomOptions, setShowChatRoomOptions] = useState(false);

  const [currentChatRoomMessagesPage, setCurrentChatRoomMessagesPage] =
    useState(1);
  const [hasMoreChatRoomMessages, setHasMoreChatRoomMessages] = useState(true);
  const [chatRoomChanged, setChatRoomChanged] = useState(false);
  const messageEndRef = useRef(null);
  const messageBodyRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(messageEndRef);
  const [firstScroll, setFirstScroll] = useState(true);
  const [loading, setLoading] = useState(false);

  const { selectedChatRoom, setSelectedChatRoom } = useContext(ChatContext);
  const { user, chatSocket } = useContext(AuthContext);

  const [messageToSend, setMessageToSend] = useState("");
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
    setChatRoomMessages([]);
    setCurrentChatRoomMessagesPage(1);
    setHasMoreChatRoomMessages(true);
    setChatRoomChanged(true);
    setFirstScroll(true);
  }, [selectedChatRoom.name]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_IPADDRESS
          }:8000/chatAPI/chatRoom/messages/${
            selectedChatRoom.roomId
          }?page=${currentChatRoomMessagesPage}`
        );
        if (response.ok) {
          const { next, results } = await response.json();
          setChatRoomMessages([...results, ...chatRoomMessages]);
          if (!next) setHasMoreChatRoomMessages(false);
        } else {
          console.log("Error fetching messages");
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (hasMoreChatRoomMessages) {
      if (currentChatRoomMessagesPage > 1) {
        const previousScrollHeight = messageBodyRef.current.scrollHeight;
        fetchMessages().then(() => {
          setTimeout(() => {
            const newScrollHeight = messageBodyRef.current.scrollHeight;
            const scrollHeightDifference =
              newScrollHeight - previousScrollHeight;
            messageBodyRef.current.scrollTop = scrollHeightDifference;
          }, 0);
        });
      } else {
        fetchMessages();
      }
    }
    setChatRoomChanged(false);
  }, [chatRoomChanged, currentChatRoomMessagesPage]);

  useEffect(() => {
    if (messageEndRef && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      setFirstScroll(false);
    }
  }, [chatRoomMessages, lastMessage]);

  let domNode = useClickOutSide(() => {
    setShowChatRoomOptions(false);
  });

  const handleScroll = () => {
    if(messageBodyRef.current){
      const { scrollTop} = messageBodyRef.current;
      if (scrollTop === 0 && hasMoreChatRoomMessages && !firstScroll) {
        setLoading(true);
        setCurrentChatRoomMessagesPage((prev) => prev + 1);
      }
    }
  }

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
          selectedChatRoom={selectedChatRoom}
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
                memberCount: "",
                icon: "",
                roomId: "",
              });
              setSelectedItem("");
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
              {/* <div
                className="chat-room-info-option"
                onClick={() => {
                  setShowChatRoomInfos(true);
                  setShowChatRoomOptions(false);
                }}
              >
                Chat Room Info
              </div> */}
              <div
                className="members-list-option"
                onClick={() => {
                  setShowChatRoomMembers(true);
                  setShowChatRoomOptions(false);
                }}
              >
                Members List
              </div>
              {/* <div className="change-wallpaper-option">Wallpaper</div> */}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="conversation-body" ref={messageBodyRef} onScroll={handleScroll}>
        {chatRoomMessages.length !== 0 &&
          chatRoomMessages.map((message, index) =>
            message.sender === user ? (
              <MyMessage
                key={index}
                name={user}
                content={message.content}
                date={message.date}
                length={chatRoomMessages.length}
                endRef={messageEndRef}
                index={index}
                />
              ) : (
                <OtherMessage
                key={index}
                name={message.sender}
                content={message.content}
                date={message.date}
                length={chatRoomMessages.length}
                endRef={messageEndRef}
                index={index}
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
