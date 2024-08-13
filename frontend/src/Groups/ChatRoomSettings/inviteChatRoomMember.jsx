import { useContext, useEffect, useState } from "react";
import ChatRoomInvitee from "./chatRoomInvitee";
import AuthContext from "../../navbar-sidebar/Authcontext";


const InviteChatRoomMember = (props) => {
const [allFriends, setAllFriends] = useState([]);
const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllFriends = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/chatAPI/listAllFriends",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
              room: props.name,
            }),
          }
        );
        const data = await response.json();
        setAllFriends(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (props.inviteMember) fetchAllFriends();
  }, [props.inviteMember]);

    return (
        <div className="room-invite-member-wrapper">
          <img
            src={props.closeButton}
            alt=""
            className="room-invite-member-close-button"
            onClick={() => props.setInviteMember(false)}
          />
          {allFriends.map((friend, index) => (
            <ChatRoomInvitee
              key={index}
              name={friend.name}
              roomName={props.name}
            />
          ))}
        </div>
    )
}

export default InviteChatRoomMember