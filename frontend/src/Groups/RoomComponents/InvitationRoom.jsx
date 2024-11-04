import { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import ChatContext from "../../Context/ChatContext";
import CancelIcon from "@mui/icons-material/Cancel";
import toast from "react-hot-toast";

const InvitationRoom = (props) => {
  const {user } = useContext(AuthContext);
  const {chatRoomInvitationsRef, setChatRoomInvitations } = useContext(ChatContext);
  const onClickAcceptInvitaion = async () => {
    const toastId = toast.loading("Processing invitation...");
    try { 
      const response = await fetch (`https://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/accpetChatRoomInvite`, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
          room: props.id,
          user: user,
        })
      })
      const data = await response.json()
      if (response.ok) {
        setTimeout(()=>{
          toast.success(data.success)
          toast.dismiss(toastId);
          let roomInvitations = chatRoomInvitationsRef.current
          let updatedRooms = roomInvitations.filter(
            (room) => room.id !== props.id
          );
          setChatRoomInvitations(updatedRooms)
          const currentChatRooms = props.myChatRooms;
          props.setMyChatRooms([...currentChatRooms, data.room]);
        }, 500)
      } else {
        toast.dismiss(toastId); 
        toast.error(data.error)
      }

    } catch (error) {
      console.log(error)
      toast.error("An error occurred while processing the invitation.");
      toast.dismiss(toastId);
    }
  };

  const onClickCanelRoomInvitation = async () => {
    try {
      const response = await fetch (`https://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/cancelChatRoomInvite`, {
        method: 'POST',
        headers: {'Content-type' : 'application/json'},
        body: JSON.stringify({
          room: props.id,
          user: user,
        })
      })
      const data = await response.json()
      if(response.ok) {
        let roomInvitations = chatRoomInvitationsRef.current
        let updatedRooms = roomInvitations.filter(
          (room) => room.id !== data.roomId
        );
        setChatRoomInvitations(updatedRooms)
      }
      else
        console.log("Error cancelling room invitation")
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="room-ivnitation-wrapper">
    <div className="room-invitations-infos">
      <img
        src={props.icon}
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
