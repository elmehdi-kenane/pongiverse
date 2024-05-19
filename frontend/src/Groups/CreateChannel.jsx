import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import SocketContext from "./SocketContext";
import "../assets/chat/Groups.css";

const CreateChannel = (props) => {
  const { socket } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    password: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState("public");

  // Function to handle visibility change
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
    if (visibility === "protected" && !formData.password.trim())
      errorContainers.password = "Password is required";
    // else if (formData.password.length < 8)
    //   errorContainers.password = "Password should be at least 8 characters"
    if (visibility === "protected" && formData.password !== formData.confirmPassword)
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

  return (
      <div className="create-modal">
        <div className="create-modal__container">
          <h3 id="create-modal__tittle">Create a Channel</h3>
          <div className="visibility">Visibility:</div>
          <div className="visibility__buttons">
            <button
              className={visibility === "public" ? "selected" : "public"}
              onClick={() => handleVisibilityChange("public")}
            >
              PUBLIC
            </button>
            <button
              className={visibility === "private" ? "selected" : "private"}
              onClick={() => handleVisibilityChange("private")}
            >
              PRIVATE
            </button>
            <button
              className={visibility === "protected" ? "selected" : "protected"}
              onClick={() => handleVisibilityChange("protected")}
            >
              PROTECTED
            </button>
          </div>
          <form action="" className="create-modal__form" onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="Channel Name"
              name="name"
              onChange={onChangeHandler}
            />
            {errors.name && <span id="errors">{errors.name}</span>}
            <input
              type="text"
              placeholder="Channel Topic"
              name="topic"
              onChange={onChangeHandler}
            />
            {errors.topic && <span id="errors">{errors.topic}</span>}
            {visibility === "protected" && (
              <>
                <input
                  type="text"
                  placeholder="Channel Password"
                  name="password"
                  onChange={onChangeHandler}
                />
                {errors.password && <span id="errors">{errors.password}</span>}
                <input
                  type="text"
                  placeholder="Confirm Channel Password"
                  name="confirmPassword"
                  onChange={onChangeHandler}
                />
                {errors.confirmPassword && (
                  <span id="errors">{errors.confirmPassword}</span>
                )}
              </>
            )}
            <div className="create-modal__creation-btns">
              <button className="create">CREATE</button>
              <button onClick={props.onClose} className="cancel">CANCEL</button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateChannel;
