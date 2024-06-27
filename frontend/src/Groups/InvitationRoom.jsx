import * as ChatIcons from "../assets/chat/media";

const InvitationRooms = () => {
  return (
    <div className="invitation-room-box">
      {/* <div className="invitation-owner">Mehdi Invites You to Join No Hesi</div> */}
      <div className="invitation-room-details-container">
        <img
          src={ChatIcons.RoomIcon}
          className="invitation-room-avatar"
          alt=""
        />
        <div className="invitation-room-infos">
          <div className="invitation-room-name">No Hesi 12345</div>
          <div className="invitation-room-members">144 Member</div>
        </div>
        <div className="accept-and-cancel-bnts">
          <button className="accept-room-invitation">Accept</button>
          <button className="cancel-room-invitation">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InvitationRooms;
