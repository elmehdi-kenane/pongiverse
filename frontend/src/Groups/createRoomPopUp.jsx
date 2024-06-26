import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import * as ChatIcons from '../assets/chat/media'
import "../assets/chat/Groups.css";

const CreateRoom = (props) => {
  const { socket } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    password: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState("public-room");

  const handleVisibilityChange = (selectedVisibility) => {
    setVisibility(selectedVisibility);
    setErrors({})
  };
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log("data:", data);
        if (data.type === "channel-created") {
          console.log("channel created");
          props.setNewRoom(data.room);
          console.log(data.room);
        }
      };
    }
  }, [socket]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const errorContainers = {};
    if (!formData.name.trim())
      errorContainers.name = "Channel name is required";
    if (!formData.topic.trim())
      errorContainers.topic = "Channel topic is invalid";
    if (visibility === "protected-room" && !formData.password.trim())
      errorContainers.password = "Password is required";
    if (visibility === "protected-room" && formData.password !== formData.confirmPassword)
      errorContainers.confirmPassword = "Password not match";
    setErrors(errorContainers);
    if (Object.keys(errorContainers).length === 0) {
      socket.send(
        JSON.stringify({
          type: "join-channel",
          message: {
            user: user,
            room_name: formData.name,
            topic: formData.topic,
            password: formData.password,
          },
        })
      );
      props.onClose();
    }
  };

  const  onChangeAvatar = (e) => {
    console.log("Here ",e.target.files)
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target.result;
      const placeHolder = document.getElementsByClassName("default-room-avatar")[0];
      placeHolder.src = imageUrl;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  return (
      <div className="create-room-container">
          <div className="create-room-header">Create a Channel</div>
          <div className="room-visibility">Visibility:</div>
          <div className="room-visibility-btns">
            <button
              className={visibility === "public-room" ? "selected-room" : "public-room"}
              onClick={() => handleVisibilityChange("public-room")}
            >
              PUBLIC
            </button>
            <button
              className={visibility === "private-room" ? "selected-room" : "private-room"}
              onClick={() => handleVisibilityChange("private-room")}
            >
              PRIVATE
            </button>
            <button
              className={visibility === "protected-room" ? "selected-room" : "protected-room"}
              onClick={() => handleVisibilityChange("protected-room")}
            >
              PROTECTED
            </button>
          </div>
          <form action="" className="create-room-form" onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="Channel Name"
              name="name"
              onChange={onChangeHandler}
            />
            {errors.name && <span id="create-room-errors">{errors.name}</span>}
            <input
              type="text"
              placeholder="Channel Topic"
              name="topic"
              onChange={onChangeHandler}
            />
            {errors.topic && <span id="create-room-errors">{errors.topic}</span>}
            {visibility === "protected-room" && (
              <>
                <input
                  type="text"
                  placeholder="Channel Password"
                  name="password"
                  onChange={onChangeHandler}
                />
                {errors.password && <span id="create-room-errors">{errors.password}</span>}
                <input
                  type="text"
                  placeholder="Confirm Channel Password"
                  name="confirmPassword"
                  onChange={onChangeHandler}
                />
                {errors.confirmPassword && (
                  <span id="create-room-errors">{errors.confirmPassword}</span>
                )}
              </>
            )}
          </form>
          <div className="room-image-container">
            <label for='room-image' id="room-avatar-label">Upload and image (Room avatar)</label>
            <input type="file" name="avatar" accept="image/png, image/jpeg" id='room-image' onChange={onChangeAvatar}/>
            <img src={ChatIcons.PlaceHolder} alt=""  className="default-room-avatar"/>
          </div>
          <div className="create-room-btns">
            <button onClick={props.onClose} className="cancel-create-room">CANCEL</button>
            <button className="create-room">CREATE</button>
          </div>
      </div>
  );
};

export default CreateRoom;