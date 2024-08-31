import * as ChatIcons from "../assets/chat/media";

const SuggestedRoom = (props) => {
  return (
    <div className="my-room-container">
      <div className="my-room-header">
        <div className="my-room-cover-wrapper"></div>
        <div className="my-room-info">
          <img
            src={props.roomIcons[props.index]}
            alt=""
            className="my-room-icon"
          />
        </div>
      </div>
      <div className="my-room-name-and-topic">
        <div className="my-room-name" >{props.name}</div>
        <div className="my-room-topic">{props.topic}</div>
      </div>
      <div className="room-actions">
        <button
          className="room-leave-button"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default SuggestedRoom;