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

const ChatConversation = ({ messages, setMessages }) => {
  const [showDirectOptions, setShowDirectOptions] = useState(false);

  const { selectedDirect, setSelectedDirect } = useContext(ChatContext);
  const { user, chatSocket, userImg } = useContext(AuthContext);

  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [userChanged, setUserChanged] = useState(false);
  const messageEndRef = useRef(null);
  const messageBodyRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(messageEndRef);
  const [firstScroll, setFirstScroll] = useState(true);
  const [loading, setLoading] = useState(false);
  let domNode = useClickOutSide(() => {
    setShowDirectOptions(false);
  });

  const fetchMessages = async () => {
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
            friend: selectedDirect.name,
          }),
        }
      );
      const { results, next } = await response.json();
      if (response.ok) {
        setMessages([...results, ...messages]);
        if (!next) setHasMoreMessages(false);
      } else console.log("opps! something went wrong");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setMessages([]);
    setCurrentMessagePage(1);
    setHasMoreMessages(true);
    setUserChanged(true);
    setFirstScroll(true);
  }, [selectedDirect.name]);

  useEffect(() => {
    if (hasMoreMessages && selectedDirect) {
      if (currentMessagePage > 1) {
        const previousScrollHeight = messageBodyRef.current.scrollHeight;

        fetchMessages().then(() => {
          setLoading(false);
          setTimeout(() => {
            const newScrollHeight = messageBodyRef.current.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeight;
            messageBodyRef.current.scrollTop += scrollDifference;
          }, 0); // Ensure the DOM is updated before adjusting the scroll
        });
      } else {
        fetchMessages();
      }
    }
    setUserChanged(false);
  }, [userChanged, currentMessagePage]);

  useEffect(() => {
    if (messageEndRef && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      setFirstScroll(false);
    }
  }, [messages, lastMessage]);

  const handelScroll = (e) => {
    if (messageBodyRef.current) {
      const { scrollTop } = messageBodyRef.current;
      if (scrollTop === 0 && hasMoreMessages && !firstScroll) {
        setLoading(true);
        setCurrentMessagePage(currentMessagePage + 1);
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
        loading={loading}
        messages={messages}
        userImg={userImg}
        messageBodyRef={messageBodyRef}
        handelScroll={handelScroll}
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
