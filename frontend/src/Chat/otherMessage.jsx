import * as ChatIcons from "../assets/chat/media";

import "../assets/chat/Chat.css";

const OtherMessage = (props) => {
  return (
    <div className="other-message-row message-row">
      <img className="other-message-avatar" src={props.avatar} alt="" />
      <div className="other-message-content message-content">
        {props.content}
      </div>
    </div>
  );
};

export default OtherMessage;
