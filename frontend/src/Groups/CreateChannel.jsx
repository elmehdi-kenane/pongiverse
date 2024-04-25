import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import SocketContext from "./SocketContext";
import "./Groups.css";

const CreateChannel = (props) => {
  const { chatSocket } = useContext(SocketContext);
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
    if (chatSocket) {
      chatSocket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log("data:", data);
        if (data.type === "channel-created") {
          console.log("channel created");
          props.setNewRoom(data.room);
          console.log(data.room);
        }
      };
    }
  }, [chatSocket]);

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
      chatSocket.send(
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
    <div className="main_page">
      <div className="create-modal">
        <h3 id="modal-header">Create a Channel</h3>
        <div className="visibility">Visibility:</div>
        <div className="visibility-buttons">
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
        <form action="" className="creation-form" onSubmit={submitHandler}>
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
          <div className="creation-buttons">
            <button>CREATE</button>
            <button onClick={props.onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannel;
