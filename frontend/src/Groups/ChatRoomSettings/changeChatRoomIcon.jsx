import { useRef, useState } from "react";

const ChangeChatRoomIcon = (props) => {
  const [newRoomIcon, setnewRoomIcon] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const changeRoomIconSubmitHandler = async () => {
    const formData = new FormData();
    formData.append("icon", newRoomIcon);
    formData.append("room", props.roomId);
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/changeChatRoomIcon`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) console.log(data);
      else toast.error(data.error);
    } catch (error) {
      toast.error(data.error);
    }
    props.setUpdateRoomAvatar(false);
    props.setShowSettings(false);
  };

  const onChangeChangeRoomAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setnewRoomIcon(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const placeHolder = document.getElementsByClassName(
          "room-update-avatar-preview"
        )[0];
        placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="room-update-avatar-wrapper">
      <div className="room-update-avatar-content" onClick={handleImageClick}>
        <img
          src={props.currentIcon}
          alt="Room Avatar"
          className="room-update-avatar-preview"
          style={{ cursor: "pointer" }}
        />
        <input
          type="file"
          name="avatar"
          accept="image/png, image/jpeg"
          id="update-room-image"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={onChangeChangeRoomAvatar}
        />
      </div>
      <div className="room-update-avatar-buttons">
        <button onClick={() => props.setUpdateRoomAvatar(false)}>Cancel</button>
        <button onClick={changeRoomIconSubmitHandler}>Save</button>
      </div>
    </div>
  );
};
export default ChangeChatRoomIcon;
