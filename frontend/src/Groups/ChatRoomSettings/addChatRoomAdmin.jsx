import { useContext, useEffect, useState } from "react";
import ChatRoomMember from "./chatRoomMember";
import ChatContext from "../../Context/ChatContext";

const AddChatRoomAdmin = (props) => { 
  const {allChatRoomMembers, setAllChatRoomMembers} = useContext(ChatContext);

  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/allRoomMembers/${props.name}`
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
          <div className="room-add-admin-list-wrapper">
          {allChatRoomMembers.map((memeber, index) => (
            <ChatRoomMember
              key={index}
              name={memeber.name}
              roomName={props.name}
            />
          ))}
          </div>
        </div>
    )

}

export default AddChatRoomAdmin;

