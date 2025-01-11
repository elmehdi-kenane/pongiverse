import { useContext } from "react"
import "../assets/chat/Chat.css"
import ChatContext from "../Context/ChatContext"
import {useNavigate} from "react-router-dom"

const OtherMessage = (props) => {
  const navigate = useNavigate()
  const { isHome } = useContext(ChatContext)
  return (
    <div className="other-message-row message-row" ref={(props.length - 1) === props.index ? props.endRef : null}>
      {isHome ? (
        <img className="other-message-avatar" src={props.avatar} alt=""  onClick={()=>navigate(
          `/mainpage/profile/${props.name}`
        )}/>
      ) : (
        ""
      )}
      <div className="other-message-content-wrapper">
        <div className="my-message-row-sender-name"onClick={()=>navigate(
          `/mainpage/profile/${props.name}`
        )}>{props.name}</div>
        <div className="other-message-content message-content">
          {props.content}
        </div>
        <div className="my-message-row-sender-date">{props.date}</div>
      </div>
    </div>
  )
}

export default OtherMessage
