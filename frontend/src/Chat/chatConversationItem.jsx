import { useContext, useEffect, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";

const ChatConversationItem = (props) => {
  const {directsImages, chatRoomIcons} = useContext(ChatContext);
    const handleClick = () => {
        if(props.isDirect && props.name) {
            props.setSelectedDirect ({
                name: props.name,
                avatar : directsImages[props.imageIndex],
                status : props.status,
                
            })
        }else if (!props.isDirect && props.name) {
            props.setSelectedChatRoom({
                name: props.name,
                memberCount: props.membersCount,
                icon: chatRoomIcons[props.imageIndex],
                roomId: props.roomId,
            });
        }
        props.setSelectedItem(props.name)
      };
    return (
        <div className={props.isSelected ? "chat-conversation-item chat-conversation-item-active" : "chat-conversation-item " } onClick={handleClick}>
              <img
              
                src={props.isDirect? directsImages[props.imageIndex] : chatRoomIcons[props.imageIndex]}
                alt=""
                className="conversation-item-avatar"
              />
              <div className="conversation-item-details">
                <div className="conversation-item-name">
                  {props.name}
                </div>
                <div className="conversation-item-last-msg">
                  {props.lastMessage}
                </div>
              </div>
            </div>
    )
}

export default ChatConversationItem