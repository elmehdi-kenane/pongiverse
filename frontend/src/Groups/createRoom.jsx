import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import * as ChatIcons from "../assets/chat/media";
import "../assets/chat/Groups.css";
import { useClickOutSide } from "../Chat/chatConversation";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { toast } from "react-toastify";
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
  const [roomVisibility, setRoomVisibility] = useState("public-visibility");
  const [step, setStep] = useState(1);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = () => {
    console.log("inside submit handler");
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
    console.log(errorContainers);
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
      <div className="create-room-header">
        <h1 className="create-room-title">Create Chat Room</h1>
        <CloseIcon className="create-room-close-icon" onClick={props.onClose} />
      </div>
      {step === 1 && (
        <>
          <div className="create-room-visibility-options">
            <div
              className={
                roomVisibility === "private-visibility"
                  ? "create-room-option create-room-option-selected"
                  : "create-room-option"
              }
              onClick={() => setRoomVisibility("private-visibility")}
            >
              <img
                src={ChatIcons.privateVisibility}
                alt="Private"
                className="private-option-icon visibility-option-icon"
              />
              <div className="create-room-option-text">Private</div>
            </div>
            <div
              className={
                roomVisibility === "public-visibility"
                  ? "create-room-option create-room-option-selected"
                  : "create-room-option"
              }
              onClick={() => setRoomVisibility("public-visibility")}
            >
              <img
                src={ChatIcons.publicVisibility}
                alt="Public"
                className="public-option-icon visibility-option-icon"
              />
              <div className="create-room-option-text">Public</div>
            </div>
            <div
              className={
                roomVisibility === "protected-visibility"
                  ? "create-room-option create-room-option-selected"
                  : "create-room-option"
              }
              onClick={() => setRoomVisibility("protected-visibility")}
            >
              <img
                src={ChatIcons.protectedVisibility}
                alt="Protected"
                className="protected-option-icon visibility-option-icon"
              />
              <div className="create-room-option-text">Protected</div>
            </div>
          </div>
          <div className="create-room-actions">
            <button
              className="create-room-cancel-button"
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              className="create-room-next-button"
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="create-room-input-container">
            <div className="create-room-icon-wrapper">
              <img
                src={ChatIcons.PlaceHolder}
                alt="Chat Room Icon"
                className="create-room-icon-placeholder"
              />
              <div className="create-room-change-icon">
                <CameraAltIcon className="create-room-camera-icon" />
                <div>Select Room Icon</div>
              </div>
            </div>
            <div className="create-room-inputs">
              <input
                type="text"
                className="create-room-name-input"
                placeholder="Enter room name"
                // onChange={}
              />
              {errors.name && (
                <span id="create-room-errors">{errors.name}</span>
              )}
              <textarea
                className="create-room-topic-input"
                placeholder="Enter room topic"
              ></textarea>
              {errors.topic && (
                <span id="create-room-errors">
                  {errors.topic}
                </span>
              )}
            </div>
          </div>
          <div className="create-room-actions-next">
            <button
              className="create-room-cancel-button"
              onClick={() => setStep(1)}
            >
              Previous
            </button>
            {roomVisibility === "private-visibility" ? (
              <button
                className="create-room-next-button"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            ) : (
              <button
                className="create-room-create-button create-room-create-button-active"
                onClick={submitHandler}
              >
                Create
              </button>
            )}
          </div>
          <span ref={errorRef} style={{display:'none'}}></span>
        </>
      )}
      {step === 3 && (
        <>
          <div className="create-room-input-container">
            <div className="create-room-icon-wrapper">
              <img
                src={ChatIcons.PlaceHolder}
                alt="Chat Room Icon"
                className="create-room-icon-placeholder"
              />
              <div className="create-room-change-icon">
                <CameraAltIcon className="create-room-camera-icon" />
                <div>Select Room Icon</div>
              </div>
            </div>
            <div className="create-room-inputs">
              <input
                type="text"
                className="create-room-name-input"
                placeholder="Enter room name"
              />
              {errors.name && (
                <span id="create-room-errors">{errors.name}</span>
              )}
              <textarea
                className="create-room-topic-input"
                placeholder="Enter room topic"
              ></textarea>
            </div>
          </div>
          <div className="create-room-actions-next">
            <button
              className="create-room-cancel-button"
              onClick={() => setStep(1)}
            >
              Previous
            </button>
            <button
              className="create-room-create-button create-room-create-button-active"
              onClick={submitHandler}
            >
              Create
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateRoom;
