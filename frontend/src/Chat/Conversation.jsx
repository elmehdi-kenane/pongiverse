import { useState, useContext } from 'react';
import * as ChatIcons from '../assets/chat/media'
import ChatContext from "../Groups/ChatContext";

import "../assets/chat/Chat.css";
import { useNavigate } from 'react-router-dom';

const Conversation = (props) => {
    const navigate = useNavigate();
    const {directsImages} = useContext(ChatContext);

    const handleClick = () => {
        if(props.isDirect && props.name) {
            props.setSelectedDirect ({
                name: props.name,
                avatar : directsImages[props.imageIndex],
                status : props.status,
                
            })
        }else if (!props.isDirect) {
            props.setSelectedChannel({
                name: props.name,
                roomId: props.roomId,
            });
        }    
      };

    return (
        <div className="conversation-holder" onClick={handleClick}>
            {/* <img src={directsImages[props.imageIndex]} alt="" className='conversation-holder__avatar' /> */}
            <img src={ChatIcons.DefaultAvatar} alt="" className='conversation-holder__avatar' />
            <div className="conversation-holder__deatils">
                <div className="conversation-holder__deatils__name">
                    {props.name}
                </div>
                <div className="conversation-holder__deatils__status">
                    {props.isDirect ?  (props.status ? "online" : "offline")  : (<div> {props.members}  Member </div> ) }
                </div>
            </div>
        </div>
    )
}

export default Conversation