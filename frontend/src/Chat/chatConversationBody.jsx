import MyMessage from "./myMessage";
import OtherMessage from "./otherMessage";

const ChatConversationBody = (props) => {
    return (
      <div
        className="conversation-body"
        id="start"
        ref={props.messgesInnerRef}
        onScroll={props.onScrollCoversationBody}
      >
        {props.messages.length !== 0 &&
          props.messages &&
          props.messages.map((message, index) =>
            message.sender === props.user ? (
              <MyMessage
                key={index}
                name={props.user}
                content={message.content}
                avatar={props.userImg}
                date={message.date}
              />
            ) : (
              <OtherMessage
                key={index}
                name={message.sender}
                content={message.content}
                avatar={props.selectedDirect.avatar}
                date={message.date}
              />
            )
          )}
        <div ref={props.messageEndRef}></div>
      </div>
    );
  };
export default ChatConversationBody
