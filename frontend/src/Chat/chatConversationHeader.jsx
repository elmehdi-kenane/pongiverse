import { useNavigate } from "react-router-dom";
import * as ChatIcons from "../assets/chat/media/index";

const inviteFriend = (chatSocket, user, target) => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
     console.log("inside join");
      chatSocket.send(
        JSON.stringify({
          type: "inviteFriendGame",
          message: {
            user: user,
            target: target,
          },
        })
      );
    }
  };


const ChatConversationHeader = (props) => {
    const navigate = useNavigate();
    return (
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() =>
              props.setSelectedDirect({
                id: "",
                name: "",
                avatar: "",
                status: "",
              })
            }
          />
          <img
            src={props.selectedDirect.avatar}
            alt="Avatar"
            className="conversation-avatar"
            onClick={()=>navigate(`/mainpage/profile/${props.selectedDirect.name}`)}
          />
          <div className="conversation-details">
            <div className="conversation-name" onClick={()=>navigate(`/mainpage/profile/${props.selectedDirect.name}`)}>{props.selectedDirect.name}</div>
            <div className="conversation-info">
              {props.selectedDirect.status ? "online" : "offline"}
            </div>
          </div>
        </div>
        <div className="conversation-options" ref={props.domNode}>
          <img
            src={ChatIcons.InviteToPlay}
            alt="Invite"
            className="conversation-invite-icon"
            onClick={()=>inviteFriend(props.chatSocket, props.user, props.selectedDirect.name)}
          />
          <div className="conversation-options-wrapper">
            <img
              onClick={() => {
                props.showDirectOptions
                  ? props.setShowDirectOptions(false)
                  : props.setShowDirectOptions(true);
              }}
              src={ChatIcons.ThreePoints}
              alt="Options"
              className="conversation-options-icon"
            />
            {props.showDirectOptions ? (
              <div className="direct-options-container">
                <div
                  className="view-profile-option"
                  onClick={() => navigate("/mainpage/profile/" + props.selectedDirect.name)}
                >
                  View Profile
                </div>
                <div className="block-friend-option" onClick={()=> props.setShowBlockPopup(true)}>Block</div>
                {/* <div className="change-wallpaper-option">Wallpaper</div> */}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  };

  export default ChatConversationHeader