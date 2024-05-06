import { useEffect } from 'react'
import './Chat.css'
import Avatar from './avatar.svg'

const MyMessage = (props) => {
    return (
        <div className="message-row__my-message">
            <div className="message-row__mymessage__text my-message" >
                {props.content}
            </div>
            <img  className="message-row__mymessage__avatar" src={Avatar} alt="" />
        </div>
    )
}

export default MyMessage