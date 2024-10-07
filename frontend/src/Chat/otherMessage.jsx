import { useContext } from "react";
import "../assets/chat/Chat.css";
import ChatContext from "../Context/ChatContext";

const OtherMessage = (props) => {
  const { isHome } = useContext(ChatContext);
  return (
    <div className="other-message-row message-row" ref={(props.length - 1) === props.index ? props.endRef : null}>
      {isHome ? (
        <img className="other-message-avatar" src={props.avatar} alt="" />
      ) : (
        ""
      )}
      <div className="other-message-content-wrapper">
        <div className="my-message-row-sender-name">{props.name}</div>
        <div className="other-message-content message-content">
          {props.content}
        </div>
        <div className="my-message-row-sender-date">{props.date}</div>
      </div>
    </div>
  );
};

export default OtherMessage;
