import { useContext } from "react"
import { useClickOutSide } from "../../Chat/chatConversation"
import CloseIcon from "@mui/icons-material/Close"
import InvitationRoom from "./InvitationRoom"
import ChatContext from "../../Context/ChatContext"

const RoomsNotifications = (props) => {
  const {chatRoomInvitations } =
    useContext(ChatContext)

  const handleClickOutside = () => {
    props.setShowRoomNotifications(false)
    props.setIsBlur(false)
  }
  let notifRef = useClickOutSide(() => {
    handleClickOutside()
  })

  return (
    <div ref={notifRef} className="rooms-notifications-container-active">
      <div className="room-invitation-header">
        <h3 className="room-invition-title">Room Invitations</h3>
        <CloseIcon
          className="create-room-close-icon"
          onClick={() => {
            props.setShowRoomNotifications(false)
            props.setIsBlur(false)
          }}
        />
      </div>
      <div className="room-invitation-list-wrapper">
      {chatRoomInvitations.length ? (
        chatRoomInvitations.map((room, index) => (
          <InvitationRoom
            key={index}
            name={room.name}
            icon={room.icon}
            members={room.membersCount}
            id={room.id}
            myChatRooms={props.myChatRooms}
            setMyChatRooms={props.setMyChatRooms}
            handleClickOutside={handleClickOutside}
          />
        ))
      ) : (
        <div className="room-ivnitation-wrapper-empty">
          You currently have no chat room invitations{" "}
        </div>
      )}
      </div>
    </div>
  )
}

export default RoomsNotifications
