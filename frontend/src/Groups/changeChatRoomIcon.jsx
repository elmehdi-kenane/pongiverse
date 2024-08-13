

const ChangeChatRoomIcon = (props) => {
    return (
        <div className="room-update-avatar-wrapper">
          <div className="room-update-avatar-content">
            <img
              src={ChatIcons.RoomIcon}
              alt=""
              className="room-update-avatar-preview"
            />
            <label htmlFor="update-room-image" id="room-update-avatar-label">
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
          <div className="room-update-avatar-buttons">
            <button onClick={() => setUpdateRoomAvatar(false)}>Cancel</button>
            <button onClick={changeRoomIconSubmitHandler}>Save</button>
          </div>
        </div>
    )
}
export default ChangeChatRoomIcon