import { useContext } from "react";
import ChatContext from "../Groups/ChatContext";


const SmallScreenConversation = (props) => {
  const {directsImages} = useContext(ChatContext)

  const setSelectedConversation = () => {
    console.log(props.status)
    props.setSelectedDirect ( {
      name: props.name,
      status : props.status,
      avatar : directsImages[props.index],
    })
  }
  return (
    <div className="sm-screen-conversation-item" onClick={setSelectedConversation}>
      <img
        src={directsImages[props.index]}
        alt=""
        className="sm-screen-conversation-item-avatar"
      />
      <div className="sm-screen-conversation-item-details">
        <div className="sm-screen-conversation-item-name">{props.name}</div>
        <div className="sm-screen-conversation-item-last-msg">
          whach akhii mohammed hani, cv, sah aja jajjaja jjaj ajja akda jkda jbda jbda jbdajj jja
        </div>
      </div>
    </div>
  );
};

export default SmallScreenConversation;
