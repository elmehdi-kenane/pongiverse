const JoinRoom = (props) => {
  return (
    <div className="join-room-container">
      <div className="join-room-header">Join a Channel</div>
      <div className="join-visibility-btns">
        <div className="join-visibility-text">
          Please Select Room Visibility:{" "}
        </div>
        <div className="select-visibilty-lables">
          <label class="room-visibility-check">
            Public
            <input type="radio" checked="checked" name="radio" />
          </label>
          <label class="room-visibility-check">
            Protected
            <input type="radio" name="radio" />
          </label>
        </div>
      </div>
      <form action="" className="join-room-form">
        <input type="text" placeholder="Room name" />
        <input type="text" placeholder="Password" />
      </form>
      <div className="join-btns">
        <button className="cancel-room" onClick={props.onClose}>
          CANCEL
        </button>
        <button className="join-room">JOIN</button>
      </div>
    </div>
  );
};

export default JoinRoom;
