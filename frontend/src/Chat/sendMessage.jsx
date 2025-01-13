import EmojiPicker from "emoji-picker-react"
import { useClickOutSide } from "../Chat/chatConversation"
import * as ChatIcons from "../assets/chat/media/index"
import { useState, useRef, useEffect} from "react"

const SendMessage = (props) => {
  let [showEmojiPicker, setShowEmojiPicker] = useState(false)

  let emojiPickerRef = useClickOutSide(() => {
    setShowEmojiPicker(false)
  })

  let textAreaRef = useRef(null)

  useEffect(() => {
    const tx = textAreaRef.current

    if (tx) {
      tx.style.height = "18px"
      const handleInput = () => {
        tx.style.height = "18px"
        tx.style.height = tx.scrollHeight + "px"
      }
      const handleEnterKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          props.sendMessage()
        }
      }
      // tx.addEventListener("keydown", handleEnterKey)
      tx.addEventListener("input", handleInput)
      return () => {
        // tx.removeEventListener("keydown", handleEnterKey)
        tx.removeEventListener("input", handleInput)
      }
    }
  }, [])

  useEffect(() => {
    const tx = textAreaRef.current

    if (tx) {
      const handleEnterKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          tx.style.height = "20px";
          // props.sendMessage()
        }
      }
      tx.addEventListener("keydown", handleEnterKey)
      return () => {
        tx.removeEventListener("keydown", handleEnterKey)
      }
    }
  })

  const handelMessageToSend = (e) => {
    const message = textAreaRef.current.value;
    if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          props.sendMessage(message);
          textAreaRef.current.value = ''
        }
  }

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
            // props.setMessageToSend((prevMessage) => prevMessage + e.emoji)
            textAreaRef.current.value += e.emoji
          }
        />
      </div>

      <div className="conversation-input-wrapper">
        <textarea
          maxLength={1024}
          ref={textAreaRef}
          className="conversation-input"
          placeholder="Enter your message"
          // value={props.messageToSend}
          onKeyDown={handelMessageToSend}
          // onChange={handelMessageToSend}
        />
      </div>
      <img
        src={ChatIcons.sendIcon}
        className="conversation-send-icon"
        onClick={() => {props.sendMessage(textAreaRef.current.value); textAreaRef.current.value = ''}}
      />
    </div>
  )
}

export default SendMessage
