import CloseIcon from "@mui/icons-material/Close"
import { useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import '../../Profile/Profile.css'
import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded'
import ChatContext from "../../Context/ChatContext"
import { useNavigate } from "react-router-dom"
const ChatRoomMembersList = (props) => {
  const [chatRoomMembers, setChatRoomMembers] = useState([])
  const { selectedChatRoom } = useContext(ChatContext)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/chatRoomMembersList`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              id: selectedChatRoom.id,
            }),
          }
        )
        const data = await response.json()
        if (response.ok) {
          setChatRoomMembers(data)
        } else if (response.status === 401)
          navigate("/signin")
        else toast(data.error)
      } catch (error) {
        toast(error.error)
      }
    }
    if (props.showChatRoomMembers) {
      fetchAllChatRoomMembers()
    }
  }, [props.showChatRoomMembers])

  return (
    <div className="chat-room-members-container">
      <div className="create-room-header">
        <h1 className="create-room-title">Chat Room Members List</h1>
        <CloseIcon
          className="create-room-close-icon"
          onClick={() => props.setShowChatRoomMembers(false)}
        />
      </div>
      <div className="chat-room-members-list">
        {chatRoomMembers.length !== 0 &&
          chatRoomMembers.map((member, key) => {
            return (
              <div className="chat-room-member" key={key}>
                <div className="chat-room-member-name">
                  <img src={member.avatar} alt="playerImg" className="chat-room-member-avatar" />
                  <p> {member.username} </p>
                </div>
                <div className="chat-room-member-message-button" onClick={()=>navigate(`/mainpage/profile/${member.username}`)}>
                  <AccountBoxRoundedIcon />
                  <p style={{ cursor: "pointer" }}> Profile </p>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default ChatRoomMembersList
