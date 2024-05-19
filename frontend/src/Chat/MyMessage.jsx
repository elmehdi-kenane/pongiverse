import { useEffect } from 'react'
import * as ChatIcons from '../assets/chat/media'

import "../assets/chat/Chat.css";

const MyMessage = (props) => {
    return (
        <div className="message-row__my-message">
            <div className="message-row__mymessage__text my-message" >
                {props.content}
            </div>
            <img  className="message-row__mymessage__avatar" src={ChatIcons.DefaultAvatar} alt="" />
        </div>
    )
}

export default MyMessage