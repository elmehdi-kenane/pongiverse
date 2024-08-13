const ChangeChatRoomName = (props) => {
  //post the new chat room name to backend
  const changeRoomNameSubmitHandler = () => {
    const updateChatRoomName = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/chatRoomUpdateName/${props.roomId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newRoomName }),
          }
        );
        const data = await response.json();
        chatRoomNameChangedUpdater(data.data);
      } catch (error) {
        toast(error);
      }
    };
    updateChatRoomName();
    setChangeRoomName(false);
    setShowSettings(false);
  };
  return (
    <div className="room-change-name-wrapper">
    <div className="room-change-name-title">Enter Room Name</div>
    <input
      type="text"
      className="change-room-name-input"
      placeholder={props.name}
      onChange={(e) => setNewRoomName(e.target.value)}
    />
    <div className="room-change-name-buttons">
      <button onClick={() => setChangeRoomName(false)}>Cancel</button>
      <button onClick={changeRoomNameSubmitHandler}>Update</button>
    </div>
  </div>
  );
};

export default ChangeChatRoomName;
