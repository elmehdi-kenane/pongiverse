import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import ChatContext from "../../Context/ChatContext"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import toast from "react-hot-toast"

const MyRoomContent = (props) => {
  const navigate = useNavigate()
  const [chatRoomCover, setChatRoomConver] = useState(null)
  const { setIsHome, setSelectedChatRoom, setSelectedItem } = useContext(ChatContext)
  let chatRoomCoverRef = useRef(chatRoomCover)

  const navigateToChatRoom = () => {
    setSelectedChatRoom({
      id: props.roomId,
      name: props.name,
      icon: props.icon,
      membersCount: props.membersCount,
    })
    setIsHome(false)
    setSelectedItem(props.name)
    navigate(`/mainpage/chat`)
  }

  const fileInputRef = useRef(null)

  const handleContainerClick = () => {
    fileInputRef.current.click()
  }

  const udpateChatRoomCover = async () => {
    const formData = new FormData()
    formData.append("room", props.roomId)
    formData.append("cover", chatRoomCover)
    const toastId = toast.loading("Updating chat room cover. Please wait...")
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/changeChatRoomCover`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        setTimeout(() => {
          toast.success(data.success)
          toast.dismiss(toastId)
          // const allMyChatRooms = props.myChatRooms
          // const updatedRooms = allMyChatRooms.map((room) => {
          //   if (room.id === data.data.id) {
          //     return { ...room, cover: data.data.cover }
          //   }
          //   return room
          // })
          // props.setMyChatRooms(updatedRooms)
        }, 1000)
      } else if (response.status === 401)
        navigate('/signin')
      else toast.error(data.error)
    } catch (error) {
      toast.error(error)
      toast.dismiss(toastId)
    }
  }

  const notifyErr = (err) => toast.error(err);

  useEffect(() => {
    chatRoomCoverRef.current = chatRoomCover
    if (chatRoomCover) {
      udpateChatRoomCover()
    }
  }, [chatRoomCover])

  const onChangeIcon = (event) => {
    const file = event.target.files[0]
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      if (file.size > 3 * 1024 * 1024) {
        notifyErr('File size must be less than 3MB.');
        return;
      }
      setChatRoomConver(file)
    } else
    notifyErr('Please select a JPEG or PNG file.');
  }
  return (
    <>
      <div className="my-room-header">
        <div
          className="my-room-cover-edit-wrapper"
          onClick={handleContainerClick}
        >
          <CameraAltIcon className="my-room-cover-edit-icon" />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/png, image/jpeg"
            onChange={onChangeIcon}
          />
        </div>
        <div
          className="my-room-cover-wrapper"
          style={{
            backgroundImage: `url(${props.cover})`,
          }}
        ></div>
        <div className="my-room-info">
          <img
            src={props.icon}
            alt=""
            className="my-room-icon"
            onClick={navigateToChatRoom}
          />
        </div>
      </div>
      <div className="my-room-name-and-topic">
        <div className="my-room-name" onClick={navigateToChatRoom}>
          {props.name}
        </div>
        <div className="my-room-topic">{props.topic}</div>
      </div>
      <div className="room-actions">
        <button
          className="room-leave-button"
          onClick={() => props.setLeaveRoom(true)}
        >
          Leave Room
        </button>
        {props.role === "admin" ? (
          <>
            <img
              src={props.RoomSettings}
              className="room-settings-icon"
              onClick={() => props.setShowSettings(true)}
            />
          </>
        ) : (
          ""
        )}
      </div>
    </>
  )
}
export default MyRoomContent
