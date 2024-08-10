import { useContext } from "react";
import { useClickOutSide } from "../Chat/chatConversation";
import CloseIcon from "@mui/icons-material/Close";
import InvitationRoom from "./InvitationRoom";
import ChatContext from "./ChatContext";

const RoomsNotifications = (props) => {
  const { chatRoomInvitationsIcons, chatRoomInvitations } =
    useContext(ChatContext);

  const handleClickOutside = () => {
    props.setShowRoomNotifications(false);
    props.setIsBlur(false);
  };
  let notifRef = useClickOutSide(() => {
    handleClickOutside();
  });

  return (
    <div ref={notifRef} className="rooms-notifications-container-active">
      <div className="room-invitation-header">
        <h3 className="room-invition-title">Room Invitations</h3>
        <CloseIcon
          className="create-room-close-icon"
          onClick={() => {
            props.setShowRoomNotifications(false);
            props.setIsBlur(false);
          }}
        />
      </div>
      {chatRoomInvitations.length ? (
        chatRoomInvitations.map((room, index) => (
          <InvitationRoom
            roomIcon={chatRoomInvitationsIcons[index]}
            name={room.name}
            members={room.membersCount}
          />
        ))
      ) : (
        <div className="room-ivnitation-wrapper-empty">
          You currently have no chat room invitations{" "}
        </div>
      )}
    </div>
  );
};

export default RoomsNotifications;
