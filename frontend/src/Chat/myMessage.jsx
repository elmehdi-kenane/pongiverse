import { useEffect } from "react";
import * as ChatIcons from "../assets/chat/media";

import "../assets/chat/Chat.css";

const MyMessage = (props) => {
  return (
    <div className="my-message-row message-row">
      <div className="my-message-content message-content">{props.content}</div>
      <img className="my-message-avatar" src={props.avatar} alt="" />
    </div>
  );
};

export default MyMessage;
