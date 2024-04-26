import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChannelName from "./ChannelName";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";

// import "./Groups.css";

const Groups = () => {
  const [channels, setChannels] = useState([]);
  const [newRoom, setNewRoom] = useState(null);
  const [createCh, setCreateCh] = useState(false);
  const [joinCh, setJoinCh] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/channels/${user}`
        );
        const data = await response.json();
        setChannels(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleChatButtonClick = (roomId) => {
    navigate(`${roomId}`);
  };

  useEffect(() => {
    if (newRoom) setChannels((prevChannels) => [...prevChannels, newRoom]);
  }, [newRoom]);

  return (
    <>
      <div className="channels">
        <div className="channels__container-holder">
          <div className="channels__actions">
            <button onClick={() => setJoinCh(true)}>join a channel</button>
            <button onClick={() => setCreateCh(true)}>create a channel</button>
          </div>
          <div className="channels__cards">
            <div className="cards__your-channels">
              <h2 className="title">Your Channels</h2>
              <div className="line"></div>
              <div className="channels-list">
                {Array(1)
                  .fill()
                  .map((_, i) => (
                    <ChannelName key={i} name="Random" />
                  ))}
              </div>
            </div>
            <div className="cards__suggested-channels">
              <h2 className="title">Public Suggested Channel </h2>
              <div className="line"></div>
            </div>
          </div>
        </div>
      </div>
      {createCh && (
        <CreateChannel
          onClose={() => setCreateCh(false)}
          setNewRoom={setNewRoom}
        />
      )}
      {joinCh && <JoinChannel onClose={() => setJoinCh(false)} />}
    </>
  );
};

export default Groups;
