import { useState, useContext, useEffect } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import Conversation from "./Conversation";
import { useNavigate } from "react-router-dom";
import MyMessage from "./MyMessage";
import OtherMessage from "./OtherMessage";
import Avatar from "./avatar.svg";
import MessagesContainer from "./MessagesPage";
import "./Chat.css";
import FriendsIcon from "./FriendsIcon.svg";
import ChannelsIcon from "./ChannelsIcon.svg";

import SearchIcon from "./SearchIcon.svg";

const Chat = () => {
  const [isHome, setIsHome] = useState(true);
  const [expandSearch, setExpandSearch] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState({
    name: "",
    roomId: "",
  });
  const [channelsConversations, setChannelsConversations] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    console.log("selected channel hereeeee");
    console.log(selectedChannel);
  }, [selectedChannel]);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="conversations">
          <div className="conversations__search__mobile">
            <img
              src={SearchIcon}
              alt=""
              className="conversations__search__mobile--search"
              onClick={() => setExpandSearch(true)}
            />
          </div>
          <div className="conversations__switcher__mobile">
            <img
              src={FriendsIcon}
              alt=""
              className="conversations__switcher__mobile--Friends"
              onClick={() => setIsHome(true)}
            />
            <img
              src={ChannelsIcon}
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
              {Array(112)
                .fill()
                .map((_, i) => (
                  <Conversation key={i} name="Random" />
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
                  selectedChannel={selectedChannel}
                />
              ))}
              {/* {Array(151)
                .fill()
                .map((_, i) => (
                  <Conversation key={i} name="Random" />
                ))} */}
            </div>
          )}
        </div>
        {Object.values(selectedChannel).every((value) => value !== "") ? (
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
        )}
      </div>
    </div>
  );
};

export default Chat;

{
  /* {expandSearch ? (
    <div className="conversations__search">
      <input
        type="text"
        placeholder="Search"
        className="conversations__search__input"
      />
    </div>
  ) : ''} */
}
