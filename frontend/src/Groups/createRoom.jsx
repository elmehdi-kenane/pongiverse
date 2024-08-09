import React, { useContext, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import "../assets/chat/Groups.css";
import { useClickOutSide } from "../Chat/chatConversation";
import CloseIcon from "@mui/icons-material/Close";
import CreateRoomVisibilityOptions from "./createRoomVisibilityOptions";
import CreateRoomForm from "./createRoomForm";
import CreateRoomPassword from "./createRoomPassword";

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
    if (
      (name === "name" && value.length > 10) ||
      (name === "topic" && value.length > 80)
    ) {
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = () => {
    let errorContainers = {};

    if (!formData.name.trim()) {
      errorContainers.name = "Please enter a chat room name.";
    } else if (formData.name.length > 10)
      errorContainers.name = "Chat room name must be at most 10 characters.";
    if (!formData.topic.trim()) {
      errorContainers.topic = "Please enter a chat room topic.";
    } else if (formData.topic.length < 50 || formData.topic.length > 80)
      errorContainers.topic =
        "chat room topic should be between 50 and 60 characters.";

    if (
      roomVisibility === "protected-visibility" &&
      !formData.password.trim()
    ) {
      errorContainers.password = "Please enter a password.";
    }

    if (
      roomVisibility === "protected-visibility" &&
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

  const onChangeIcon = (e) => {
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
          "create-room-icon-placeholder"
        )[0];
        if (placeHolder) placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };
  const fileInputRef = useRef(null);
  let errorRef = useClickOutSide(() => setErrors({}));
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const closeCreatePopUp = () => {
    console.log("hereeeeeeeee");
    props.setIsBlur(false);
    props.setCreateRoom(false);
  }

  let createRoomRef = useClickOutSide(closeCreatePopUp);
  return (
    <div className="create-room-container" ref={createRoomRef}>
      <div className="create-room-header">
        <h1 className="create-room-title">Create Chat Room</h1>
        <CloseIcon className="create-room-close-icon" onClick={()=>closeCreatePopUp()} />
      </div>
      {step === 1 && (
        <CreateRoomVisibilityOptions
          formData={formData}
          setStep={setStep}
          roomVisibility={roomVisibility}
          setRoomVisibility={setRoomVisibility}
          onClose={props.onClose}
        />
      )}
      {step === 2 && (
        <CreateRoomForm
          setFormData={setFormData}
          formData={formData}
          setStep={setStep}
          roomVisibility={roomVisibility}
          errors={errors}
          submitHandler={submitHandler}
          onChangeHandler={onChangeHandler}
          onChangeIcon={onChangeIcon}
        />
      )}
      {step === 3 && (
        <CreateRoomPassword
          formData={formData}
          setStep={setStep}
          errors={errors}
          submitHandler={submitHandler}
          onChangeHandler={onChangeHandler}
        />
      )}
      <span ref={errorRef} style={{ display: "none" }}></span>
    </div>
  );
};

export default CreateRoom;
