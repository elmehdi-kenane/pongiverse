import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChannelName from "./ChannelName";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";
import JoinIcon from "./join.svg"
import CreateIcon from "./create.svg"
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
      <div className="channels-page">
        {createCh && <CreateChannel onClose={() => setCreateCh(false)} setNewRoom = {setNewRoom}/>}
        {joinCh && <JoinChannel onClose={() => setJoinCh(false)} />}
        <div className="buttons">
          <img className="buttons__join"  onClick={()=> setJoinCh(true)} src={JoinIcon}/>
          <img className="buttons__create" onClick={()=> setCreateCh(true)} src={CreateIcon}/>
        </div>
        <div className="container">
          <div className="mychannels">
            <h1 className="mychannels__tittle">Your Channels</h1>
            <div className="mychannels__line"></div> 
            <div className="mychannels__list">
                {channels.map((channel) => (
                  <ChannelName name={channel.name} key={channel.id} roomId={channel.id} />
                  ))}
              {/* {Array(30)
                .fill()
                .map((_, i) => (
                  <ChannelName key={i} name="Random" />
                ))} */}
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
