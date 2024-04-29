import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChannelName from "./ChannelName";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";

import "./Groups.css";

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
      <div className="channels-page blur">
              {createCh && <CreateChannel onClose={() => setCreateCh(false)} setNewRoom = {setNewRoom}/>}
        <div className="buttons blur">
          <div className="buttons__join" onClick={()=> setCreateCh(true)}>Join a Channel</div>
          <div className="buttons__create">Create a Channel</div>
        </div>
        <div className="container blur">
          <div className="mychannels">
            <h1 className="mychannels__tittle">Your Channels</h1>
            <div className="mychannels__line"></div> 
            <div className="mychannels__list">
              {Array(30)
                .fill()
                .map((_, i) => (
                  <ChannelName key={i} name="Random" />
                ))}
            </div>
          </div>
          <div className="suggested">
            <h1 className="suggested__tittle">Suggested Channels</h1>
            <div className="suggested__line"></div>
            <div className="suggested__list">
              {Array(30)
                .fill()
                .map((_, i) => (
                  <ChannelName key={i} name="Random" />
                ))}
            </div>
          </div>
        </div> 
      </div>
    </>
  );
};

export default Groups;
