import { useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";

const InvitationRoom = (props) => {
  const { socket, user } = useContext(AuthContext);
  const onClickAcceptInvitaion = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "roomInvitationAccepted",
          message: {
            user: user,
            room: props.name,
          },
        })
      );
    }
  };

  const onClickCanelRoomInvitation = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "roomInvitationCancelled",
          message: {
            user: user,
            room: props.name,
          },
        })
      );
    }
  };
  return (
    <div className="invitation-room-container">
      <div className="invitation-room-details">
        <img
          src={props.room_icon[props.index]}
          className="invitation-room-avatar"
          alt=""
        />
        <div className="invitation-room-infos">
          <div className="invitation-room-name">{props.name}</div>
          <div className="invitation-room-member-count">
            {props.membersCount} Members
          </div>
        </div>
      </div>
      <div className="invitation-room-actions">
        <button
          className="room-invitation-accept"
          onClick={onClickAcceptInvitaion}
        >
          Accept
        </button>
        <button
          className="room-invitation-cancel"
          onClick={onClickCanelRoomInvitation}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InvitationRoom;
