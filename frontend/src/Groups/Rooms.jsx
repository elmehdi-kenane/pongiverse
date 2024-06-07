import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyRoom from "./MyRoom";
import SuggestedRoom from "./SuggestedRoom";
import CreateRoom from "./createRoomPopUp";
import JoinRoom from "./joinRoomPopUp";
import ChatContext from "./ChatContext";
import * as ChatIcons from "../assets/chat/media";
import "../assets/chat/Groups.css";

const Rooms = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const {isBlur, setIsBlur} = useContext(ChatContext)

  const onClickScroller = (handle) => {
    const slider = document.getElementsByClassName("rooms-slider")[0];
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--slider-index")
    );
    if (handle === "left" && sliderIndex) {
      slider.style.setProperty("--slider-index", sliderIndex - 1);
    } else if (handle === "right") {
      if (sliderIndex + 1 >= 18 / 4) sliderIndex = 0;
      slider.style.setProperty("--slider-index", sliderIndex + 1);
    }
  };
  const onClickScrollerSuggested = (handle) => {
    console.log("im Hereee");
    const slider = document.getElementsByClassName("suggested-rooms-slider")[0];
    console.log(slider);
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--suggested-slider-index")
    );
    if (handle === "left") {
      slider.style.setProperty("--suggested-slider-index", sliderIndex - 1);
    } else if (handle === "right")
      slider.style.setProperty("--suggested-slider-index", sliderIndex + 1);
  };

  return (
    <div className="room-page-and-popup">
      {joinRoom && <JoinRoom />}
      {createRoom && <CreateRoom />}
      <div className= {isBlur ? "rooms-page blur" : "rooms-page"}>
        <div className="page-middle-container">
          <div className="rooms-container">
            <div className="join-and-create">
              <div className="join-room-btn" onClick={() => {setJoinRoom(true); setIsBlur(true);}}>
                <img src={ChatIcons.JoinChannel} alt="" className="join-icon" />
                <div className="join-room-text">Join a Channel</div>
              </div>
              <div
                className="create-room-btn"
                onClick={() => {setCreateRoom(true);  setIsBlur(true);}}
              >
                <img
                  src={ChatIcons.CreateChannel}
                  alt=""
                  className="create-icon"
                />
                <div className="create-room-text">Create a Channel</div>
              </div>
            </div>
            <div className="rooms-header">Suggested Public Channels</div>
            <div className="my-rooms-row">
              <img
                src={ChatIcons.leftHand}
                className="hande left-hande"
                onClick={() => onClickScroller("left")}
              />
              <img
                src={ChatIcons.rightHand}
                className="hande right-hande"
                onClick={() => onClickScroller("right")}
              />
              <div className="slider-container">
                <div className="rooms-slider">
                  {Array(17)
                    .fill()
                    .map((_, i) => (
                      <MyRoom />
                    ))}
                </div>
              </div>
            </div>
            <div className="rooms-header">Suggested Public Channels</div>
            <div className="suggested-room-row">
              <img
                src={ChatIcons.leftHand}
                className="hande left-hande"
                onClick={() => onClickScrollerSuggested("left")}
              />
              <img
                src={ChatIcons.rightHand}
                className="hande right-hande"
                onClick={() => onClickScrollerSuggested("right")}
              />
              <div className="slider-container">
                <div className="suggested-rooms-slider">
                  {Array(9)
                    .fill()
                    .map((_, i) => (
                      <SuggestedRoom />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
