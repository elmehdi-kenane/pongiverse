import { useNavigate } from "react-router-dom"
import * as ChatIcons from "../assets/chat/media/index"
import AuthContext from "../navbar-sidebar/Authcontext"
import { useContext } from "react"
import ChatContext from "../Context/ChatContext"

const ChatConversationHeader = (props) => {

  const navigate = useNavigate()
  const { notifSocket, user } = useContext(AuthContext)
  const {setSelectedItem} = useContext(ChatContext)

  const handelChallengeRequest = () => {
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN && user) {
      notifSocket.send(JSON.stringify({
        type: 'inviteFriendGame',
        message: {
          user: user,
          target: props.selectedDirect.name
        }
      }))
    }
    else
      console.log("Socket ga3ma me7lola")
  }
  return (
    <div className="conversation-header">
      <div className="conversation-header-info">
        <img
          src={ChatIcons.arrowLeft}
          alt=""
          className="conversation-back-arrow"
          onClick={() =>{
            props.setSelectedDirect({
              id: "",
              name: "",
              avatar: "",
              status: "",
            });
            setSelectedItem('')
            props.setMessages([])
          }
          }
        />
        <img
          src={props.selectedDirect.avatar}
          alt="Avatar"
          className="conversation-avatar"
          onClick={() => navigate(`/mainpage/profile/${props.selectedDirect.name}`)}
        />
        <div className="conversation-details">
          <div className="conversation-name" onClick={() => navigate(`/mainpage/profile/${props.selectedDirect.name}`)}>{props.selectedDirect.name}</div>
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
          onClick={handelChallengeRequest}
        />
        <div className="conversation-options-wrapper">
          <img
            onClick={() => {
              props.showDirectOptions
                ? props.setShowDirectOptions(false)
                : props.setShowDirectOptions(true)
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
              <div className="block-friend-option" onClick={() => props.setShowBlockPopup(true)}>Block</div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatConversationHeader