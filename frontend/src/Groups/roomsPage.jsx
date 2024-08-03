import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyRoom from "./myRoom";
import SuggestedRoom from "./suggestedRoom";
import InvitationRoom from "./InvitationRoom";
import CreateRoom from "./createRoom";
import JoinRoom from "./joinRoom";
import ChatContext from "./ChatContext";
import * as ChatIcons from "../assets/chat/media";
import { Slide, ToastContainer, toast } from "react-toastify";
import "../assets/chat/Groups.css";

const Rooms = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const { user, chatSocket, isBlur, setIsBlur } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    chatRoomConversations,
    setChatRoomConversations,
    chatRoomIcons,
    chatRoomInvitations,
    setChatRoomInvitations,
    chatRoomInvitationsIcons,
    suggestedChatRooms,
  } = useContext(ChatContext);
  const myChatRoomsRef = useRef(chatRoomConversations);
  const roomInvitationsRef = useRef(chatRoomInvitations);

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

  //hande scroller handler (Room Invitations)
  const onClickScrollerInvitation = (handle, numberOfRooms) => {
    const slider = document.getElementsByClassName(
      "invitation-rooms-slider"
    )[0];
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--invitation-slider-index")
    );
    let itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen")
    );
    if (handle === "left" && sliderIndex) {
      slider.style.setProperty("--invitation-slider-index", sliderIndex - 1);
    } else if (handle === "right") {
      if (sliderIndex + 1 >= numberOfRooms / itemsPerScreen) {
        sliderIndex = 0;
        slider.style.setProperty("--invitation-slider-index", sliderIndex);
      } else
        slider.style.setProperty("--invitation-slider-index", sliderIndex + 1);
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

  //update chatRoomConversations array When a new Memeber join
  const newUserJoinedChatRoom = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    const roomExists = allMyChatRooms.some(
      (myroom) => myroom.name === data.name
    );
    if (roomExists) {
      console.log("room exist");
      const updatedRooms = allMyChatRooms.map((room) => {
        if (room.name === data.name) {
          return { ...room, membersCount: data.membersCount };
        }
        return room;
      });
      setChatRoomConversations(updatedRooms);
    } else {
      console.log("room doesn't exist");
      setChatRoomConversations([...allMyChatRooms, data]);
    }
  };

  //update chatRoomConversations Array if an Memeber leave
  const memeberLeaveChatRoomUpdater = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    console.log("data", data);
    if (data && data.user === user) {
      const updatedRooms = allMyChatRooms.filter(
        (myroom) => myroom.name !== data.name
      );
      setChatRoomConversations(updatedRooms);
    } else {
      const updatedRooms = allMyChatRooms.map((room) => {
        if (room.name === data.name) {
          return { ...room, membersCount: data.membersCount };
        }
        return room;
      });
      setChatRoomConversations(updatedRooms);
    }
  };

  //update chat Room Name if Changed
  const chatRoomNameChangedUpdater = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.name === data.name) {
        return { ...room, name: data.newName };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    setChatRoomConversations(updatedRooms);
  };

  const chatRoomIconChanged = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.name === data.name) {
        return { ...room, icon_url: data.iconPath };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    setChatRoomConversations(updatedRooms);
  };

  const chatRoomAdminAdded = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.name === data.name) return { ...room, role: "admin" };
      return room;
    });
    setChatRoomConversations(updatedRooms);
  };

  const roomInvitationsAcceptedUpdater = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
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

  const chatRoomDeletedUpdater = (data) => {
    const allMyChatRooms = myChatRoomsRef.current;
    const updatedRooms = allMyChatRooms.filter(
      (room) => room.name !== data.name
    );
    setChatRoomConversations(updatedRooms);
  };

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("data recived from socket :", data);
        if (data.type === "newRoomJoin") newUserJoinedChatRoom(data.room);
        else if (data.type === "alreadyJoined")
          toast("Room Already Joined");
        else if (data.type === "privateRoom") toast("Private Room");
        else if (data.type === "roomNotFound")
          toast("Room Not Found");
        else if (data.type === "incorrectPassword")
          console.log("incorrect password");
        else if (data.type === "newRoomCreated") {
          const allMyChatRooms = myChatRoomsRef.current;
          setChatRoomConversations([...allMyChatRooms, data.room]);
        } else if (data.type === "memberleaveChatRoom")
          memeberLeaveChatRoomUpdater(data.message);
        else if (data.type === "chatRoomNameChanged")
          chatRoomNameChangedUpdater(data.message);
        else if (data.type === "chatRoomAvatarChanged")
          chatRoomIconChanged(data.message);
        else if (data.type == "chatRoomDeleted")
          chatRoomDeletedUpdater(data.message);
        else if (data.type === "chatRoomAdminAdded")
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        // transition: Slide
        className="toast-container"
        />
      <div className="rooms-page-content">
        {joinRoom && (
          <JoinRoom
            onClose={() => {
              setJoinRoom(false);
              setIsBlur(false);
            }}
          />
        )}
        {createRoom && (
          <CreateRoom
            onClose={() => {
              setCreateRoom(false);
              setIsBlur(false);
            }}
          />
        )}
        <div className={isBlur ? "rooms-wrapper blur" : "rooms-wrapper"}>
          <div className="rooms-actions-buttons-container">
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
          </div>
          <div className="rooms-header">Your Rooms</div>
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
                      role={room.role}
                      name={room.name}
                      index={index}
                      topic={room.topic}
                      roomId={room.id}
                      roomIcons={chatRoomIcons}
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
          <div className="rooms-header">Room Invitations</div>
          <div className="invitations-room-row">
            {chatRoomInvitations.length > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScrollerInvitation(
                      "left",
                      chatRoomInvitations.length
                    )
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScrollerInvitation(
                      "right",
                      chatRoomInvitations.length
                    )
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="rooms-slider-container">
              {chatRoomInvitations.length ? (
                <div className="invitations-rooms-slider">
                  {chatRoomInvitations.map((room, index) => (
                    <InvitationRoom
                      key={index}
                      index={index}
                      name={room.name}
                      membersCount={room.membersCount}
                      room_icon={chatRoomInvitationsIcons}
                    />
                  ))}
                </div>
              ) : (
                <div className="invitations-rooms-slider empty-rooms-slider">
                  You currently have no chat room invitations
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
