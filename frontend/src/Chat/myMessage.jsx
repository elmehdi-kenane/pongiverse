import { useContext } from "react";
import "../assets/chat/Chat.css";
import ChatContext from "../Context/ChatContext";

const MyMessage = (props) => {
  const { isHome } = useContext(ChatContext);
  return (
    <div className="my-message-row message-row">
      <div className="my-message-content-wrapper">
        <div className="my-message-row-sender-name">{props.name}</div>
        <div className="my-message-content message-content">
          {props.content}
        </div>
        <div className="my-message-row-sender-date">{props.date}</div>
      </div>
      {isHome ? (
        <img className="my-message-avatar" src={props.avatar} alt="" />
      ) : (
        ""
      )}
    </div>
  );
};

export default MyMessage;
