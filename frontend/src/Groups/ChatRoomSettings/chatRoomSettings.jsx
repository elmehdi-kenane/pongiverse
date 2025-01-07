import CloseIcon from "@mui/icons-material/Close"

const ChatRoomSettings = (props) => {
    return (
        <div className="room-settings-menu">
          <div className="room-settings-actions">
            <div className="room-settings-header">
              <div className="room-settings-head">Room Settings</div>
              <CloseIcon onClick={() => props.setShowSettings(false)}  className="room-settings-close-button"/>
            </div>
            <div
              className="room-settings-change-name"
              onClick={() => props.setChangeRoomName(true)}
            >
              Change Room Name
            </div>
            <div
              className="room-settings-update-avatar"
              onClick={() => props.setUpdateRoomAvatar(true)}
            >
              Update Room Avatar
            </div>
            <div
              className="room-settings-add-admin"
              onClick={() => props.setAddRoomAdmin(true)}
            >
              Add Room Admin
            </div>
            <div
              className="room-settings-invite-member"
              onClick={() => props.setInviteMember(true)}
            >
              Invite a Member
            </div>
            <div
              className="room-settings-delete-room"
              onClick={() => props.setDeletRoom(true)}
            >
              Delete Room
            </div>
          </div>
        </div>
    )
}

export default ChatRoomSettings