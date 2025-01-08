import toast from "react-hot-toast"

const DeleteChatRoom = (props) => {

  const chatRoomDeletedUpdater = (data) => {
    const allMyChatRooms = props.myChatRooms
    const updatedRooms = allMyChatRooms.filter(
      (room) => room.id !== data.roomId
    )
    props.setMyChatRooms(updatedRooms)
    props.setDeletRoom(false)
    props.setShowSettings(false)
  }
  const deleteChatRoomHandler = async () => {
    const toastId = toast.loading("Deleting chat room...")
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/deleteChatRoom/${props.roomId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTimeout(() => {
          toast.success(data.success)
          toast.dismiss(toastId)
          chatRoomDeletedUpdater(data.data)
        }, 1000)
      } else if (response.status === 401)
        navigate('/signin')
      else {
        setTimeout(() => {
          toast.dismiss(toastId)
          toast.error("Failed to delete chat room")
        }, 500)
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("An error occurred. Please try again later.")
    }
  }


  return (
    <div className="room-delete-wrapper">
      <div className="room-delete-title">
        Are You Sure You Wanna Delete Room
      </div>
      <div className="room-delete-buttons">
        <button onClick={() => props.setDeletRoom(false)}>Cancel</button>
        <button onClick={deleteChatRoomHandler}>Delete</button>
      </div>
    </div>
  )
}

export default DeleteChatRoom
