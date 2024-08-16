import toast from "react-hot-toast";
import AuthContext from "../../navbar-sidebar/Authcontext";
import { useContext } from "react";
import ChatContext from "../../Context/ChatContext";

// export const LeaveChatRoomSubmitter = async (user, chatRoomConversationsRef, setChatRoomConversations, roomId) => {
//   try {
//     const response = await fetch(
//       `http://localhost:8000/chatAPI/leaveChatRoom`,
//       {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           member: user,
//           roomId: roomId,
//         }),
//       }
//     );
//     const data = await response.json();
//     if (response.ok) {
//       toast.success(data.success);
//       const allMyChatRooms = chatRoomConversationsRef.current;
//       if (data && data.data.user === user) {
//         const updatedRooms = allMyChatRooms.filter(
//           (myroom) => myroom.id !== data.data.id
//         );
//         setChatRoomConversations(updatedRooms);
//       }
//     } else toast.error(data.error);
//   } catch (error) {
//     console.log(error);
//   }
// }

export const LeaveChatRoomSubmitter = async (
  user,
  roomsRef,
  setRooms,
  roomId
) => {
  const toastId = toast.loading("Leaving room is being processed...");

  setTimeout(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/chatAPI/leaveChatRoom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member: user,
            roomId: roomId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.success);
        const allMyChatRooms = roomsRef.current;
        if (data && data.data.user === user) {
          const updatedRooms = allMyChatRooms.filter(
            (myroom) => myroom.id !== data.data.id
          );
          setRooms(updatedRooms);
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while leaving the chat room.");
    } finally {
      toast.dismiss(toastId);
    }
  }, 2000); // Delay the execution by 2000ms
};

const LeaveChatRoom = (props) => {
  const { user } = useContext(AuthContext);
  const { chatRoomConversationsRef, setChatRoomConversations } =
    useContext(ChatContext);

  return (
    <div className="room-leave-wrapper">
      <div className="room-leave-confirmation-message">
        Are you Sure you want to leave
      </div>
      <div className="room-leave-buttons">
        <button
          className="room-leave-cancel-button"
          onClick={() => props.setLeaveRoom(false)}
        >
          CANCEL
        </button>
        <button
          className="room-leave-confirm-button"
          onClick={() =>
            LeaveChatRoomSubmitter(
              user,
              chatRoomConversationsRef,
              setChatRoomConversations,
              props.roomId
            )
          }
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default LeaveChatRoom;
