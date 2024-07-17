import { useContext } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";

const ChatConversationItem = (props) => {
  const {directsImages} = useContext(ChatContext);

    const handleClick = () => {
        if(props.isDirect && props.name) {
            props.setSelectedDirect ({
                name: props.name,
                avatar : directsImages[props.imageIndex],
                status : props.status,
                
            })
        }else if (!props.isDirect) {
            props.setSelectedChannel({
                name: props.name,
                roomId: props.roomId,
            });
        }    
      };
    return (
        <div className="chat-conversation-item" onClick={handleClick}>
              <img
                src={ChatIcons.DefaultAvatar}
                alt=""
                className="conversation-item-avatar"
              />
              <div className="conversation-item-details">
                <div className="conversation-item-name">
                  {props.name}
                </div>
                <div className="conversation-item-last-msg">
                  whach akhii mohammed hani
                </div>
              </div>
            </div>
    )
}

export default ChatConversationItem