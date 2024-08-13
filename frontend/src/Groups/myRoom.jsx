import { useContext, useEffect, useRef, useState } from "react";
import * as ChatIcons from "../assets/chat/media";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatContext from "./ChatContext";
import ChatRoomMember from "./chatRoomMember";
import ChatRoomInvitee from "./chatRoomInvitee";
import { useNavigate } from "react-router-dom";
import { leaveRoomSubmitHandler } from "./roomHandler";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import toast from "react-hot-toast";

const MyRoom = (props) => {
  const { chatSocket, user } = useContext(AuthContext);
  const { setIsHome, setSelectedChatRoom, chatRoomConversationsRef,  setChatRoomConversations} = useContext(ChatContext);
  const [showSettings, setShowSettings] = useState(false);
  const [leaveRoom, setLeaveRoom] = useState(false);
  const [changeRoomName, setChangeRoomName] = useState(false);
  const [updateRoomAvatar, setUpdateRoomAvatar] = useState(false);
  const [deleteRoom, setDeletRoom] = useState(false);
  const [addRoomAdmin, setAddRoomAdmin] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIcon, setnewRoomIcon] = useState(null);
  const [allChatRoomMembers, setAllChatRoomMembers] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const navigate = useNavigate();

  const showRoomSettings = () => {
    console.log("i clicked show settings");
    setShowSettings(true);
  };

  const chatRoomNameChangedUpdater = (data) => {
    const allMyChatRooms = chatRoomConversationsRef.current;
    const updatedRooms = allMyChatRooms.map((room) => {
      if (room.id === data.id) {
        return { ...room, name: data.newName };
      }
      return room;
    });
    console.log("update rooms: ", updatedRooms);
    setChatRoomConversations(updatedRooms);
  };

  const changeRoomNameSubmitHandler = () => {
    const updateChatRoomName = async () => {
      try {

        const response = await fetch(`http://localhost:8000/chatAPI/chatRoomUpdateName/${props.roomId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newRoomName }),
        })
        const data = await response.json()
        chatRoomNameChangedUpdater(data.data)
        console.log(data)
      } catch (error) {
        toast(error)
      }
    }
    updateChatRoomName()
  };

  const onChangeChangeRoomAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const base64Image = reader.result.split(",")[1];
        setnewRoomIcon(base64Image);
        const placeHolder = document.getElementsByClassName(
          "live-updated-room-avatar"
        )[0];
        placeHolder.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };
  const updateRoomAvatarSubmitHandler = () => {
    if (chatSocket) {
      chatSocket.send(
        JSON.stringify({
          type: "changeRoomAvatar",
          message: {
            room: props.name,
            newIcon: newRoomIcon,
          },
        })
      );
    }
    setUpdateRoomAvatar(false);
    setShowSettings(false);
  };

  useEffect(() => {
    const fetchAllChatRoomMembers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatAPI/allRoomMembers/${props.name}`
        );
        const data = await response.json();
        console.log("all chat room: ", data);
        setAllChatRoomMembers(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (addRoomAdmin) {
      fetchAllChatRoomMembers();
    }
  }, [addRoomAdmin]);

  useEffect(() => {
    const fetchAllFriends = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/chatAPI/listAllFriends",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
              room: props.name,
            }),
          }
        );
        const data = await response.json();
        setAllFriends(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (inviteMember) fetchAllFriends();
  }, [inviteMember]);

  const onClickDeleteChatRoomHandler = () => {
    if (chatSocket) {
      console.log("inside delete chat room");
      chatSocket.send(
        JSON.stringify({
          type: "deleteChatRoom",
          message: {
            room: props.name,
          },
        })
      );
      setDeletRoom(false);
      setShowSettings(false);
    }
  };
  const moveObjectToFront = (name) => {
    setChatRoomConversations((prevArray) => {
      // Find the index of the object by name
      const index = prevArray.findIndex((obj) => obj.name === name);
      if (index === -1) return prevArray;

      // Remove the object from its current position
      const [objectToMove] = prevArray.splice(index, 1);

      // Add the object to the beginning of the array
      return [objectToMove, ...prevArray];
    });
  };

  const navigateToChatRoom = () => {
    console.log("chat room id:", props.roomId);
    setSelectedChatRoom({
      name: props.name,
      memberCount: props.membersCount,
      icon: props.roomIcons[props.index],
      roomId: props.roomId,
    });
    moveObjectToFront(props.name)
    setIsHome(false);
    navigate(`/mainpage/chat`);
  };

  const fileInputRef = useRef(null);

  const handleContainerClick = () => {
    fileInputRef.current.click();
  };

  const onChangeIcon = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const placeHolder = document.getElementsByClassName(
          "my-room-cover-wrapper"
        )[0];
        if(placeHolder)
          placeHolder.style.backgroundImage = `url(${imageUrl})`;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="my-room-container">
      <div className="my-room-header">
        <div className="my-room-cover-edit-wrapper" onClick={handleContainerClick}>
          <CameraAltIcon className="my-room-cover-edit-icon" />
          <input type="file" 
                  ref={fileInputRef}
                  style={{ display: "none" }}
              onChange={onChangeIcon}
              />
        </div>
        <div className="my-room-cover-wrapper"></div>
        <div className="my-room-info">
          <img
            src={props.roomIcons[props.index]}
            alt=""
            className="my-room-icon"
            onClick={navigateToChatRoom}
          />
        </div>
      </div>
      <div className="my-room-name-and-topic">
        <div className="my-room-name" onClick={navigateToChatRoom}>{props.name}</div>
        <div className="my-room-topic">{props.topic}</div>
      </div>
      <div className="room-actions">
        <button
          className="room-leave-button"
          onClick={() => setLeaveRoom(true)}
        >
          Leave Room
        </button>
        {props.role === "admin" ? (
          <>
            <img
              src={ChatIcons.RoomSettings}
              className="room-settings-icon"
              onClick={showRoomSettings}
            />
          </>
        ) : (
          ""
        )}
      </div>
      {showSettings && (
        <div className="room-settings-menu">
          <div className="room-settings-actions">
            <img
              src={ChatIcons.closeButton}
              alt=""
              className="room-settings-close-button"
              onClick={() => setShowSettings(false)}
            />
            <div
              className="room-settings-change-name"
              onClick={() => setChangeRoomName(true)}
            >
              Change Room Name
            </div>
            <div
              className="room-settings-update-avatar"
              onClick={() => setUpdateRoomAvatar(true)}
            >
              Update Room Avatar
            </div>
            <div
              className="room-settings-add-admin"
              onClick={() => setAddRoomAdmin(true)}
            >
              Add Room Admin
            </div>
            <div
              className="room-settings-invite-member"
              onClick={() => setInviteMember(true)}
            >
              Invite a Member
            </div>
            <div
              className="room-settings-delete-room"
              onClick={() => setDeletRoom(true)}
            >
              Delete Room
            </div>
          </div>
        </div>
      )}
      {changeRoomName && (
        <div className="room-change-name-wrapper">
          <div className="room-change-name-title">Enter Room Name</div>
          <input
            type="text"
            className="change-room-name-input"
            placeholder={props.name}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <div className="room-change-name-buttons">
            <button onClick={() => setChangeRoomName(false)}>Cancel</button>
            <button onClick={changeRoomNameSubmitHandler}>Update</button>
          </div>
        </div>
      )}
      {updateRoomAvatar && (
        <div className="room-update-avatar-wrapper">
          <div className="room-update-avatar-content">
            <img
              src={ChatIcons.RoomIcon}
              alt=""
              className="room-update-avatar-preview"
            />
            <label htmlFor="update-room-image" id="room-update-avatar-label">
              Select an Image
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/png, image/jpeg"
              id="update-room-image"
              onChange={onChangeChangeRoomAvatar}
            />
          </div>
          <div className="room-update-avatar-buttons">
            <button onClick={() => setUpdateRoomAvatar(false)}>Cancel</button>
            <button onClick={updateRoomAvatarSubmitHandler}>Save</button>
          </div>
        </div>
      )}
      {addRoomAdmin && (
        <div className="room-add-admin-wrapper">
          <img
            src={ChatIcons.closeButton}
            alt=""
            className="room-add-admin-close-button"
            onClick={() => setAddRoomAdmin(false)}
          />
          {allChatRoomMembers.map((memeber, index) => (
            <ChatRoomMember
              key={index}
              name={memeber.name}
              roomName={props.name}
            />
          ))}
        </div>
      )}
      {inviteMember && (
        <div className="room-invite-member-wrapper">
          <img
            src={ChatIcons.closeButton}
            alt=""
            className="room-invite-member-close-button"
            onClick={() => setInviteMember(false)}
          />
          {allFriends.map((friend, index) => (
            <ChatRoomInvitee
              key={index}
              name={friend.name}
              roomName={props.name}
            />
          ))}
        </div>
      )}
      {deleteRoom && (
        <div className="room-delete-wrapper">
          <div className="room-delete-title">
            Are You Sure You Wanna Delete Room
          </div>
          <div className="room-delete-buttons">
            <button onClick={() => setDeletRoom(false)}>Cancel</button>
            <button onClick={onClickDeleteChatRoomHandler}>Delete</button>
          </div>
        </div>
      )}
      {leaveRoom && (
        <div className="room-leave-wrapper">
          <div className="room-leave-confirmation-message">
            Are you Sure you want to leave
          </div>
          <div className="room-leave-buttons">
            <button
              className="room-leave-cancel-button"
              onClick={() => setLeaveRoom(false)}
            >
              CANCEL
            </button>
            <button
              className="room-leave-confirm-button"
              onClick={() =>
                leaveRoomSubmitHandler(props.name, user, chatSocket)
              }
            >
              CONFIRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoom;
