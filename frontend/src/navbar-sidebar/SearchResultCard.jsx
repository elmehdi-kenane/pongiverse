import { handleAddFriendReq } from "../Friends/utils";
import { useState } from "react";
import AuthContext from "./Authcontext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import ChatContext from "../Context/ChatContext";

const SearchResultCard = ({
  id,
  resultText,
  members_count,
  avatar,
  result_type,
  is_friend,
  is_joined,
  searchResult,
  searchTerm,
  handleSearchBar,
  setInputValue,
}) => {
  const [addFriendBtn, setAddFriendBtn] = useState("Add friend");
  const [joinRoomBtn, setJoinRoomBtn] = useState("Join room");
  const { user } = useContext(AuthContext);
  const {
    setSuggestedChatRooms,
    suggestedChatRoomsRef,
    setSelectedChatRoom,
    setIsHome,
    setMyChatRooms,
    myChatRooms,
    myChatRoomsRef,
    setSelectedItem
  } = useContext(ChatContext);
  const navigate = useNavigate();
  const joinChatRoomSubmitter = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/chatAPI/joinChatRoom`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            user: user,
            roomId: id,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // let suggestedChatRooms = suggestedChatRoomsRef.current;
        // let updatedSuggestedRooms = suggestedChatRooms.filter(
        //   (room) => room.id !== id
        // );
        // setSuggestedChatRooms(updatedSuggestedRooms);
        // const currentChatRooms = myChatRoomsRef.current;
        // setMyChatRooms([...currentChatRooms, data.room])
      } else if (response.status === 401)
        navigate('/signin')
      else {
        setTimeout(() => {
          toast.error(data.error);
        }, 500);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchItemBtn = (
    currentUsername,
    secondUsername,
    successText
  ) => {
    if (successText === "Request sent") {
      setAddFriendBtn(successText);
      setTimeout(() => {
        setAddFriendBtn(null);
      }, 2000);
      handleAddFriendReq(currentUsername, secondUsername);
      const user = searchResult.find(
        (user) => user.username === secondUsername && user.id === id
      );
      user.is_friend = true;
    } else if (successText === "Joined") {
      const room = searchResult.find(
        (room) => room.username === secondUsername && room.id === id
      );
      room.is_joined = true;
      joinChatRoomSubmitter();
      setJoinRoomBtn(successText);
      setTimeout(() => {
        setJoinRoomBtn(null);
      }, 2000);
    }
  };

  const resultTextArr = resultText;

  const handleClickItem = () => {
    setInputValue("");
    handleSearchBar();
    if (result_type === "user") {
      navigate(`/mainpage/profile/${resultText}`);
    } else if (result_type === "room" && is_joined === true) {
      setSelectedChatRoom({
        id: id,
        name: resultText,
        membersCount: members_count,
        icon: avatar,
      });
      setSelectedItem(resultText);
      setIsHome(false);
      navigate(`/mainpage/chat`);
    } else {
      toast.error("Please join the room to access its content.");
    }
  };
  return (
    <div className="searchResultItem" onClick={handleClickItem}>
      <img src={avatar} alt={avatar} />
      <p>
        {resultTextArr}
        {/* {resultTextArr[0]}
        <span>{resultTextArr[1]}</span>
        {resultTextArr[2]} */}
      </p>
      {result_type === "user" &&
        is_friend === false &&
        addFriendBtn !== null && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearchItemBtn(user, resultText, "Request sent");
            }}
          >
            {addFriendBtn}
          </button>
        )}
      {result_type === "room" &&
        is_joined === false &&
        joinRoomBtn !== null && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearchItemBtn(user, resultText, "Joined");
            }}
          >
            {joinRoomBtn}
          </button>
        )}
    </div>
  );
};

export default SearchResultCard