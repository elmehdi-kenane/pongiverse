import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import MyRoom from "./MyRoom";
import SuggestedRoom from "./SuggestedRoom";
import InvitationRooms from "./InvitationRoom";
import CreateRoom from "./createRoomPopUp";
import JoinRoom from "./joinRoomPopUp";
import ChatContext from "./ChatContext";
import * as ChatIcons from "../assets/chat/media";
import "../assets/chat/Groups.css";

const Rooms = () => {
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const { isBlur, setIsBlur } = useContext(ChatContext);
  const { user, socket } = useContext(AuthContext);
  const [myRooms, setMyRooms] = useState([]);
  const [roomInvitations, setRoomInvitations] = useState([]);
  const [myRoomsIcons, setMyRoomsIcons] = useState([]);
  const [roomInviationsIcons, setRoomInvitationsIcons] = useState([]);
  const myRoomsRef = useRef(myRooms);
  const roomInvitationsRef = useRef(roomInvitations);
  let numberOfRoomInvitation = 0;
  let numberOfSuggestedRoom = 0;

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

  //fetch room's images if myRooms Changed
  useEffect(() => {
    const fetchImages = async () => {
      const promises = myRooms.map(async (room) => {
        const response = await fetch(`http://localhost:8000/api/getImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: room.icon_url,
          }),
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
      const images = await Promise.all(promises);
      setMyRoomsIcons(images);
    };
    myRoomsRef.current = myRooms;
    console.log("ALL ROOMS NOW IS : ", myRooms);
    if (myRooms.length !== 0) {
      fetchImages();
    }
  }, [myRooms]);

  useEffect(() => {
    const fetchRoomInvataionIcons = async () => {
      const promises = roomInvitations.map(async (room) => {
        const response = await fetch(`http://localhost:8000/api/getImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: room.icon_url,
          }),
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
      const images = await Promise.all(promises);
      setRoomInvitationsIcons(images);
    };
    roomInvitationsRef.current = roomInvitations;
    if (roomInvitations.length !== 0) {
      fetchRoomInvataionIcons();
    }
  }, [roomInvitations]);

  //fetch rooms
  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/channels/${user}`
        );
        const data = await response.json();
        if (data && data.length) {
          console.log("rooms: ", data);
          setMyRooms(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRoomsInvitations = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/roomInviations/${user}`
        );
        const data = await response.json();
        if (data && data.length) {
          console.log("rooms: ", data);
          setRoomInvitations(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {fetchMyRooms(); fetchRoomsInvitations()};
  }, [user]);

  //add user to channel Group
  useEffect(() => {
    const addUserChannelGroup = () => {
      socket.send(
        JSON.stringify({
          type: "addUserChannelGroup",
          user: user,
        })
      );
    };
    if (socket && socket.readyState === WebSocket.OPEN && user)
      addUserChannelGroup();
  }, [socket, user]);

  //update myRooms array When a new Memeber join
  const newUserJoinedChatRoom = (data) => {
    const allRooms = myRoomsRef.current;
    const roomExists = allRooms.some((myroom) => myroom.name === data.name);
    if (roomExists) {
      console.log("room exist");
      const updatedRooms = allRooms.map((room) => {
        if (room.name === data.name) {
          return { ...room, membersCount: data.membersCount };
        }
        return room;
      });
      setMyRooms(updatedRooms);
    } else {
      console.log("room doesn't exist");
      setMyRooms([...allRooms, data]);
    }
  };

  //update myRooms Array if an Memeber leave
  const memeberLeaveChatRoomUpdater = (data) => {
    const allRooms = myRoomsRef.current;
    console.log("data", data);
    if (data && data.user === user) {
      const updatedRooms = allRooms.filter(
        (myroom) => myroom.name !== data.name
      );
      setMyRooms(updatedRooms);
    } else {
      const updatedRooms = allRooms.map((room) => {
        if (room.name === data.name) {
          return { ...room, membersCount: data.membersCount };
        }
        return room;
      });
      setMyRooms(updatedRooms);
    }
  };

  //update chat Room Name if Changed
  const chatRoomNameChangedUpdater = (data) => {
    const allRooms = myRoomsRef.current;
    const updatedRooms = allRooms.map((room) => {
      if (room.name === data.name) {
        return { ...room, name: data.newName };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    setMyRooms(updatedRooms);
  };

  const chatRoomIconChanged = (data) => {
    const allRooms = myRoomsRef.current;
    const updatedRooms = allRooms.map((room) => {
      if (room.name === data.name) {
        return { ...room, icon_url: data.iconPath };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    setMyRooms(updatedRooms);
  };

  const chatRoomAdminAdded = (data) => {
    const allRooms = myRoomsRef.current;
    const updatedRooms = allRooms.map((room) => {
      if (room.name === data.name) return { ...room, role: "admin" };
      return room;
    });
    setMyRooms(updatedRooms);
  };

  const roomInvitationsAcceptedUpdater = (data) => {
    const allRooms = myRoomsRef.current
    const allRoomInvites = roomInvitationsRef.current
    console.log("data recive if the invite accepted", data)
    if(user === data.user) {
      setMyRooms([...allRooms, data.room]);
      const updatedRoomsInvits = allRoomInvites.filter(
        (room) => room.name !== data.room.name
      );
      setRoomInvitations(updatedRoomsInvits);
    } else { 
      const updatedRooms = allRooms.map((room) => {
        if (room.name === data.room.name) return { ...room, membersCount: data.room.membersCount };
        return room;
      });
      setMyRooms(updatedRooms)
    }
  }

  const chatRoomDeletedUpdater = (data) => {
    const allRooms = myRoomsRef.current
    const updatedRooms = allRooms.filter ( (room) =>
      room.name !== data.name
    )
    setMyRooms(updatedRooms)
  }

  useEffect(() => {
    if (socket) {
      socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("data recived from socket :", data);
        if (data.type === "newRoomJoin") newUserJoinedChatRoom(data.room);
        else if (data.type === "alreadyJoined") console.log("already joined");
        else if (data.type === "privateRoom") console.log("private room");
        else if (data.type === "incorrectPassword")
          console.log("incorrect password");
        else if (data.type === "roomNotFound") console.log("room not found");
        else if (data.type === "newRoomCreated") {
          const allRooms = myRoomsRef.current;
          setMyRooms([...allRooms, data.room]);
        }
        else if (data.type === "memberleaveChatRoom")
          memeberLeaveChatRoomUpdater(data.message);
        else if (data.type === "chatRoomNameChanged")
          chatRoomNameChangedUpdater(data.message);
        else if (data.type === "chatRoomAvatarChanged")
          chatRoomIconChanged(data.message);
        else if (data.type == "chatRoomDeleted")
          chatRoomDeletedUpdater(data.message)
        else if (data.type === "chatRoomAdminAdded")
          chatRoomAdminAdded(data.message);
        else if (data.type === 'roomInvitation') {
          const allInvitaions = roomInvitationsRef.current;
          setRoomInvitations([...allInvitaions, data.room]);
        }
        else if (data.type === 'roomInvitationAccepted')
          roomInvitationsAcceptedUpdater(data.data) 
      };
    }
  }, [socket]);

  return (
    <div className="rooms-page">
      <div className="page-middle-container">
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
        <div className={isBlur ? "rooms-container blur" : "rooms-container"}>
          <div className="join-and-create">
            <div
              className="join-room-btn"
              onClick={() => {
                setJoinRoom(true);
                setIsBlur(true);
              }}
            >
              <img src={ChatIcons.JoinChannel} alt="" className="join-icon" />
              <div className="join-room-text">Join a Room</div>
            </div>
            <div
              className="create-room-btn"
              onClick={() => {
                setCreateRoom(true);
                setIsBlur(true);
              }}
            >
              <img
                src={ChatIcons.CreateChannel}
                alt=""
                className="create-icon"
              />
              <div className="create-room-text">Create a Room</div>
            </div>
          </div>
          <div className="rooms-header">Your Rooms</div>
          <div className="my-rooms-row">
            {myRooms.length > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() => onClickScroller("left", myRooms.length)}
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() => onClickScroller("right", myRooms.length)}
                />
              </>
            ) : (
              ""
            )}
            <div className="slider-container">
              {/*Display rooms */}
              {myRooms && myRooms.length ? (
                <div className="rooms-slider">
                  {myRooms.map((room, index) => (
                    <MyRoom
                      key={index}
                      role={room.role}
                      name={room.name}
                      index={index}
                      topic={room.topic}
                      roomIcons={myRoomsIcons}
                      membersCount={room.membersCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="rooms-slider empty-rooms-slider">
                  Couldn't find a room
                </div>
              )}
            </div>
          </div>
          <div className="rooms-header">Suggested Public Rooms</div>
          <div className="suggested-room-row">
            {numberOfSuggestedRoom > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScrollerSuggested("left", numberOfSuggestedRoom)
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScrollerSuggested("right", numberOfSuggestedRoom)
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="slider-container">
              {numberOfSuggestedRoom ? (
                <div className="suggested-rooms-slider">
                  {Array(numberOfSuggestedRoom)
                    .fill()
                    .map((_, i) => (
                      <SuggestedRoom />
                    ))}
                </div>
              ) : (
                <div className="suggested-rooms-slider empty-rooms-slider">
                  couldn't find a suggested room
                </div>
              )}
            </div>
          </div>
          <div className="rooms-header room-header-invitation">
            Room Invitations
          </div>
          <div className="invitation-room-row">
            {roomInvitations.length > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScrollerInvitation("left", roomInvitations.length)
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScrollerInvitation("right", roomInvitations.length)
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="slider-container">
              {roomInvitations.length ? (
                <div className="invitation-rooms-slider">
                    {roomInvitations.map((room, index) => (
                      <InvitationRooms 
                        key={index}
                        index={index}
                        name={room.name}
                        membersCount={room.membersCount}
                        room_icon={roomInviationsIcons}
                      />
                    ))}
                </div>
              ) : (
                <div className="invitation-rooms-slider empty-rooms-slider">
                  You Don't Have any Room Ivitation Yet
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
