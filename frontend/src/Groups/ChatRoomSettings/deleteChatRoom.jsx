

const DeleteChatRoom = (props) => {
    return (
        <div className="room-delete-wrapper">
          <div className="room-delete-title">
            Are You Sure You Wanna Delete Room
          </div>
          <div className="room-delete-buttons">
            <button onClick={() => props.setDeletRoom(false)}>Cancel</button>
            <button>Delete</button>
          </div>
        </div>
    )
}

export default DeleteChatRoom 