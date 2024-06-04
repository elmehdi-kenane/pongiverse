import * as ChatIcons from "../assets/chat/media";

const MyRoom = () => {
  return (
    <div className="myroom-container">
      <img src={ChatIcons.RoomSettings} className="room-settings" />
      <div className="room-details">
        <img src={ChatIcons.RoomIcon} alt="" className="room-icon" />
        <div className="name-and-member">
          <div className="room-name">No Hesi</div>
          <div className="room-members">144 Member</div>
        </div>
      </div>
      <div className="room-description">
        Lorem Ipsum is simply dummy text of the printing and...
      </div>
      <button className="leave-room"> Leave Channel</button>
    </div>
  );
};

export default MyRoom;
