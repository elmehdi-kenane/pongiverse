import MyMessage from "./myMessage"
import OtherMessage from "./otherMessage"

const ChatConversationBody = (props) => {
  return (
    <div
      className="conversation-body"
      ref={props.messageBodyRef}
      onScroll={props.handelScroll}
    >
      {props.loading && <div className="loading-messages">Loading...</div>}
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
              length={props.messages.length}
              index={index}
              endRef={props.messageEndRef}
              />
            ) : (
              <OtherMessage
              key={index}
              name={message.sender}
              content={message.content}
              avatar={props.selectedDirect.avatar}
              date={message.date}
              length={props.messages.length}
              index={index}
              endRef={props.messageEndRef}
            />
          )
        )}
    </div>
  )
}

export default ChatConversationBody

