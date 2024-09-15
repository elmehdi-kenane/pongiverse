import EmojiPicker from "emoji-picker-react";
import { useClickOutSide } from "../Chat/chatConversation";
import * as ChatIcons from "../assets/chat/media/index";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";


const SendMessage = (props) => {
  let [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const {user, chatSocket} = useContext(AuthContext)
  const [messageToSend, setMessageToSend] = useState("");

  const sendMessage = () => {
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      messageToSend.trim() !== ""
    ) {
      chatSocket.send(
        JSON.stringify({
          type: "directMessage",
          data: {
            sender: user,
            receiver: props.selectedDirect.name,
            message: messageToSend,
          },
        })
      );
      setMessageToSend("");
    }
  };

  let emojiPickerRef = useClickOutSide(() => {
    setShowEmojiPicker(false);
  });

  let textAreaRef = useRef(null);

  useEffect(() => {
    const tx = textAreaRef.current;

    if (tx) {
      tx.style.height = "18px";
      const handleInput = () => {
        tx.style.height = "18px";
        tx.style.height = tx.scrollHeight + "px";
      };
      const handleEnterKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      };
      tx.addEventListener("keydown", handleEnterKey);
      tx.addEventListener("input", handleInput);
      return () => {
        tx.removeEventListener("keydown", handleEnterKey);
        tx.removeEventListener("input", handleInput);
      };
    }
  }, []);

  useEffect(() => {
    const tx = textAreaRef.current;

    if (tx) {
      const handleEnterKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
          tx.style.height = "20px";
        }
      };
      tx.addEventListener("keydown", handleEnterKey);
      return () => {
        tx.removeEventListener("keydown", handleEnterKey);
      };
    }
  });

  return (
    <div className="conversation-controls-container">
      <img
        src={ChatIcons.emojiPicker}
        alt=""
        className="conversation-emoji-picker"
        onClick={() =>
          !props.showDirectOptions ? props.setShowEmojiPicker(true) : ""
        }
      />
      <div
        className={
          showEmojiPicker
            ? "conversation-emoji-container"
            : "conversation-emoji-container-hidden"
        }
        ref={emojiPickerRef}
      >
        <EmojiPicker
          width="100%"
          onEmojiClick={(e) =>
            setMessageToSend((prevMessage) => prevMessage + e.emoji)
          }
        />
      </div>

      <div className="conversation-input-wrapper">
        <textarea
          ref={textAreaRef}
          className="conversation-input"
          placeholder="Enter your message"
          value={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value)}
        />
      </div>
      <img
        src={ChatIcons.sendIcon}
        className="conversation-send-icon"
        onClick={sendMessage}
      />
    </div>
  );
};

export default SendMessage;
