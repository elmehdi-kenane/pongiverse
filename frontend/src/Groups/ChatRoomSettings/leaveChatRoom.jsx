import toast from "react-hot-toast";
import AuthContext from "../../navbar-sidebar/Authcontext";
import { useContext } from "react";
import ChatContext from "../../Context/ChatContext";

const LeaveChatRoom = (props) => {
  const {user} = useContext(AuthContext)
  const { chatRoomConversationsRef, setChatRoomConversations } =
    useContext(ChatContext);
  const memeberLeaveChatRoomUpdater = (data) => {
    const allMyChatRooms = chatRoomConversationsRef.current;
    if (data && data.user === user) {
      const updatedRooms = allMyChatRooms.filter(
        (myroom) => myroom.id !== data.id
      );
      setChatRoomConversations(updatedRooms);
    } 
  };

  const leaveChatRoomSubmitter = async () => {
    try {
      const response = await fetch (`http://localhost:8000/chatAPI/leaveChatRoom`, {
        method: "POST",
        headers: {'content-type' : 'application/json',},
        body : JSON.stringify ({
          member: user,
          roomId: props.roomId,
        })
      })
      const data = await response.json()
      if(response.ok) {
        console.log(data)
        toast.success(data.success)
        memeberLeaveChatRoomUpdater(data.data)
      } else toast.error(data.error)
    }catch (error) {
      console.log(error)
    }
  }

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
        <button className="room-leave-confirm-button" onClick={leaveChatRoomSubmitter}>CONFIRM</button>
      </div>
    </div>
  );
};

export default LeaveChatRoom;
