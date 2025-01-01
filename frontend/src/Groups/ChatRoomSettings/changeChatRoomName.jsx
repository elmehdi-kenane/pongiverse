import ChatContext from "../../Context/ChatContext";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const ChangeChatRoomName = (props) => {
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();
  //update the chat room name in the chatRoomConversatios array
  const chatRoomNameChangedUpdater = (data) => {
    const allMyChatRooms = props.myChatRooms;

    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.id === data.id) {
        return { ...room, name: data.newName };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    props.setMyChatRooms(updatedRooms);
  };

  //post the new chat room name to backend
  const changeRoomNameSubmitHandler = () => {
    const updateChatRoomName = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/chatRoomUpdateName/${props.roomId}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newRoomName }),
          }
        );
        if (response.status === 401)
          navigate('/signin')
        const data = await response.json();
        chatRoomNameChangedUpdater(data.data);
      } catch (error) {
        toast(error);
      }
    };
    updateChatRoomName();
    props.setChangeRoomName(false);
    props.setShowSettings(false);
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
      <button onClick={() => props.setChangeRoomName(false)}>Cancel</button>
      <button onClick={changeRoomNameSubmitHandler}>Update</button>
    </div>
  </div>
  );
};

export default ChangeChatRoomName;
