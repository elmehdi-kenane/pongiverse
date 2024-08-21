import { useState } from "react";
import * as ChatIcons from "../../assets/chat/media";
import ChangeChatRoomName from "../ChatRoomSettings/changeChatRoomName";
import ChangeChatRoomIcon from "../ChatRoomSettings/changeChatRoomIcon";
import AddChatRoomAdmin from "../ChatRoomSettings/addChatRoomAdmin";
import InviteChatRoomMember from "../ChatRoomSettings/inviteChatRoomMember";
import DeleteChatRoom from "../ChatRoomSettings/deleteChatRoom";
import LeaveChatRoom from "../ChatRoomSettings/leaveChatRoom";
import ChatRoomSettings from "../ChatRoomSettings/chatRoomSettings";
import MyRoomContent from "./myRoomContent";

const MyRoom = (props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [leaveRoom, setLeaveRoom] = useState(false);
  const [changeRoomName, setChangeRoomName] = useState(false);
  const [updateRoomAvatar, setUpdateRoomAvatar] = useState(false);
  const [deleteRoom, setDeletRoom] = useState(false);
  const [addRoomAdmin, setAddRoomAdmin] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);

  return (
    <div className="my-room-container">
      <MyRoomContent
        roomId={props.id}
        name={props.name}
        icon={props.icon}
        cover={props.cover}
        role={props.role}
        topic={props.topic}
        membersCount={props.membersCount}
        setLeaveRoom={setLeaveRoom}
        setShowSettings={setShowSettings}
        RoomSettings={ChatIcons.RoomSettings}
      />
      {showSettings && (
        <ChatRoomSettings
          setShowSettings={setShowSettings}
          setChangeRoomName={setChangeRoomName}
          setUpdateRoomAvatar={setUpdateRoomAvatar}
          setAddRoomAdmin={setAddRoomAdmin}
          setInviteMember={setInviteMember}
          setDeletRoom={setDeletRoom}
          closeButton={ChatIcons.closeButton}
        />
      )}
      {changeRoomName && (
        <ChangeChatRoomName
          setChangeRoomName={setChangeRoomName}
          setShowSettings={setShowSettings}
          roomId={props.roomId}
          name={props.name}
        />
      )}
      {updateRoomAvatar && (
        <ChangeChatRoomIcon
          currentIcon= {props.icon}
          roomId={props.roomId}
          setUpdateRoomAvatar={setUpdateRoomAvatar}
          setShowSettings={setShowSettings}
        />
      )}
      {addRoomAdmin && (
        <AddChatRoomAdmin
          addRoomAdmin={addRoomAdmin}
          setAddRoomAdmin={setAddRoomAdmin}
          closeButton={ChatIcons.closeButton}
          name={props.name}
        />
      )}
      {inviteMember && (
        <InviteChatRoomMember
          inviteMember={inviteMember}
          setInviteMember={setInviteMember}
          closeButton={ChatIcons.closeButton}
          name={props.name}
          id={props.roomId}
        />
      )}
      {deleteRoom && (
        <DeleteChatRoom setDeletRoom={setDeletRoom} roomId={props.roomId} />
      )}
      {leaveRoom && (
        <LeaveChatRoom setLeaveRoom={setLeaveRoom} roomId={props.roomId} />
      )}
    </div>
  );
};

export default MyRoom;
