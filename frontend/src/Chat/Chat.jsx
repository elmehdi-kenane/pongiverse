import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatContext from "../Groups/ChatContext";
import Conversation from "./Conversation";
import MessagesContainer from "./MessagesPage";
import * as ChatIcons from "../assets/chat/media";
import { Outlet } from "react-router-dom";

import "../assets/chat/Chat.css";
import DirectMessages from "./DirectMessages";

const Chat = () => {
  const [isHome, setIsHome] = useState(true);
  const [query, setQuery] = useState("");
  const [expandSearch, setExpandSearch] = useState(false);
  const {
    channelsConversations,
    directsConversations,
    setSelectedChannel,
    selectedChannel,
    setSelectedDirect,
    selectedDirect,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const filteredConversation = directsConversations.filter( conversation => {
    return conversation.name.includes(query)
  })

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="conversations">
      {/* {<h4> {user} </h4>} */}
          <div className="conversations__search__mobile">
            <img
              src={ChatIcons.SearchIcon}
              alt=""
              className="conversations__search__mobile--search"
              onClick={() => setExpandSearch(true)}
            />
          </div>
          <div className="conversations__switcher__mobile">
            <img
              src={ChatIcons.FriendsIcon}
              alt=""
              className="conversations__switcher__mobile--Friends"
              onClick={() => setIsHome(true)}
            />
            <img
              src={ChatIcons.ChannelsIcon}
              alt=""
              className="conversations__switcher__mobile--channels"
              onClick={() => setIsHome(false)}
            />
          </div>
          <div className="conversations__search">
            <input
              type="text"
              value={query}
              placeholder="Search"
              className="conversations__search__input"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="conversations__switcher">
            <button
              className="conversations__switcher__home"
              onClick={() => setIsHome(true)}
            >
              Directs
            </button>
            <button
              className="conversations__switcher__channels"
              onClick={() => setIsHome(false)}
            >
              Channels
            </button>
          </div>
          {isHome ? (
            <div className="conversations__list">
              {filteredConversation.map((user, key) => (
                <Conversation
                  name={user.name}
                  key={user.id}
                  status={user.is_online}
                  imageIndex={key}
                  isDirect={isHome}
                  setSelectedDirect={setSelectedDirect}
                />
              ))}
            </div>
          ) : (
            <div className="conversations__list">
              {channelsConversations.map((channel, key) => (
                <Conversation
                  name={channel.name}
                  key={channel.id}
                  roomId={channel.id}
                  memebers={channel.memebers}
                  setSelectedChannel={setSelectedChannel}
                  isDirect={isHome}
                />
              ))}
            </div>
          )}
        </div>
        <div className="conv-container">
          {!isHome &&
          Object.values(selectedChannel).every((value) => value !== "") ? (
            <MessagesContainer/>
          ) : (isHome && Object.values(selectedDirect).every((value) => value !== "")) ? (
            <DirectMessages/>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

