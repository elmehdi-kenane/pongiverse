import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import Conversation from "./Conversation";
import MessagesContainer from "./MessagesPage";
import * as ChatIcons from "../assets/chat/media";
import { Outlet } from 'react-router-dom'

import "../assets/chat/Chat.css";

const Chat = () => {
  const [isHome, setIsHome] = useState(true);
  const [expandSearch, setExpandSearch] = useState(false);
  const [channelsConversations, setChannelsConversations] = useState([]);
  const { user, setSelectedChannel, selectedChannel } = useContext(AuthContext);
  const navigate = useNavigate();
  const selectedElems = []

  useEffect(() => {
    const fetchChannelsWithMessage = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/channels/${user}`
        );
        const data = await response.json();
        setChannelsConversations(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchChannelsWithMessage();
    }
  }, [user]);

  const RenderConv = (roomId) => {
    console.log("im here is RenderConv");
    navigate(`../${roomId}`);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="conversations">
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
              placeholder="Search"
              className="conversations__search__input"
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
              {channelsConversations.map((channel) => (
                <Conversation
                  name={channel.name}
                  key={channel.id}
                  roomId={channel.id}
                  setSelectedChannel={setSelectedChannel}
                  selectedElems={selectedElems}
                />
              ))}
            </div>
          ) : (
            <div className="conversations__list">
              {channelsConversations.map((channel) => (
                <Conversation
                  name={channel.name}
                  key={channel.id}
                  roomId={channel.id}
                  setSelectedChannel={setSelectedChannel}
                />
              ))}
            </div>
          )}
        </div>
        <div className="conv-container">
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Chat;

{
  /* {Object.values(selectedChannel).every((value) => value !== "") ? (
          <MessagesContainer selectedChannel={selectedChannel} />
        ) : (
          <div className="conv-container">
            {expandSearch ? (
              <div className="chat-search-mobile">
                <input
                  type="text"
                  placeholder="Search"
                  className="chat-search-mobile__input"
                />
              </div>
            ) : (
              ""
            )}
          </div>
        )} */
}
