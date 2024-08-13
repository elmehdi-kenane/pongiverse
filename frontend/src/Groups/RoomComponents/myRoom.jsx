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
        setLeaveRoom={setLeaveRoom}
        setShowSettings={setShowSettings}
        roomIcons={props.roomIcons}
        index={props.index}
        name={props.name}
        topic={props.topic}
        role={props.role}
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
          setUpdateRoomAvatar={setUpdateRoomAvatar}
          setShowSettings={setShowSettings}
          RoomIcon={ChatIcons.RoomIcon}
          roomId={props.roomId}
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
        />
      )}
      {deleteRoom && <DeleteChatRoom setDeletRoom={setDeletRoom} />}
      {leaveRoom && <LeaveChatRoom setLeaveRoom={setLeaveRoom} />}
    </div>
  );
};

export default MyRoom;
