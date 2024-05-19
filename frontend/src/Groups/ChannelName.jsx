import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { json, useParams } from "react-router-dom"
import * as ChatIcons from '../assets/chat/media'

import "../assets/chat/Groups.css";

const ChannelName = (props) => {
    const navigate = useNavigate();


    const handleChatButtonClick = (roomId) => {
        navigate(`/mainpage/chat/${roomId}`);
      };
    return (
        <>
            <div className="channel"  onClick={() => handleChatButtonClick(props.roomId)}>
                <div className="channel-details">
                    <img src={ChatIcons.DefaultAvatar} alt="default avatar" className="channel__avatar"/>
                    <div className="name-holder">
                        <div className="channel-name">{props.name}</div>
                        <div className="members-number">12 Members</div>
                    </div>
                </div>
                <div id="three-points">
                    <img src={ChatIcons.ThreePoints} alt="lol"/>
                </div>
            </div>
        </>
    )
}


export default ChannelName