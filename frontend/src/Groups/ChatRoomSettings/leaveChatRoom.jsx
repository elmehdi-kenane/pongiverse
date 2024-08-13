const LeaveChatRoom = (props) => {
  return (
    <div className="room-leave-wrapper">
      <div className="room-leave-confirmation-message">
        Are you Sure you want to leave
      </div>
      <div className="room-leave-buttons">
        <button
          className="room-leave-cancel-button"
          onClick={() => props.setLeaveRoom(false)}
        >
          CANCEL
        </button>
        <button
          className="room-leave-confirm-button"
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default LeaveChatRoom;
