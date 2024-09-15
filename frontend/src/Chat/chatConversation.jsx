import { useContext, useEffect, useRef, useState } from "react";
import ChatContext from "../Context/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import SendMessage from "./sendMessage";
import ChatConversationHeader from "./chatConversationHeader";
import ChatConversationBody from "./chatConversationBody";

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

const fetchMessages = async (
  currentMessagePage,
  user,
  friend,
  setMessages,
  messages,
  limit,
  setHasMoreMessages,
) => {
  try {
    const response = await fetch(
      `http://${
        import.meta.env.VITE_IPADDRESS
      }:8000/chatAPI/Directs/messages?page=${currentMessagePage}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          friend: friend,
        }),
      }
    );
    const { count, results, next } = await response.json();
    if (response.ok) {
      setMessages([...results, ...messages]);
      if (!next) {
        setHasMoreMessages(false);
        console.log("NO MORE MESSAGES", next);
      } else {
        console.log("HAS MORE MESSAGES", next);
      }
    } else console.log("error");
  } catch (error) {
    console.log(error);
  }
};

const ChatConversation = () => {
  const {
    selectedDirect,
    setSelectedDirect,
    setMessages,
    messages,
    currentMessagePage,
    setCurrentMessagePage,
    hasMoreMessages,
    setHasMoreMessages,
    hasMoreMessagesRef,
    currentMessagePageRef,
  } = useContext(ChatContext);
  const MESSAGES_LIMIT = 20;
  const [showDirectOptions, setShowDirectOptions] = useState(false);
  const { user, chatSocket, userImg } = useContext(AuthContext);
  const messageEndRef = useRef(null);
  const messgesInnerRef = useRef();

  useEffect(() => {
    console.log("\n\n\nCURRENT PAGE: ", currentMessagePageRef.current);
    console.log("HAS MORE MESSAGES: ", hasMoreMessagesRef.current);
    if (hasMoreMessagesRef.current) {
      fetchMessages(
        currentMessagePageRef.current,
        user,
        selectedDirect.name,
        setMessages,
        messages,
        MESSAGES_LIMIT,
        setHasMoreMessages,
        hasMoreMessagesRef.current,
      );
    }
    let scrollView = document.getElementById("start");
    scrollView.scrollTop = scrollView.scrollHeight;
  }, [selectedDirect, currentMessagePageRef.current]);

  useEffect(() => {
    if (messages && currentMessagePageRef.current === 1) {
      let scrollView = document.getElementById("start");
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages]);

  let domNode = useClickOutSide(() => {
    setShowDirectOptions(false);
  });

  const onScrollCoversationBody = (e) => {
    if (messgesInnerRef.current) {
      const { scrollTop } = messgesInnerRef.current;
      const currentHassMoreMessages = hasMoreMessagesRef.current;
      if (scrollTop === 0 && currentHassMoreMessages) {
        console.log("CURRENT HAS MORE: ",currentHassMoreMessages)
        console.log("ANA HENA INSIDE SCROLL");
        setCurrentMessagePage((prev) => prev + 1);
      }
    }
  };
  return (
    <>
      <ChatConversationHeader 
        setSelectedDirect={setSelectedDirect}
        selectedDirect={selectedDirect}
        chatSocket={chatSocket}
        showDirectOptions={showDirectOptions}
        setShowDirectOptions={setShowDirectOptions}
        domNode={domNode}
        user={user}
        />
      <ChatConversationBody 
        messages={messages}
        userImg={userImg}
        onScrollCoversationBody={onScrollCoversationBody}
        messgesInnerRef={messgesInnerRef}
        messageEndRef={messageEndRef}
        user={user}
        selectedDirect={selectedDirect}
      />
      <SendMessage
        showDirectOptions={showDirectOptions}
        setShowDirectOptions={setShowDirectOptions}
        selectedDirect={selectedDirect}
      />
    </>
  );
};

export default ChatConversation;
