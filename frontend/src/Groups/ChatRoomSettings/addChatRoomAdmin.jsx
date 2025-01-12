import { useContext, useEffect } from "react"
import ChatRoomMember from "./chatRoomMember"
import ChatContext from "../../Context/ChatContext"
import { useNavigate } from "react-router-dom"

const AddChatRoomAdmin = (props) => {
  const { allChatRoomMembers, setAllChatRoomMembers } = useContext(ChatContext)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/allRoomMembers/${props.name}`
        )
        if (response.status === 401)
          navigate('/signin')
        const data = await response.json()
        setAllChatRoomMembers(data)
      } catch (error) {
        console.log(error)
      }
    }
    if (props.addRoomAdmin) {
      fetchAllChatRoomMembers()
    }
  }, [props.addRoomAdmin])
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
            avatar={memeber.avatar}
            
          />
        ))}
      </div>
    </div>
  )

}

export default AddChatRoomAdmin

