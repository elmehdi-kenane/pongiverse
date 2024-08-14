import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatContext from "../../Context/ChatContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import toast from "react-hot-toast";

const MyRoomContent = (props) => {
  const navigate = useNavigate();
  const [cover, setConver] = useState(null);
  const { setIsHome, setSelectedChatRoom } = useContext(ChatContext);

  const navigateToChatRoom = () => {
    console.log("chat room id:", props.roomId);
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
    formData.append("cover", cover);
    try {
      const response = await fetch(`http://localhost:8000/chatAPI/changeChatRoomCover`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        // chatRoomCoverUpdater(data.data);
        toast.success(data.success);
      } else toast.error(data.error);
    } catch (error) {
      toast.error(error);
    }
  };

  const onChangeIcon = (event) => {
    const file = event.target.files[0];
    if (file) {
      setConver(file);
      console.log(file)
      udpateChatRoomCover();
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
            backgroundImage: `url(${props.chatRoomCovers[props.index]})`,
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
