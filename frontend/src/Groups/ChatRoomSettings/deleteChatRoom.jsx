import toast from "react-hot-toast"

const DeleteChatRoom = (props) => {

  const deleteChatRoomHandler = async ()=> {
    try {

      const response = await fetch(`http://localhost:8000/chatAPI/deleteChatRoom/${props.roomId}`, {
        method: "DELETE"
      })
      if(response.ok) {
        let data = await response.json()
        toast.success(data.success)
      }
      else
      toast.error("Opps, Something Went Wrong!")
  } catch (error) {
    toast.error("Opps, Something Went Wrong!")
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