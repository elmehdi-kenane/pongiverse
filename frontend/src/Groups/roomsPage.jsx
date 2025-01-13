import { useContext, useEffect, useRef, useState } from "react"
import AuthContext from "../navbar-sidebar/Authcontext"
import MyRoom from "./RoomComponents/myRoom"
import SuggestedRoom from "./RoomComponents/suggestedRoom"
import CreateRoom from "./CreateRoom/createRoom"
import ChatContext from "../Context/ChatContext"
import * as ChatIcons from "../assets/chat/media"
import "../assets/chat/Groups.css"
import NotificationAddIcon from "@mui/icons-material/NotificationAdd"
import { Toaster } from "react-hot-toast"
import RoomsNotifications from "./RoomComponents/roomsNotifications"
import AddIcon from "@mui/icons-material/Add"
import GameNotifications from "../GameNotif/GameNotifications"
import {toast} from 'react-hot-toast'

const Rooms = () => {
  const [createRoom, setCreateRoom] = useState(false)
  const { user, chatSocket, isBlur, setIsBlur } = useContext(AuthContext)
  const [showRoomNotifications, setShowRoomNotifications] = useState(false)
  const {
    setChatRoomInvitations,
    suggestedChatRooms,
    chatRoomInvitationsRef,
    chatRoomInvitations,
    setChatRooms,
    chatRooms,
    setSelectedChatRoom,
    suggestedChatRoomsRef,
    setSuggestedChatRooms,
    setAllFriends,
    allFriendsRef,
    setAllChatRoomMembers,
    myChatRooms,
    setMyChatRooms,
    myChatRoomsRef,
    hasMoreRooms,
    setHasMoreRooms,
  } = useContext(ChatContext)
//   const [myChatRooms, setMyChatRooms] = useState([])
  // const [hasMoreRooms, setHasMoreRooms] = useState(true)
  const [currentMyRoomsPage, setCurrentMyRoomsPage] = useState(1)
  const [itemsPerScreen, setItemsPerScreen] = useState(4)
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0)
  //   const myChatRoomsRef = useRef(myChatRooms)

  //   useEffect(() => {
  //     myChatRoomsRef.current = myChatRooms
  //   }, [myChatRooms])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerScreen(1)
      else if (window.innerWidth < 1024) setItemsPerScreen(3)
      else setItemsPerScreen(4)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  //hande scroller handler (My Rooms)
  const onClickScroller = (handle, numberOfRooms) => {
    const slider = document.getElementsByClassName("rooms-slider")[0]
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--slider-index")
    )
    let itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen")
    )
    if (handle === "left" && sliderIndex) {
      slider.style.setProperty("--slider-index", sliderIndex - 1)
    } else if (handle === "right") {
      if (sliderIndex + 1 >= numberOfRooms / itemsPerScreen) {
        sliderIndex = 0
        slider.style.setProperty("--slider-index", sliderIndex)
      } else slider.style.setProperty("--slider-index", sliderIndex + 1)
    }
  }

  //hande scroller handler (Suggested Room)
  const onClickScrollerSuggested = (handle, numberOfRooms) => {
    const slider = document.getElementsByClassName("suggested-rooms-slider")[0]
    let sliderIndex = parseInt(
      getComputedStyle(slider).getPropertyValue("--suggested-slider-index")
    )
    let itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen")
    )
    if (handle === "left" && sliderIndex) {
      console.log("sliderIndex", sliderIndex)
      slider.style.setProperty("--suggested-slider-index", sliderIndex - 1)
    } else if (handle === "right") {
      if (sliderIndex + 1 >= numberOfRooms / itemsPerScreen) {
        sliderIndex = 0
        slider.style.setProperty("--suggested-slider-index", sliderIndex)
      } else
        slider.style.setProperty("--suggested-slider-index", sliderIndex + 1)
    }
  }

  // ######################################### Chat Room backend Handlers ###################################################################

  const chatRoomAdminAdded = (data) => {
    const allMyChatRooms = myChatRoomsRef.current
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.name === data.name) return { ...room, role: "admin" }
      return room
    })
    setMyChatRooms(updatedRooms)
  }

  const roomInvitationsAcceptedUpdater = (data) => {
    const allMyChatRooms = myChatRoomsRef.current
    const allRoomInvites = chatRoomInvitationsRef.current
    const allSuggestions = suggestedChatRoomsRef.current
    setMyChatRooms([...allMyChatRooms, data])
    const updatedRoomsInvits = allRoomInvites.filter(
      (room) => room.id !== data.id
    )
    const updatedSuggestedRooms = allSuggestions.filter((room) => room.id !== data.id)
    setSuggestedChatRooms(updatedSuggestedRooms)
    setChatRoomInvitations(updatedRoomsInvits)
    // setMyChatRooms(updatedRooms)
  }

  const chatRoomDeleted = (roomId) => {
    const allMyChatRooms = myChatRoomsRef.current;
    console.log("allMyChatRooms", allMyChatRooms);
    console.log("roomId", roomId);
    const updatedRooms = allMyChatRooms.filter((room) => room.id !== roomId);
    setMyChatRooms(updatedRooms);
    // remmove the chatRooms
    const currentChatRooms = chatRooms;
    const updatedChatRooms = currentChatRooms.filter(
      (room) => room.id !== roomId
    );
    onClickScroller("left", updatedChatRooms.length);
    setChatRooms(updatedChatRooms);
    setSelectedChatRoom({
      id: "",
      name: "",
      membersCount: "",
      icon: "",
    });
  };

  useEffect(() => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "chatRoomAdminAdded") {
          chatRoomAdminAdded(data.message)
          toast.success(`you have been promoted to admin in ${data.message.name}`)
        }
        else if (data.type === "roomInvitation") {
          const allInvitaions = chatRoomInvitationsRef.current
          setChatRoomInvitations([...allInvitaions, data.room])
        } else if (data.type === "roomInvitationAccepted")
          roomInvitationsAcceptedUpdater(data.room)
        else if (
          data.type === "chatRoomLeft" ||
          data.type === "chatRoomDeleted"
        ) {

          chatRoomDeleted(data.roomId)
        } else if (data.type === "chatRoomNameChanged") {
          const allMyChatRooms = myChatRoomsRef.current
          const updatedRooms = allMyChatRooms.map((room) => {
            if (room.id === data.roomId) {
              return { ...room, name: data.newName }
            }
            return room
          })
          setMyChatRooms(updatedRooms)
        } else if  (data.type === "chatRoomCoverChanged") {
          const allMyChatRooms = myChatRoomsRef.current
          const updatedRooms = allMyChatRooms.map((room) => {
            if (room.id === data.roomId) {
              return { ...room, cover: data.newCover }
            }
            return room
          })
          setMyChatRooms(updatedRooms)
        } else if (data.type === "chatRoomIconChanged" ) {
          const allMyChatRooms = myChatRoomsRef.current
          const updatedRooms = allMyChatRooms.map((room) => {
            if (room.id === data.roomId) {
              return { ...room, icon: data.newIcon }
            }
            return room
          })
          setMyChatRooms(updatedRooms)
        } else if  (data.type === "chatRoomJoined") {
          setMyChatRooms((prev) => [...prev, data.room])
          const allSuggestions = suggestedChatRoomsRef.current
          const updatedSuggestedRooms = allSuggestions.filter(
            (room) => room.id !== data.room.id
          )
          onClickScrollerSuggested("left", suggestedChatRooms.length)
          setSuggestedChatRooms(updatedSuggestedRooms)
          const allchatRoomInvitations = chatRoomInvitationsRef.current
          const updatedInvitations = allchatRoomInvitations.filter(
            (room) => room.id !== data.room.id
          )
          setChatRoomInvitations(updatedInvitations)

        } else if (data.type === "updateChatRoomMembers") {
          setMyChatRooms((prev) => {
            return prev.map((room) => {
              if (room.id === data.id) {
                return { ...room, membersCount: data.membersCount }
              }
              return room
            })
          }
          )
        } else if (data.type === 'chatRoomInviteCanceled'){
          const allInvitaions = chatRoomInvitationsRef.current
          const updatedInvitations = allInvitaions.filter(
            (room) => room.id !== data.roomId
          )
          setChatRoomInvitations(updatedInvitations)
        }
      }
    }
  }, [chatSocket])

  useEffect(() => {
    // fetch chat rooms
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/myChatRooms?page=${currentMyRoomsPage}`,
          {
            credentials: "include",
          }
        )
        const { next, results } = await response.json()
        if (response.ok) {
          setMyChatRooms([...myChatRooms, ...results])
          if (!next) setHasMoreRooms(false)
        } else if (response.status === 401)
          navigate('/signin')
        else {
          console.error("Failed to fetch chat rooms")
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (user && hasMoreRooms) fetchChatRooms()
  }, [currentMyRoomsPage, user])

  useEffect(() => {
    if (chatRoomInvitations.length) {
      const pendingInvitations = chatRoomInvitations.filter(
        (room) => room.status === "pending"
      )
      setPendingInvitationsCount(pendingInvitations.length)
    }
  }, [chatRoomInvitations])

  const updateStatusOfInvitations = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/updateStatusOfInvitations`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: user }),
        }
      )
      if (response.ok) {
        // console.log("updateStatusOfInvitations", response)
      }
      else if (response.status === 401)
        navigate('/signin')
      else {
        console.error("Failed to updateStatusOfInvitations")
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <GameNotifications allFriendsRef={allFriendsRef} setAllFriends={setAllFriends} setAllChatRoomMembers={setAllChatRoomMembers} />
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
        {createRoom && (
          <CreateRoom
            setCreateRoom={setCreateRoom}
            setIsBlur={setIsBlur}
            myChatRooms={myChatRooms}
            setMyChatRooms={setMyChatRooms}
          />
        )}
        {showRoomNotifications && (
          <RoomsNotifications
            setShowRoomNotifications={setShowRoomNotifications}
            setIsBlur={setIsBlur}
            myChatRooms={myChatRooms}
            setMyChatRooms={setMyChatRooms}
          />
        )}
        <div className={isBlur ? "rooms-wrapper blur" : "rooms-wrapper"}>
          <div className="rooms-header-wrapper">
            <div className="rooms-header">Your Rooms</div>

            <div className="create-room-side-buttons-wrapper">
              <div
                className="create-room-button"
                onClick={() => {
                  setCreateRoom(true)
                  setIsBlur(true)
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
                  setCreateRoom(true)
                  setIsBlur(true)
                }}
              />
              <div className="room-notifications-icon-conatiner">
                <NotificationAddIcon
                  className="rooms-notifications-icon"
                  onClick={() => {
                    setShowRoomNotifications(true)
                    setIsBlur(true)
                    updateStatusOfInvitations()
                    setPendingInvitationsCount(0)
                  }}
                />
                {pendingInvitationsCount > 0 ? (
                  <div className="room-notifications-counter">
                    {pendingInvitationsCount}
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className="my-rooms-row">
            {/* {myChatRooms.length > 4 ? ( */}
            {itemsPerScreen < myChatRooms.length ? (
              <>
                <img
                  src={ChatIcons.leftHand}
                  className="hande left-hande"
                  onClick={() => onClickScroller("left", myChatRooms.length)}
                />
                <img
                  src={ChatIcons.rightHand}
                  className="hande right-hande"
                  onClick={() => {
                    onClickScroller("right", myChatRooms.length)
                    if (hasMoreRooms) setCurrentMyRoomsPage((prev) => prev + 1)
                  }}
                />
              </>
            ) : (
              ""
            )}
            <div className="rooms-slider-container">
              {myChatRooms && myChatRooms.length ? (
                <div className="rooms-slider">
                  {myChatRooms.map((room, index) => (
                    <MyRoom
                      key={index}
                      roomId={room.id}
                      name={room.name}
                      icon={room.icon}
                      cover={room.cover}
                      role={room.role}
                      topic={room.topic}
                      membersCount={room.membersCount}
                      myChatRooms={myChatRooms}
                      setMyChatRooms={setMyChatRooms}
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
            {itemsPerScreen < suggestedChatRooms.length ? (
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
                      roomId={room.id}
                      name={room.name}
                      icon={room.icon}
                      cover={room.cover}
                      role={room.role}
                      topic={room.topic}
                      membersCount={room.membersCount}
                      myChatRooms={myChatRooms}
                      setMyChatRooms={setMyChatRooms}
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
    </>
  )
}

export default Rooms
