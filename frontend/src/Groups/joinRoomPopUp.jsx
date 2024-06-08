const JoinRoom = () => {
  return (
    <div className="join-room-container">
      <div className="join-room-header">Join a Channel</div>
      <form action="" className="join-room-form">
        <input type="text" placeholder="Room name" />
        <input type="text" placeholder="Password" />
      </form>
      <div className="join-btns">
        <button className="cancel-room">CANCEL</button>
        <button className="join-room">JOIN</button>
      </div>
    </div>
  );
};

export default JoinRoom;
