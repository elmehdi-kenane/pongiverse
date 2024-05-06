import { useState } from 'react';
import Avatar from './avatar.svg'
import './Chat.css'

const Conversation = (props) => {
    const [isActive, setIsActive] = useState(false)
    const handleClick = () => {
        setIsActive(true)
        props.setSelectedChannel({
            name: props.name,
            roomId: props.roomId,
        });
      };
    return (
        <div className={isActive ? "conversation-holder--active" : "conversation-holder"} onClick={handleClick}>
            <img src={Avatar} alt="" />
            <div className="conversation-holder__deatils">
                <div className="conversation-holder__deatils__name">
                    {props.name}
                </div>
                <div className="conversation-holder__deatils__status">
                    14 Members
                </div>
            </div>
        </div>
    )
}

export default Conversation