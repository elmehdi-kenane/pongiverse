import * as ChatIcons from '../assets/chat/media'

import "../assets/chat/Chat.css";

const OtherMessage = (props) => {
    return (
        <div className="message-row__other-message">
            <img  className="message-row__other-message__avatar" src={ChatIcons.DefaultAvatar} alt="" />
            <div className="message-row__other-message__text other-message" >
                {props.content}
            </div>
        </div>
    )
}

export default OtherMessage