import { handleAddFriendReq } from "../Friends/utils";
import { useState } from "react";
import AuthContext from "./Authcontext";
import { useContext } from "react";

const SearchResultCard = ({
    username,
    avatar,
    result_type,
    is_friend,
    is_joined,
}) => {
    const [addFriendBtn, setAddFriendBtn] = useState("Add friend");
    const [joinRoomBtn, setJoinRoomBtn] = useState("Join room");
    const { user } = useContext(AuthContext);

    const handleSearchItemBtn = (currentUsername, secondUsername, successText) => {
      if (successText === "Request sent") {
        setAddFriendBtn(successText);
        setTimeout(() => {
          console.log("setTimeout 2000");
          setAddFriendBtn(null);
        }, 2000);
        handleAddFriendReq(currentUsername, secondUsername);
      } else if (successText === "Joined") {
        setJoinRoomBtn(successText);
        setTimeout(() => {
          console.log("setTimeout 2000");
          setJoinRoomBtn(null);
        }, 2000);
      }
    };

  return (
    <div className="searchResultItem">
      <img src={avatar} alt={avatar} />
      <p>{username}</p>
      {result_type === "user" &&
        is_friend === false &&
        addFriendBtn !== null && (
          <button
            onClick={() => handleSearchItemBtn(user, username, "Request sent")}
          >
            {addFriendBtn}
          </button>
        )}
      {result_type === "room" &&
        is_joined === false &&
        joinRoomBtn !== null && (
          <button onClick={() => handleSearchItemBtn(user, username, "Joined")}>
            {joinRoomBtn}
          </button>
        )}
    </div>
  );
};

export default SearchResultCard