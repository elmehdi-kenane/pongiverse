import React from 'react'
import './Chat.css'
import { useState } from 'react'
import MessageSpace from './MessagesSpace'
// import Conversation from './Conversation'
import Avatar from './avatar.svg'

const Chat = () => {

  const [selectedConversation, setSelectedConversation] = useState(false);
  const handleConversationSelection = () => {
    console.log("log")
    setSelectedConversation(true);
  };

  return (
    <div className="full-page">
        <div className="chat-container">
          <div className="side-box">
            <div className="button-switcher">
              <button>Home</button>
              <button>Channels</button>
            </div>
            <div className="search-input">
              <input type="text" placeholder='Search'/>
            </div>
            <div className="conversations-list">
              {/* <Conversation/> */}
              <div className="conversation" onClick={handleConversationSelection}>
                <img src={Avatar} alt="" />
                <div className="user-infos">
                  <div className="username">
                    mehdi_elk
                  </div>
                  <div className="login-status">
                    online
                  </div>
                </div>
              </div>
            </div>
          </div>
          {selectedConversation ? <MessageSpace /> : <div className="chat-box"></div>}
      </div>
    </div>
  )
}

export default Chat