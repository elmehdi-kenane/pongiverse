import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyRoom from "./RoomComponents/myRoom";
import SuggestedRoom from "./RoomComponents/suggestedRoom";
import CreateRoom from "./CreateRoom/createRoom";
import ChatContext from "../Context/ChatContext";
import * as ChatIcons from "../assets/chat/media";
import "../assets/chat/Groups.css";
import NotificationAddIcon from "@mui/icons-material/NotificationAdd";
import { Toaster } from "react-hot-toast";
import RoomsNotifications from "./RoomComponents/roomsNotifications";
import AddIcon from "@mui/icons-material/Add";

const Rooms = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const { user, chatSocket, isBlur, setIsBlur } = useContext(AuthContext);
  const [showRoomNotifications, setShowRoomNotifications] = useState(false);
  const {
    chatRoomConversations,
    setChatRoomConversations,
    chatRoomIcons,
    setChatRoomInvitations,
    suggestedChatRooms,
    chatRoomConversationsRef,
    chatRoomCovers,
  } = useContext(ChatContext);

  console.log(chatRoomConversations)
  //hande scroller handler (My Rooms)
  const onClickScroller = (handle, numberOfRooms) => {
    const slider = document.getElementsByClassName("rooms-slider")[0];
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--slider-index")
    );
    let itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen")
    );
    if (handle === "left" && sliderIndex) {
      slider.style.setProperty("--slider-index", sliderIndex - 1);
    } else if (handle === "right") {
      if (sliderIndex + 1 >= numberOfRooms / itemsPerScreen) {
        sliderIndex = 0;
        slider.style.setProperty("--slider-index", sliderIndex);
      } else slider.style.setProperty("--slider-index", sliderIndex + 1);
    }
  };

  //hande scroller handler (Suggested Room)
  const onClickScrollerSuggested = (handle, numberOfRooms) => {
    const slider = document.getElementsByClassName("suggested-rooms-slider")[0];
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--suggested-slider-index")
    );
    let itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen")
    );
    if (handle === "left" && sliderIndex) {
      slider.style.setProperty("--suggested-slider-index", sliderIndex - 1);
    } else if (handle === "right") {
      if (sliderIndex + 1 >= numberOfRooms / itemsPerScreen) {
        sliderIndex = 0;
        slider.style.setProperty("--suggested-slider-index", sliderIndex);
      } else
        slider.style.setProperty("--suggested-slider-index", sliderIndex + 1);
    }
  };

  // ######################################### Chat Room backend Handlers ###################################################################

  //add user to channel Group
  useEffect(() => {
    const addUserChannelGroup = () => {
      chatSocket.send(
        JSON.stringify({
          type: "addUserChannelGroup",
          user: user,
        })
      );
    };
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN && user)
      addUserChannelGroup();
  }, [chatSocket, user]);

  const chatRoomAdminAdded = (data) => {
    const allMyChatRooms = chatRoomConversationsRef.current;
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.name === data.name) return { ...room, role: "admin" };
      return room;
    });
    setChatRoomConversations(updatedRooms);
  };

  const roomInvitationsAcceptedUpdater = (data) => {
    const allMyChatRooms = chatRoomConversationsRef.current;
    const allRoomInvites = roomInvitationsRef.current;
    console.log("data recive if the invite accepted", data);
    if (user === data.user) {
      setChatRoomConversations([...allMyChatRooms, data.room]);
      const updatedRoomsInvits = allRoomInvites.filter(
        (room) => room.name !== data.room.name
      );
      setChatRoomInvitations(updatedRoomsInvits);
    } else {
      const updatedRooms = allMyChatRooms.map((room) => {
        if (room.name === data.room.name)
          return { ...room, membersCount: data.room.membersCount };
        return room;
      });
      setChatRoomConversations(updatedRooms);
    }
  };

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "chatRoomAdminAdded")
          chatRoomAdminAdded(data.message);
        else if (data.type === "roomInvitation") {
          const allInvitaions = roomInvitationsRef.current;
          setChatRoomInvitations([...allInvitaions, data.room]);
        } else if (data.type === "roomInvitationAccepted")
          roomInvitationsAcceptedUpdater(data.data);
      };
    }
  }, [chatSocket]);

  return (
    <div className="rooms-page">
      <Toaster
        containerStyle={{ marginTop: "51px" }}
        toastOptions={{
          className: "",
          style: {
            color: "#713200",
            textAlign: "center",
            fontSize: "14px",
          },
        }}
      />
      <div className="rooms-page-content">
        {createRoom && (
          <CreateRoom setCreateRoom={setCreateRoom} setIsBlur={setIsBlur} />
        )}
        {showRoomNotifications && (
          <RoomsNotifications
            setShowRoomNotifications={setShowRoomNotifications}
            setIsBlur={setIsBlur}
          />
        )}
        <div className={isBlur ? "rooms-wrapper blur" : "rooms-wrapper"}>
          <div className="rooms-header-wrapper">
            <div className="rooms-header">Your Rooms</div>

            <div className="create-room-side-buttons-wrapper">
              <div
                className="create-room-button"
                onClick={() => {
                  setCreateRoom(true);
                  setIsBlur(true);
                }}
              >
                <img
                  src={ChatIcons.CreateChannel}
                  alt=""
                  className="create-room-icon"
                />
                <div className="create-room-text">Create a Room</div>
              </div>
              <AddIcon
                className="create-room-button-icon"
                onClick={() => {
                  setCreateRoom(true);
                  setIsBlur(true);
                }}
              />
              <NotificationAddIcon
                className="rooms-notifications-icon"
                onClick={() => {
                  setShowRoomNotifications(true);
                  setIsBlur(true);
                }}
              />
            </div>
          </div>
          <div className="my-rooms-row">
            {chatRoomConversations.length > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScroller("left", chatRoomConversations.length)
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScroller("right", chatRoomConversations.length)
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="rooms-slider-container">
              {chatRoomConversations && chatRoomConversations.length ? (
                <div className="rooms-slider">
                  {chatRoomConversations.map((room, index) => (
                    <MyRoom
                      key={index}
                      roomId={room.id}
                      name={room.name}
                      icon={room.icon}
                      cover={room.cover}
                      role={room.role}
                      topic={room.topic}
                      membersCount={room.membersCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="rooms-slider empty-rooms-slider">
                  No chat room was found.
                </div>
              )}
            </div>
          </div>
          <div className="rooms-header">Suggested Public Rooms</div>
          <div className="suggested-room-row">
            {suggestedChatRooms.length > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScrollerSuggested("left", suggestedChatRooms.length)
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScrollerSuggested("right", suggestedChatRooms.length)
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="rooms-slider-container">
              {suggestedChatRooms && suggestedChatRooms.length ? (
                <div className="suggested-rooms-slider">
                  {suggestedChatRooms.map((room, index) => (
                    <SuggestedRoom
                      key={index}
                      role={room.role}
                      name={room.name}
                      index={index}
                      topic={room.topic}
                      roomId={room.id}
                      roomIcons={chatRoomIcons}
                      chatRoomCovers={chatRoomCovers}
                      membersCount={room.membersCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="suggested-rooms-slider empty-rooms-slider">
                  No suggested chat room was found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
