import { useContext, useEffect } from "react"
import AuthContext from "../../navbar-sidebar/Authcontext"
import ChatContext from "../../Context/ChatContext"
import CancelIcon from "@mui/icons-material/Cancel"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const InvitationRoom = (props) => {
  const { user } = useContext(AuthContext)
  const { chatRoomInvitationsRef, setChatRoomInvitations, } = useContext(ChatContext)
  const { privateCheckAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  // useEffect(() => {
  //   privateCheckAuth()
  // }, [])

  const onClickAcceptInvitaion = async () => {
    // const toastId = toast.loading("Processing invitation...")
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/accpetChatRoomInvite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          room: props.id,
          user: user,
        })
      })
        props.handleClickOutside()
      if (response.status === 401)
        navigate('/signin')
      // const data = await response.json()
      // if (response.ok) {
      //   setTimeout(()=>{
      //     toast.success(data.success)
      //     toast.dismiss(toastId)
      //     let roomInvitations = chatRoomInvitationsRef.current
      //     let updatedRooms = roomInvitations.filter(
      //       (room) => room.id !== props.id
      //     )
      //     setChatRoomInvitations(updatedRooms)
      //     const currentChatRooms = props.myChatRooms
      //     props.setMyChatRooms([...currentChatRooms, data.room])
      //   }, 500)
      // } else {
      //   toast.dismiss(toastId) 
      //   toast.error(data.error)
      // }

    } catch (error) {
      toast.error("An error occurred while processing the invitation.")
      // toast.dismiss(toastId)
    }
  }

  const onClickCanelRoomInvitation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/cancelChatRoomInvite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          room: props.id,
          user: user,
        })
      })
      const data = await response.json()
      console.log(data)
      props.handleClickOutside()
      if (response.ok) {
        // let roomInvitations = chatRoomInvitationsRef.current
        // let updatedRooms = roomInvitations.filter(
        //   (room) => room.id !== data.roomId
        // )
        // setChatRoomInvitations(updatedRooms)
      } else if (response.status === 401)
        navigate('/signin')
      else
       console.log("Error cancelling room invitation")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="room-ivnitation-wrapper">
      <div className="room-invitations-infos">
        <img
          src={props.icon}
          alt=""
          className="room-invitation-room-icon"
        />
        <div className="room-invitation-details">
          <div className="room-invitation-name">{props.name}</div>
          <div className="room-invitation-members">{props.members} {parseInt(props.members) > 1 ? "Members" : "Member"}</div>
        </div>
      </div>
      <div className="room-invitation-button-actions">
        <CancelIcon className="room-invitation-cancel-icon" onClick={onClickCanelRoomInvitation} />
        <button className="room-invitation-accept-button" onClick={onClickAcceptInvitaion}>Accept</button>
      </div>
    </div>
  )
}

export default InvitationRoom
