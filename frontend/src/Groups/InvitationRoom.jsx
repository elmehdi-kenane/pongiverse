import { useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";

const InvitationRooms = (props) => {
  const {socket, user} = useContext(AuthContext)
  const onClickAcceptInvitaion = () => {
    if(socket) {
      socket.send(JSON.stringify({
        type : 'roomInvitationAccepted',
        message : {
          user : user,
          room : props.name
        }
      }))
    }
  }

  const onClickCanelRoomInvitation = () => {
    if(socket) {
      socket.send(JSON.stringify({
        type : 'roomInvitationCancelled',
        message : {
          user : user,
          room : props.name
        }
      }))
    }
  }
  return (
    <div className="invitation-room-box">
      <div className="invitation-room-details-container">
        <img
          src={props.room_icon[props.index]}
          className="invitation-room-avatar"
          alt=""
        />
        <div className="invitation-room-infos">
          <div className="invitation-room-name">{props.name}</div>
          <div className="invitation-room-members">{props.membersCount} Members</div>
        </div>
        <div className="accept-and-cancel-bnts">
          <button className="accept-room-invitation" onClick={onClickAcceptInvitaion}>Accept</button>
          <button className="cancel-room-invitation" onClick={onClickCanelRoomInvitation}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InvitationRooms;
