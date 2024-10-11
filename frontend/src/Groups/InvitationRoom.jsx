import { useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import CancelIcon from "@mui/icons-material/Cancel";
import * as ChatIcons from "../assets/chat/media";

const InvitationRoom = (props) => {
  const { chatSocket, user } = useContext(AuthContext);
  const onClickAcceptInvitaion = () => {
    if (chatSocket) {
      chatSocket.send(
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
    if (chatSocket) {
      chatSocket.send(
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
    <div className="room-ivnitation-wrapper">
    <div className="room-invitations-infos">
      <img
        src={props.roomIcon}
        alt=""
        className="room-invitation-room-icon"
      />
      <div className="room-invitation-details">
        <div className="room-invitation-name">{props.name}</div>
        <div className="room-invitation-members">{props.members} {parseInt(props.members) > 1 ? "Members" : "Member"}</div>
      </div>
    </div>
    <div className="room-invitation-button-actions">
      <CancelIcon className="room-invitation-cancel-icon" onClick={onClickCanelRoomInvitation}/>
      <button className="room-invitation-accept-button" onClick={onClickAcceptInvitaion}>Accept</button>
    </div>
  </div>
  );
};

export default InvitationRoom;
