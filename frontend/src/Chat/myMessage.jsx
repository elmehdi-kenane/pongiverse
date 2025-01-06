import { useContext } from "react"
import "../assets/chat/Chat.css"
import ChatContext from "../Context/ChatContext"
import { useNavigate } from "react-router-dom"

const MyMessage = (props) => {
  const navigate = useNavigate()
  const { isHome } = useContext(ChatContext)
  return (
    <div className="my-message-row message-row" ref={(props.length - 1) === props.index ? props.endRef : null}>
      <div className="my-message-content-wrapper">
        <div className="my-message-row-sender-name" onClick={()=>navigate(`/mainpage/profile/${props.name}`)}>{props.name}</div>
        <div className="my-message-content message-content">
          {props.content}
        </div>
        <div className="my-message-row-sender-date">{props.date}</div>
      </div>
      {isHome ? (
        <img className="my-message-avatar" src={props.avatar} alt="" onClick={()=>navigate(`/mainpage/profile/${props.name}`)}/>
      ) : (
        ""
      )}
    </div>
  )
}

export default MyMessage
