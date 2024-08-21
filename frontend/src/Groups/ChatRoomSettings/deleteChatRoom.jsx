import toast from "react-hot-toast";
import ChatContext from "../../Context/ChatContext";
import { useContext } from "react";

const DeleteChatRoom = (props) => {
  const { chatRoomConversationsRef, setChatRoomConversations } =
    useContext(ChatContext);

  const chatRoomDeletedUpdater = (data) => {
    const allMyChatRooms = chatRoomConversationsRef.current;
    const updatedRooms = allMyChatRooms.filter(
      (room) => room.id !== data.roomId
    );
    setChatRoomConversations(updatedRooms);
  };
  const deleteChatRoomHandler = async () => {
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/deleteChatRoom/${props.roomId}`,
        {
          method: "DELETE",
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("im Hereeeeeeeeeee");
        chatRoomDeletedUpdater(data.data);
        toast.success(data.success);
      } else {
        toast.error(data.error || "Failed to delete chat room");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };
  

  return (
    <div className="room-delete-wrapper">
      <div className="room-delete-title">
        Are You Sure You Wanna Delete Room
      </div>
      <div className="room-delete-buttons">
        <button onClick={() => props.setDeletRoom(false)}>Cancel</button>
        <button onClick={deleteChatRoomHandler}>Delete</button>
      </div>
    </div>
  );
};

export default DeleteChatRoom;
