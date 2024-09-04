import "../assets/chat/Chat.css";
import ChatConversationItem from "./chatConversationItem";
import ChatContext from "../Context/ChatContext";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import { useContext, useEffect, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import { Toaster } from "react-hot-toast";
import AuthContext from "../navbar-sidebar/Authcontext";
import { resetUnreadMessages, resetChatRoomUnreadMessages } from "./chatConversationItem";
const Chat = () => {
  const {
    chatRoomConversations,
    directConversations,
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
    isHome,
    setIsHome,
    selectedDirectRef,
    setDirectConversations,
    setChatRoomConversations,
    setMessages,
    selectedItem,
    setSelectedItem,
    selectedChatRoomRef,
  } = useContext(ChatContext);
  const { chatSocket, user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const filteredConversations = directConversations.filter((conversation) => {
    return conversation.name.includes(query);
  });

  const handleSelectItem = (itemName) => {
    setSelectedItem(itemName);
  };

  // useEffect(() => {
  //   if (chatSocket) {
  //     chatSocket.onmessage = (e) => {
  //       let data = JSON.parse(e.data);
  //       if (data.type === "newDirect") {
  //         const currentDirect = selectedDirectRef.current;
  //         let allDirects = directConversationsRef.current
  //         if (
  //           (currentDirect.name === data.data.sender )||
  //           (user === data.data.sender)) {
  //           if(data.data) {
  //             setMessages((prev) => [...prev, data.data]);
  //             if(selectedDirect.id)
  //               resetUnreadMessages(user, selectedDirect.id)
  //           }
  //         }
  //         else {
  //           const conversationExists = allDirects.some(
  //             (conv) => conv.name === selectedDirect.name
  //           );
  //           if (!conversationExists) {
  //             console.log("conversation is not found")
  //             const newConversation = {
  //               id: data.data.senderId,
  //               name: data.data.sender,
  //               avatar: data.data.senderAvatar,
  //               lastMessage: data.data.content,
  //               unreadCount: '1',
  //             };
  //             console.log("newConversation ", newConversation)
  //             setDirectConversations((prevConversations) => [
  //               ...prevConversations,
  //               newConversation,
  //             ]);
  //           }
  //           console.log(directConversations)
  //           // const updatedDirects = allDirects.map((friend) => {
  //           //   if ( data.data.senderId === friend.id) {
  //           //     let prevCount = friend.unreadCount
  //           //     return { ...friend, unreadCount: prevCount + 1, lastMessage: data.data.content};
  //           //   }
  //           //   return friend;
  //           // });
  //           // setDirectConversations(updatedDirects);
  //         }
  //       } else if (data.type === "goToGamingPage") {
  //         console.log("navigating now");
  //         navigate(`/mainpage/game/solo/1vs1/friends`);
  //       }
  //     };
  //   }
  // }, [chatSocket]);

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("Type: ",data.type)
        if (data.type === "newDirect") {
          const currentDirect = selectedDirectRef.current;
          if (
            currentDirect.name === data.data.sender ||
            user === data.data.sender
          ) {
            if (data.data) {
              setMessages((prev) => [...prev, data.data]);
              setDirectConversations((prevConversations) => {
                return prevConversations.map((friend) => {
                  if (data.data.senderId === friend.id ||data.data.receiverId === friend.id  ) {
                    return {
                      ...friend,
                      lastMessage: data.data.content,
                    };
                  }
                  return friend;
                });
              });
              if (currentDirect.id)
                resetUnreadMessages(user, currentDirect.id);
            }
          } else {
            setDirectConversations((prevConversations) => {
              const conversationExists = prevConversations.some(
                (conv) => conv.name === data.data.sender
              );

              if (!conversationExists) {
                console.log("conversation is not found");

                const newConversation = {
                  id: data.data.senderId,
                  name: data.data.sender,
                  avatar: data.data.senderAvatar,
                  lastMessage: data.data.content,
                  unreadCount: "1",
                };

                console.log("newConversation ", newConversation);
                return [...prevConversations, newConversation];
              }

              return prevConversations.map((friend) => {
                if (data.data.senderId === friend.id) {
                  return {
                    ...friend,
                    unreadCount: String(Number(friend.unreadCount) + 1),
                    lastMessage: data.data.content,
                  };
                }
                return friend;
              });
            });
          }
        } else if (data.type === "goToGamingPage") {
          console.log("navigating now");
          navigate(`/mainpage/game/solo/1vs1/friends`);
        } else if (data.type === "newMessage") {
          let currentRoom = selectedChatRoomRef.current
          if(currentRoom.roomId === data.data.roomId) {

            setMessages(prev => [...prev, data.data])
            setChatRoomConversations((prevConversations) => {
              return prevConversations.map((room) => {
                if (room.id === data.data.roomId) {
                  return {
                    ...room,
                    lastMessage: data.data.content,
                  };
                }
                return room;
              });
            });
            if (data.data.sender !== user)
              resetChatRoomUnreadMessages(user, data.data.roomId);
          } else {
            setChatRoomConversations((prevConversations) => {
              return prevConversations.map((room) => {
                if (room.id === data.data.roomId) {
                  return {
                    ...room,
                    unreadCount: String(Number(room.unreadCount) + 1),
                    lastMessage: data.data.content,
                  };
                }
                return room;
              });
            });
          }
        }
      };
    }
  }, [chatSocket]);

  return (
    <div className="chat-page">
      <Toaster />
      <div className="chat-container">
        <div
          className={
            Object.values(selectedDirect).every((value) => value !== "") ||
            Object.values(selectedChatRoom).every((value) => value !== "")
              ? "chat-sidebar-hidden"
              : "chat-sidebar"
          }
        >
          <div className="chat-sidebar-header">
            <input
              type="text"
              placeholder="search"
              value={query}
              className="chat-search-input"
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chat-switch-button-wrapper">
              <button
                className={
                  isHome
                    ? "direct-switch-button-active"
                    : "direct-switch-button"
                }
                onClick={() => setIsHome(true)}
              >
                Directs
              </button>
              <button
                className={
                  isHome ? "rooms-switch-button" : "rooms-switch-button-active"
                }
                onClick={() => setIsHome(false)}
              >
                Rooms
              </button>
            </div>
          </div>
          <div className="chat-conversations-list">
            {isHome
              ? filteredConversations.map((friend, key) => (
                  <ChatConversationItem
                    key={key}
                    friendId={friend.id}
                    name={friend.name}
                    avatar={friend.avatar}
                    status={friend.is_online}
                    lastMessage={friend.lastMessage}
                    unreadCount={friend.unreadCount}
                    isDirect={isHome}
                    setSelectedDirect={setSelectedDirect}
                    isSelected={selectedItem === friend.name}
                    setSelectedItem={handleSelectItem}
                  />
                ))
              : chatRoomConversations.map((chatRoom, key) => (
                  <ChatConversationItem
                    key={key}
                    roomId={chatRoom.id}
                    name={chatRoom.name}
                    icon={chatRoom.icon}
                    lastMessage={chatRoom.lastMessage}
                    membersCount={chatRoom.membersCount}
                    unreadCount={chatRoom.unreadCount}
                    isDirect={isHome}
                    setSelectedChatRoom={setSelectedChatRoom}
                    isSelected={selectedItem === chatRoom.name}
                    setSelectedItem={handleSelectItem}
                  />
                ))}
          </div>
        </div>
        <div
          className={
            Object.values(selectedDirect).every((value) => value !== "") ||
            Object.values(selectedChatRoom).every((value) => value !== "")
              ? "chat-window"
              : "chat-window-hidden"
          }
        >
          {isHome &&
          Object.values(selectedDirect).every((value) => value !== "") ? (
            <ChatConversation />
          ) : !isHome &&
            Object.values(selectedChatRoom).every((value) => value !== "") ? (
            <ChatRoomConversation
              setSelectedItem={handleSelectItem}
              setSelectedChatRoom={setSelectedChatRoom}
            />
          ) : (
            <div className="chat-window-empty">
              <div className="chat-window-empty-wrapper">
                <img
                  src={ChatIcons.emptyChatIcon}
                  alt=""
                  className="empty-chat-icon"
                />
                <p className="chat-window-empty-message">
                  {" "}
                  Begin a conversation with a friend to see it show up here!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
