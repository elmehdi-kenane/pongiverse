import { useEffect, useState } from "react";
import ChatRoomMember from "./chatRoomMember";

const AddChatRoomAdmin = (props) => { 
    const [allChatRoomMembers, setAllChatRoomMembers] = useState([]);

  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/allRoomMembers/${props.name}`
        );
        const data = await response.json();
        console.log("all chat room: ", data);
        setAllChatRoomMembers(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (props.addRoomAdmin) {
      fetchAllChatRoomMembers();
    }
  }, [props.addRoomAdmin]);
    return (
        <div className="room-add-admin-wrapper">
          <img
            src={props.closeButton}
            alt=""
            className="room-add-admin-close-button"
            onClick={() => props.setAddRoomAdmin(false)}
          />
          {allChatRoomMembers.map((memeber, index) => (
            <ChatRoomMember
              key={index}
              name={memeber.name}
              roomName={props.name}
            />
          ))}
        </div>
    )

}

export default AddChatRoomAdmin;

