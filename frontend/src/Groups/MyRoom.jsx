import { useContext, useState } from "react";
import * as ChatIcons from "../assets/chat/media";
import AuthContext from "../navbar-sidebar/Authcontext";
const MyRoom = (props) => {
  const {socket, user} = useContext(AuthContext)
  const [showSettings, setShowSettings] = useState(false);
  const [leaveRoom, setLeaveRoom] = useState(false);
  const [changeRoomName, setChangeRoomName] = useState(false);
  const [updateRoomAvatar, setUpdateRoomAvatar] = useState(false);
  const [deleteRoom, setDeletRoom] = useState(false);
  const [addRoomAdmin, setAddRoomAdmin] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomIcon, setnewRoomIcon] = useState(null)
  const showRoomSettings = () => {
    console.log("i clicked show settings");
    setShowSettings(true);
  };

  const leaveRoomSubmitHandler = () =>{
    if(socket) {
      socket.send(JSON.stringify({
        type: 'leaveRoom',
        message : {
          user : user,
          room: props.name
        }
      }))
    }
  }

  const changeRoomNameSubmitHandler = () => {
    if(socket) {
      socket.send(JSON.stringify({
        type : 'changeRoomName',
        message : {
          room : props.name,
          newName : newRoomName
        }
      }))
    }
    setChangeRoomName(false)
    setShowSettings(false)
  }
  const onChangeChangeRoomAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const base64Image = reader.result.split(',')[1];
        setnewRoomIcon(base64Image)
        const placeHolder = document.getElementsByClassName(
          "live-updated-room-avatar"
        )[0];
        placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  }
  const updateRoomAvatarSubmitHandler = () => {
    if(socket) {
      socket.send(JSON.stringify({
        type : 'changeRoomAvatar',
        message : {
          room : props.name,
          newIcon : newRoomIcon
        }
      }))
    }
    setUpdateRoomAvatar(false)
    setShowSettings(false)
  }

  return (
    <div className="room-box">
      <div className="room-details">
        <img src={props.roomIcons[props.index]} className="room-avatar" alt="" />
        <div className="room-infos">
          <div className="room-name">{props.name}</div>
          <div className="room-members">{props.membersCount} Members</div>
        </div>
      </div>
      <div className="room-desc">
        {props.topic}
      </div>
      <div className="btn-and-settings">
        <button className="leave-room" onClick={() => setLeaveRoom(true)}>
          Leave Room
        </button>
        { props.role === 'admin' ?
          <>
          <img
          src={ChatIcons.RoomSettings}
          className="room-settings"
          onClick={showRoomSettings}
          />
          </> : ''
        }
      </div>
      {showSettings && (
        <div className="room-settings-container">
          <div className="change-room-details">
            <img
              src={ChatIcons.closeButton}
              alt=""
              className="close-setting-btn"
              onClick={() => setShowSettings(false)}
            />
            <div
              className="change-room-name"
              onClick={() => setChangeRoomName(true)}
            >
              Change Room Name
            </div>
            <div
              className="update-room-avatar"
              onClick={() => setUpdateRoomAvatar(true)}
            >
              Update Room Avatar
            </div>
            <div
              className="add-room-admin"
              onClick={() => setAddRoomAdmin(true)}
            >
              Add Room Admin
            </div>
            <div
              className="invite-member-room"
              onClick={() => setInviteMember(true)}
            >
              Invite a Member
            </div>
            <div className="delete-room" onClick={() => setDeletRoom(true)}>
              Delete Room
            </div>
          </div>
        </div>
      )}
      {changeRoomName && (
        <div className="change-room-name-container">
          <div className="change-room-name-head">Enter Room Name</div>
          <input type="text" className="change-room-name-input" placeholder={props.name} onChange={(e)=> setNewRoomName(e.target.value)}/>
          <div className="change-room-name-btns">
            <button onClick={() => setChangeRoomName(false)}>Cancel</button>
            <button onClick={changeRoomNameSubmitHandler}>Update</button>
          </div>
        </div>
      )}
      {updateRoomAvatar && (
        <div className="update-room-avate-container">
          <div className="upload-room-avatar-container">
            <img
              src={ChatIcons.RoomIcon}
              alt=""
              className="live-updated-room-avatar"
            />
            <label htmlFor="update-room-image" id="upate-room-image-label">
              Select an Image
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/png, image/jpeg"
              id="update-room-image"
              onChange={onChangeChangeRoomAvatar}
            />
          </div>
          <div className="update-room-avatar-btns">
            <button onClick={() => setUpdateRoomAvatar(false)}>Cancel</button>
            <button onClick={updateRoomAvatarSubmitHandler}>Save</button>
          </div>
        </div>
      )}
      {addRoomAdmin && (
        <div className="add-room-admin-container">
          <img
            src={ChatIcons.closeButton}
            alt=""
            className="add-admin-close-btn"
            onClick={() => setAddRoomAdmin(false)}
          />
          <div className="add-room-member-list">
            <div className="add-admin-member-infos">
              <img src={ChatIcons.mmaqbourImage} alt="" className="add-room-admin-image"/>
              <div className="add-room-admin-infos">
                <div className="add-admin-member-name">Mohammed</div>
                <div className="add-admin-member-level">level2</div>
              </div>
            </div>
            <button className="add-room-admin-btn">Add Admin</button>
          </div>
        </div>
      )}
      {inviteMember && (
        <div className="invite-room-member-container">
          <img
            src={ChatIcons.closeButton}
            alt=""
            className="invite-member-close-btn"
            onClick={() => setInviteMember(false)}
          />
          <div className="invite-room-member-list">
            <div className="invite-member-infos">
              <img src={ChatIcons.mmaqbourImage} alt="" className="invite-room-member-image"/>
              <div className="invite-room-member-infos">
                <div className="invite-room-member-name">Mohammed</div>
                <div className="invite-room-member-level">level2</div>
              </div>
            </div>
            <button className="invite-room-member-btn">Invite</button>
          </div>
        </div>
      )}
      {deleteRoom && (
        <div className="delete-room-container">
          <div className="delete-room-head">
            Are You Sure You Wanna Delete Room
          </div>
          <div className="delete-room-btns">
            <button onClick={() => setDeletRoom(false)}>Cancel</button>
            <button>Delete</button>
          </div>
        </div>
      )}
      {leaveRoom && (
        <div className="leave-room-container">
          <div className="confirmation-text">
            Are you Sure you want to leave
          </div>
          <div className="confirm-leave-btns">
            <button
              className="confirm-leave-cancel-btn"
              onClick={() => setLeaveRoom(false)}
            >
              CANCEL
            </button>
            <button className="confirm-leave-confirm-btn" onClick={leaveRoomSubmitHandler}>CONFIRM</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoom;
