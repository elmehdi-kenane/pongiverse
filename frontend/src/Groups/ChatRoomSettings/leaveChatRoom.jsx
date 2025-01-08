import toast from "react-hot-toast"
import AuthContext from "../../navbar-sidebar/Authcontext"
import { useContext } from "react"

export const LeaveChatRoomSubmitter = async (user, rooms, setRooms, roomId) => {
  const toastId = toast.loading("Leaving room is being processed...")
  setTimeout(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/leaveChatRoom`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member: user,
            roomId: roomId,
          }),
        }
      )
      const data = await response.json()
      if (response.ok) {
        toast.success(data.success)
        toast.dismiss(toastId)
        // const allMyChatRooms = rooms
        // if (data && data.data.user === user) {
        //   const updatedRooms = allMyChatRooms.filter(
        //     (myroom) => myroom.id !== data.data.id
        //   )
        //   setRooms(updatedRooms)
        // }
      } else if (response.status === 401)
        navigate('/signin')
      else {
        toast.error(data.error)
      }
    } catch (error) {
      console.log(error)
      toast.error("An error occurred while leaving the chat room.")
    } finally {
      toast.dismiss(toastId)
    }
  }, 1000)
}

const LeaveChatRoom = (props) => {
  const { user } = useContext(AuthContext)

  return (
    <div className="room-leave-wrapper">
      <div className="room-leave-confirmation-message">
        Are you Sure you want to leave
      </div>
      <div className="room-leave-buttons">
        <button
          className="room-leave-cancel-button"
          onClick={() => props.setLeaveRoom(false)}
        >
          CANCEL
        </button>
        <button
          className="room-leave-confirm-button"
          onClick={() => {
            LeaveChatRoomSubmitter(
              user,
              props.myChatRooms,
              props.setMyChatRooms,
              props.roomId
            )
            props.setLeaveRoom(false)
          }}
        >
          CONFIRM
        </button>
      </div>
    </div>
  )
}

export default LeaveChatRoom
