import { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import toast from "react-hot-toast";
import ChatContext from "../../Context/ChatContext";

const SuggestedRoom = (props) => {
  const {user} = useContext(AuthContext)
  const {suggestedChatRoomsRef , setSuggestedChatRooms} = useContext(ChatContext)

  const joinChatRoomSubmitter = async () => {
    const toastId = toast.loading("Joining the chat room...");
    try  {
      const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/joinChatRoom`, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
          user : user,
          roomId: props.roomId
        })
      })
      const data = await response.json()
      if(response.ok) { 
        setTimeout(() => {
          toast.success("Successfully joined the chat room!");
          toast.dismiss(toastId); // Dismiss the loading toast
          let suggestedChatRooms = suggestedChatRoomsRef.current
          let updatedSuggestedRooms = suggestedChatRooms.filter(
            (room) => room.id !== props.roomId
          );
          setSuggestedChatRooms(updatedSuggestedRooms)
          const currentChatRooms = props.myChatRooms;
          props.setMyChatRooms([...currentChatRooms, data.room]);
        }, 2000); // Adjust the delay time (in milliseconds) as needed
      } else {
        setTimeout(() => {
          toast.dismiss(toastId); // Dismiss the loading toast
          toast.error(data.error)
        }, 500);
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="my-room-container">
      <div className="my-room-header">
        <div
          className="my-room-cover-wrapper"
          style={{
            backgroundImage: `url(${props.cover})`,
          }}
        ></div>
        <div className="my-room-info">
          <img
            src={props.icon}
            alt=""
            className="my-room-icon"
          />
        </div>
      </div>
      <div className="my-room-name-and-topic">
        <div className="my-room-name">{props.name}</div>
        <div className="my-room-topic">{props.topic}</div>
      </div>
      <div className="room-actions">
        <button className="join-room-button" onClick={joinChatRoomSubmitter}>Join Room</button>
      </div>
    </div>
  );
};

export default SuggestedRoom;
