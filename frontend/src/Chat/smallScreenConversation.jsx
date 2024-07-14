import { useContext } from "react";
import ChatContext from "../Groups/ChatContext";


const SmallScreenConversation = (props) => {

    const {directsImages} = useContext(ChatContext)
  return (
    <div className="small-screen-conversation-container">
      <img
        src={directsImages[props.index]}
        alt=""
        className="small-screen-avatar"
      />
      <div className="small-screen-conversation-detainls">
        <div className="small-screen-conversation-name">{props.name}</div>
        <div className="small-screen-conversation-lst-msg">
          whach akhii mohammed hani, cv dad knadlkad ndkakdan kndakndka
          kndandkakndan ldalmda
        </div>
      </div>
    </div>
  );
};

export default SmallScreenConversation;
