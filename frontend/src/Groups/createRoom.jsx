import React, { useContext, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import "../assets/chat/Groups.css";
import { useClickOutSide } from "../Chat/chatConversation";
import CloseIcon from "@mui/icons-material/Close";
import CreateRoomVisibilityOptions from "./createRoomVisibilityOptions";
import CreateRoomForm from "./createRoomForm";
import CreateRoomPassword from "./createRoomPassword";

const CreateRoom = (props) => {
  let errorsContainer = {};
  const { chatSocket } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    icon: null,
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

  const errorsChecker = () => {

    if (!formData.name.trim()) {
      errorsContainer.name = "Please enter a chat room name.";
    } else if (formData.name.length > 10)
      errorsContainer.name = "Chat room name must be at most 10 characters.";
    if (!formData.topic.trim()) {
      errorsContainer.topic = "Please enter a chat room topic.";
    } else if (formData.topic.length < 50 || formData.topic.length > 80)
      errorsContainer.topic =
        "chat room topic should be between 50 and 60 characters.";
    setErrors(errorsContainer);
  }

  const submitHandler = () => {
    errorsChecker()
    if (Object.keys(errorsContainer).length === 0) {
      const data = new FormData();
      data.append('user', user);
      data.append('name', formData.name);
      data.append('topic', formData.topic);
      data.append('icon', formData.icon);
      data.append('visibility', roomVisibility === "public-visibility" ? 'public' : 'private')
  
      const chatRoomCreation = async () => {
        console.log("inside the room creaction")
        try {
          const response =  await fetch('http://localhost:8000/chatAPI/createChatRoom', {
            method: 'POST',
            body: data,
          })
          const responseData  = await response.json();
          console.log(responseData )
        }
        catch (error) {
          console.log(error)
        }
      }
      chatRoomCreation()
      closeCreatePopUp();
    }
  };


  const onChangeIcon = (e) => {
    const icon = e.target.files[0];
    if (icon) {
      setFormData({
        ...formData,
        icon: icon,
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const placeHolder = document.getElementsByClassName(
          "create-room-icon-placeholder"
        )[0];
        if (placeHolder) placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(icon);
    }
  };
  const fileInputRef = useRef(null);
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const closeCreatePopUp = () => {
    props.setIsBlur(false);
    props.setCreateRoom(false);
  }

  let createRoomRef = useClickOutSide(closeCreatePopUp);
  let errorRef = useClickOutSide(() => setErrors({}));
  
  

  return (
    <div className="create-room-container" ref={createRoomRef}>
      <div className="create-room-header">
        <h1 className="create-room-title" >Create Chat Room</h1>
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
