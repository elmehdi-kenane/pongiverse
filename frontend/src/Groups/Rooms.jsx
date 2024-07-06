import { useContext, useEffect, useState } from "react";
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
  const {user, socket} = useContext(AuthContext)
  const [myRooms, setMyRooms] = useState([])
  const [myRoomsIcons, setMyRoomsIcons] = useState([])
  const [newRoomCreated, setNewRoomCreated] = useState({})
  const [newJoin, setNewJoin] = useState({})
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
    if (myRooms.length !== 0) {
      console.log(myRooms.length)
      console.log(myRooms)
      fetchImages();
    }
  }, [myRooms]);

  //fetch rooms
  useEffect(()=> {
    const fetchMyRooms = async () => {
      try {
        const response = await fetch(`http://localhost:8000/chatAPI/channels/${user}`)
        const data = await response.json()
        if(data && data.length){
          console.log("rooms: ",data)
          setMyRooms(data)
        }
      }catch(error) {
        console.log(error)
      }
    }
    if(user)
      fetchMyRooms()
  },[user])

  useEffect(()=>{
    
    const addUserChannelGroup = ()=> {
          socket.send(JSON.stringify({
            type : 'addUserChannelGroup',
            user: user,
          }))
    }
    if(socket && socket.readyState === WebSocket.OPEN  && user)
      addUserChannelGroup()
  }, [socket, user])

  useEffect(() => {
    if(Object.keys(newRoomCreated).length !== 0) {
      console.log("lol")
      setMyRooms(prev => [...prev, newRoomCreated])
      setNewRoomCreated({})
    }
  }, [newRoomCreated])

  useEffect(()=> {
    if(Object.keys(newJoin).length !== 0) {
      console.log("new Join" ,newJoin)
      const roomExists = myRooms.some(room => room.name === newJoin.name);
      if(roomExists) {

        const updatedRooms = myRooms.map(room => {
          if (room.name === newJoin.name) {
            return { ...room, membersCount: newJoin.membersCount };
          }
          return room
        });
        setMyRooms(updatedRooms);
      } else {
        setMyRooms(prevRooms => [...prevRooms, newJoin]);
      }
      setJoinRoom({})
    }
  },[newJoin])

  return (
    <div className="rooms-page">
      <div className="page-middle-container">
        {joinRoom && (
          <JoinRoom
            setNewJoin = {setNewJoin}
            onClose={() => {
              setJoinRoom(false);
              setIsBlur(false);
            }}
          />
        )}
        {createRoom && (
          <CreateRoom
            setNewRoomCreated = {setNewRoomCreated} 
            onClose={() => {
              setCreateRoom(false);
              setIsBlur(false);
            }
          }
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
              {(myRooms && myRooms.length) ? (
                <div className="rooms-slider">
                 { myRooms.map((room, index) => (
                    <MyRoom key={index} name={room.name} index={index} topic= {room.topic} roomIcons={myRoomsIcons} membersCount={room.membersCount}/>
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
            {numberOfRoomInvitation > 4 ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() =>
                    onClickScrollerInvitation("left", numberOfRoomInvitation)
                  }
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() =>
                    onClickScrollerInvitation("right", numberOfRoomInvitation)
                  }
                />
              </>
            ) : (
              ""
            )}
            <div className="slider-container">
              {
                numberOfRoomInvitation ?
                <div className="invitation-rooms-slider">
                {Array(numberOfRoomInvitation)
                  .fill()
                  .map((_, i) => (
                    <InvitationRooms />
                  ))}
              </div> : 
              <div className="invitation-rooms-slider empty-rooms-slider">
                You Don't Have any Room Ivitation Yet
              </div>
                }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
