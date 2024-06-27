import { useState } from "react";
import * as ChatIcons from "../assets/chat/media";

const MyRoom = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [leaveRoom, setLeaveRoom] = useState(false);
  const [changeRoomName, setChangeRoomName] = useState(false);
  const [updateRoomAvatar, setUpdateRoomAvatar] = useState(false);
  const [deleteRoom, setDeletRoom] = useState(false);
  const [addRoomAdmin, setAddRoomAdmin] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const showRoomSettings = () => {
    console.log("i clicked show settings");
    setShowSettings(true);
  };
  return (
    <div className="room-box">
      <div className="room-details">
        <img src={ChatIcons.RoomIcon} className="room-avatar" alt="" />
        <div className="room-infos">
          <div className="room-name">No Hesi</div>
          <div className="room-members">144 Member</div>
        </div>
      </div>
      <div className="room-desc">
        Lorem Ipsum is simply dummy text of the printing and
      </div>
      <div className="btn-and-settings">
        <button className="leave-room" onClick={() => setLeaveRoom(true)}>
          Leave Channel
        </button>
        <img
          src={ChatIcons.RoomSettings}
          className="room-settings"
          onClick={showRoomSettings}
        />
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
          <input type="text" className="change-room-name-input" />
          <div className="change-room-name-btns">
            <button onClick={() => setChangeRoomName(false)}>Cancel</button>
            <button>Save</button>
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
            <label for="update-room-image" id="upate-room-image-label">
              Select an Image
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/png, image/jpeg"
              id="update-room-image"
            />
          </div>
          <div className="update-room-avatar-btns">
            <button onClick={() => setUpdateRoomAvatar(false)}>Cancel</button>
            <button>Save</button>
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
              <img src={ChatIcons.mmaqbourImage} alt="" className="invite-room-member-image"/>
              <div className="add-admin-member-name">Mohammed</div>
            </div>
            <button className="add-room-admin-btn">Add Admin</button>
          </div>
        </div>
      )}
      {/* {inviteMember && (
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
              <div className="add-admin-member-name">Mohammed</div>
            </div>
            <button className="invite-room-member-btn">Invite</button>
          </div>
        </div>
      )} */}
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
            <button className="confirm-leave-confirm-btn">CONFIRM</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoom;
