import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import * as ChatIcons from "../assets/chat/media";
import "../assets/chat/Groups.css";
import { useClickOutSide } from "../Chat/chatConversation";

const CreateRoom = (props) => {
  const { chatSocket } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    icon: null,
    password: "",
    confirmPassword: "",
  });
  const [roomVisibility, setRoomVisibility] = useState("public-room");

  const handleVisibilityChange = (selectedVisibility) => {
    setRoomVisibility(selectedVisibility);
    setErrors({});
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    let errorContainers = {};

    if (!formData.name.trim()) {
      errorContainers.name = "Please enter a chat room name.";
    } else if (formData.name.length > 10)
      errorContainers.name = "Chat room name must be at most 10 characters.";

    if (!formData.topic.trim()) {
      errorContainers.topic = "Please enter a chat room topic.";
    } else if (formData.topic.length < 50 || formData.topic.length > 60)
      errorContainers.topic =
        "chat room topic should be between 50 and 60 characters.";

    if (!formData.icon) {
      errorContainers.icon = "Please select an image for the chat room.";
    }
    if (roomVisibility === "protected-room" && !formData.password.trim()) {
      errorContainers.password = "Please enter a password.";
    }

    if (
      roomVisibility === "protected-room" &&
      formData.password !== formData.confirmPassword
    ) {
      errorContainers.confirmPassword = "Passwords do not match.";
    }

    setErrors(errorContainers);

    if (Object.keys(errorContainers).length === 0) {
      chatSocket.send(
        JSON.stringify({
          type: "createChatRoom",
          user: user,
          message: {
            name: formData.name,
            topic: formData.topic,
            icon: formData.icon,
            roomVisibility: roomVisibility,
            password: formData.password,
          },
        })
      );
      props.onClose();
    }
  };

  const onChangeAvatar = (e) => {
    const file = e.target.files[0];
    console.log("the file image: ", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const base64Image = reader.result.split(",")[1];
        setFormData({
          ...formData,
          icon: base64Image,
        });
        const placeHolder = document.getElementsByClassName(
          "default-room-avatar"
        )[0];
        placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };
  let nodeDom = useClickOutSide(props.onClose);
  const fileInputRef = useRef(null);
  let errorRef = useClickOutSide(() => setErrors({}));

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="create-room-container" ref={nodeDom}>

      <div className="create-room-header">Create a Room</div>

      {/* <div className="room-visibility">Visibility:</div> */}
      {/* <div className="room-visibility-btns">
        <button
          className={
            roomVisibility === "public-room" ? "selected-room" : "public-room"
          }
          onClick={() => handleVisibilityChange("public-room")}
        >
          PUBLIC
        </button>
        <button
          className={
            roomVisibility === "private-room" ? "selected-room" : "private-room"
          }
          onClick={() => handleVisibilityChange("private-room")}
        >
          PRIVATE
        </button>
        <button
          className={
            roomVisibility === "protected-room"
              ? "selected-room"
              : "protected-room"
          }
          onClick={() => handleVisibilityChange("protected-room")}
        >
          PROTECTED
        </button>
      </div>
      <form
        action=""
        className="create-room-form"
        autoComplete="off"
        onSubmit={submitHandler}
      >
        <input
          type="text"
          placeholder="Room Name"
          name="name"
          onChange={onChangeHandler}
        />
        {errors.name && <span id="create-room-errors">{errors.name}</span>}
        <input
          type="text"
          placeholder="Room Topic"
          name="topic"
          onChange={onChangeHandler}
        />
        {errors.topic && (
          <span ref={errorRef} id="create-room-errors">
            {errors.topic}
          </span>
        )}
        {roomVisibility === "protected-room" && (
          <>
            <input
              type="password"
              placeholder="Room Password"
              value={formData.password}
              name="password"
              onChange={onChangeHandler}
            />
            {errors.password && (
              <span id="create-room-errors">{errors.password}</span>
            )}
            <input
              type="password"
              value={formData.confirmPassword}
              placeholder="Confirm Room Password"
              name="confirmPassword"
              onChange={onChangeHandler}
            />
            {errors.confirmPassword && (
              <span id="create-room-errors">{errors.confirmPassword}</span>
            )}
          </>
        )}
        <div className="room-image-container">
          <img
            src={ChatIcons.PlaceHolder}
            alt=""
            className="default-room-avatar"
            onClick={handleImageClick}
          />
          <input
            placeholder="wwww"
            type="file"
            name="avatar"
            accept="image/png, image/jpeg"
            id="room-image"
            ref={fileInputRef}
            onChange={onChangeAvatar}
          />
        </div>
        {errors.icon && (
              <span id="create-room-errors">{errors.icon}</span>
            )}
      </form>
      <div className="create-room-btns">
        <button
          onClick={props.onClose}
          type="button"
          className="cancel-create-room"
        >
          Cancel
        </button>
        <button className="create-room" type="submit" onClick={submitHandler}>
          Create
        </button>
      </div> */}
    </div>
  );
};

export default CreateRoom;
