import { useContext, useEffect } from "react"
import ChatRoomInvitee from "./chatRoomInvitee"
import AuthContext from "../../navbar-sidebar/Authcontext"
import ChatContext from "../../Context/ChatContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"


const InviteChatRoomMember = (props) => {
  // const [allFriends, setAllFriends] = useState([])
  const { user } = useContext(AuthContext)
  const { allFriends, setAllFriends } = useContext(ChatContext)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchAllFriends = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/listAllFriends`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
              id: props.id,
            }),
          }
        )
        const data = await response.json()
        if (response.ok) {
          setAllFriends(data)
        } else if (response.status === 401)
          navigate('/signin')
        else toast(data.error)
      } catch (error) {
        console.log(error)
      }
    }
    if (props.inviteMember) fetchAllFriends()
  }, [props.inviteMember])

  return (
    <div className="room-invite-member-wrapper">
      <img
        src={props.closeButton}
        alt=""
        className="room-invite-member-close-button"
        onClick={() => props.setInviteMember(false)}
      />
      <div className="room-invite-member-list-wrapper">
        {allFriends.map((friend, index) => (
          <ChatRoomInvitee
            key={index}
            name={friend.name}
            roomName={props.name}
            avatar={friend.avatar}
          />
        ))}
      </div>
    </div>
  )
}

export default InviteChatRoomMember