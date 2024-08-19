import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatContext from "../../Context/ChatContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import toast from "react-hot-toast";

const MyRoomContent = (props) => {
  const navigate = useNavigate();
  const [chatRoomCover, setChatRoomConver] = useState(null);
  const { setIsHome, setSelectedChatRoom , chatRoomConversationsRef, setChatRoomConversations} = useContext(ChatContext);
  let chatRoomCoverRef = useRef(chatRoomCover)

  const navigateToChatRoom = () => {
    setSelectedChatRoom({
      name: props.name,
      memberCount: props.membersCount,
      icon: props.roomIcons[props.index],
      roomId: props.roomId,
    });
    setIsHome(false);
    navigate(`/mainpage/chat`);
  };

  const fileInputRef = useRef(null);

  const handleContainerClick = () => {
    fileInputRef.current.click();
  };

  const udpateChatRoomCover = async () => {
    const formData = new FormData();
    formData.append("room", props.roomId);
    formData.append("cover", chatRoomCover);
    const toastId = toast.loading("Updating chat room cover. Please wait...");
    try {
      const response = await fetch(`http://localhost:8000/chatAPI/changeChatRoomCover`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setTimeout(() => {
          toast.success(data.success);
          toast.dismiss(toastId); // Dismiss the loading toast
          const allMyChatRooms = chatRoomConversationsRef.current
          const updatedRooms = allMyChatRooms.map((room) => {
            if (room.id === data.data.id) {
              return { ...room, cover: data.data.cover };
            }
            return room;
          });
          setChatRoomConversations(updatedRooms);
        }, 2000); // Adjust the delay time (in milliseconds) as needed
      } else toast.error(data.error);
    } catch (error) {
      toast.error(error);
      toast.dismiss(toastId);
    }
  };

  useEffect(()=> {
      chatRoomCoverRef.current = chatRoomCover
      if(chatRoomCover) {
        udpateChatRoomCover();
      }
  }, [chatRoomCover])

  const onChangeIcon = (event) => {
    const file = event.target.files[0];
    if (file) {
      setChatRoomConver(file);
    }
  };
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
            onChange={onChangeIcon}
          />
        </div>
        <div
          className="my-room-cover-wrapper"
          style={{
            // backgroundImage: `url(${props.chatRoomCovers[props.index]})`,
            backgroundImage: `url(${props.cover})`,
          }}
        ></div>
        <div className="my-room-info">
          <img
            src={props.roomIcons[props.index]}
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
  );
};
export default MyRoomContent;
