import EmojiPicker from "emoji-picker-react";
import { useClickOutSide } from "../Chat/chatConversation";
import * as ChatIcons from "../assets/chat/media/index";
import { useEffect, useRef, useState } from "react";

const SendMessage = (props) => {
  let [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
          props.sendMessage();
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
          props.sendMessage();
          tx.style.height = "20px";
        }
      };
      tx.addEventListener("keydown", handleEnterKey);
      return () => {
        tx.removeEventListener("keydown", handleEnterKey);
      };
    }
  });

  const fileInputRef = useRef(null);

  return (
    <div className="conversation-controls-container">
      <img
        src={ChatIcons.emojiPicker}
        alt=""
        className="conversation-emoji-picker"
        onClick={() =>
          !props.showDirectOptions ? setShowEmojiPicker(true) : ""
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
            props.setMessageToSend((prevMessage) => prevMessage + e.emoji)
          }
        />
      </div>

      <div className="conversation-input-wrapper">
        <textarea
          ref={textAreaRef}
          className="conversation-input"
          placeholder="Enter your message"
          value={props.messageToSend}
          onChange={(e) => props.setMessageToSend(e.target.value)}
        />
      </div>
      <img
        src={ChatIcons.sendIcon}
        className="conversation-send-icon"
        onClick={props.sendMessage}
      />
    </div>
  );
};

export default SendMessage;
