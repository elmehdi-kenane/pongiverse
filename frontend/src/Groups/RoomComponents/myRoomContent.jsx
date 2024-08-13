import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatContext from "../../Context/ChatContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const MyRoomContent = (props) => {
    const navigate = useNavigate();
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
  
    const onChangeIcon = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          const placeHolder = document.getElementsByClassName(
            "my-room-cover-wrapper"
          )[0];
          if (placeHolder) placeHolder.style.backgroundImage = `url(${imageUrl})`;
        };
        reader.readAsDataURL(file);
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
        <div className="my-room-cover-wrapper"></div>
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
    )
}
export default MyRoomContent