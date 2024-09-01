import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyMessage from "./myMessage";
import OtherMessage from "./otherMessage";
import { useClickOutSide } from "../Chat/chatConversation";
import SendMessage from "./sendMessage";
import { leaveRoomSubmitHandler } from "../Groups/roomHandler";

const ChatRoomConversation = (props) => {
  const {
    selectedChatRoom,
    setSelectedChatRoom,
    chatRoomConversations,
    setChatRoomConversations,
  } = useContext(ChatContext);
  const [showChatRoomOptions, setShowChatRoomOptions] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [recivedMessage, setRecivedMessage] = useState(null);
  const { user, chatSocket, userImg } = useContext(AuthContext);
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
          `http://localhost:8000/chatAPI/chatRoom/messages/${selectedChatRoom.roomId}`
        );
        const data = await response.json();
        if (data) setMessages(data);
        console.log("the data messages: ", data);
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedChatRoom) {
      fetchMessages();
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("socket message ", data);

        if (data.type === "newMessage") {
          setRecivedMessage(data.data);
          console.log(data.data);
        } else if (data.type === "memberleaveChatRoom") {
          memeberLeaveChatRoomUpdater(data.message);
        }
      };
    }
  }, [chatSocket]);

  const memeberLeaveChatRoomUpdater = (data) => {
    // const allRooms = myRoomsRef.current;
    console.log("data", data);
    if (data && data.user === user) {
      const updatedRooms = chatRoomConversations.filter(
        (myroom) => myroom.name !== data.name
      );
      console.log("upadteeddddd: ", updatedRooms);
      setChatRoomConversations(updatedRooms);
      setSelectedChatRoom({
        name: "",
        status: "",
      });
      props.setSelectedItem("");
    }
    // else {
    //   const updatedRooms = chatRoomConversations.map((room) => {
    //     if (room.name === data.name) {
    //       return { ...room, membersCount: data.membersCount };
    //     }
    //     return room;
    //   });
    //   setMyRooms(updatedRooms);
    // }
  };

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

  let domNode = useClickOutSide(() => {
    setShowChatRoomOptions(false);
  });
  return (
    <>
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
                onClick={() =>
                  leaveRoomSubmitHandler(
                    selectedChatRoom.name,
                    user,
                    chatSocket
                  )
                }
              >
                Leave Chat Room
              </div>
              <div className="chat-room-info-option">Chat Room Info</div>
              <div className="members-list-option">Members List</div>
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
                content={message.content}
                avatar={userImg}
              />
            ) : (
              <OtherMessage
                key={index}
                content={message.content}
                avatar={selectedChatRoom.icon}
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
