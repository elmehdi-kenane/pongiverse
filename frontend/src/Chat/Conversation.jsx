import { useState } from 'react';
import * as ChatIcons from '../assets/chat/media'

import "../assets/chat/Chat.css";
import { useNavigate } from 'react-router-dom';

const Conversation = (props) => {
    const navigate = useNavigate();
    const [isSelected, setIsSelected] = useState(false)
    const handleClick = () => {
        props.setSelectedChannel({
            name: props.name,
            roomId: props.roomId,
        });
        // setIsSelected(true)
        navigate(`${props.roomId}`);
      };
    return (
        <div id={props.roomId} className={ !isSelected ? "conversation-holder" : "conversation-holder--selected "} onClick={handleClick}>
            <img src={ChatIcons.DefaultAvatar} alt="" className='conversation-holder__avatar' />
            <div className="conversation-holder__deatils">
                <div className="conversation-holder__deatils__name">
                    {props.name}
                </div>
                <div className="conversation-holder__deatils__status">
                    online
                </div>
            </div>
        </div>
    )
}

export default Conversation