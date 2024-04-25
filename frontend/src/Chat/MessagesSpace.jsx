import React from "react";
import './Chat.css'

const MessageSpace = () => {
    return (
        <div className="chat-box">
        <div className="name-holder">
        </div>
        <div className="messages-space">
          <div className="message-row">
            <div className="message-text other-message" >
              yeah, this is just a test
            </div>
            <div className="message-date">
              21 Mar
            </div>
            <div className="message-text my-message" >
              ok then
            </div>
            <div className="message-date">
              21 Mar
            </div>
          </div>
        </div>
        <div className="messages-input">
          <input type="text" name="messages" id="" placeholder='Type your message...'/>
        </div>
      </div>
    )

}

export default MessageSpace