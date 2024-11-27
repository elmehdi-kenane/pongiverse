import { handleAddFriendReq } from "../Friends/utils";
import { useState } from "react";
import AuthContext from "./Authcontext";
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';

const SearchResultCard = ({
    resultText,
    avatar,
    result_type,
    is_friend,
    is_joined,
    searchResult,
    searchTerm,
    setIsSearchBarOpen,
    setInputValue
}) => {
  const [addFriendBtn, setAddFriendBtn] = useState("Add friend");
  const [joinRoomBtn, setJoinRoomBtn] = useState("Join room");
  const { user } = useContext(AuthContext);
    const navigate = useNavigate();
  const copiedResult = [...searchResult];

  const handleSearchItemBtn = (
    currentUsername,
    secondUsername,
    successText
  ) => {
    if (successText === "Request sent") {
      setAddFriendBtn(successText);
      setTimeout(() => {
        console.log("setTimeout 2000");
        setAddFriendBtn(null);
      }, 2000);
      handleAddFriendReq(currentUsername, secondUsername);
      const user = searchResult.find(
        (user) => user.username === secondUsername
      );
      user.is_friend = true;
    } else if (successText === "Joined") {
      setJoinRoomBtn(successText);
      setTimeout(() => {
        console.log("setTimeout 2000");
        setJoinRoomBtn(null);
      }, 2000);
    }
  };

    const HighlightSearchTerm = () => {
        console.log(resultText, searchTerm);
    resultText = resultText.toLowerCase();
    searchTerm = searchTerm.toLowerCase();
    console.log("resultText", resultText);
    const index = resultText.indexOf(searchTerm);
    return [
      resultText.slice(0, index),
      searchTerm,
      resultText.slice(index + searchTerm.length),
    ];
  };
    const resultTextArr = HighlightSearchTerm();

    const handleClickItem = () => {
        setIsSearchBarOpen(false);
        setInputValue("");
        if (result_type === "user")
            navigate(`/mainpage/profile/${resultText}`)
        else if (result_type === "room")
            console.log("tinkywinky");
    }
  return (
      <div className="searchResultItem" onClick={handleClickItem}>
      <img src={avatar} alt={avatar} />
      <p>
        {resultTextArr[0]}
        <span>{resultTextArr[1]}</span>
        {resultTextArr[2]}
      </p>
      {result_type === "user" &&
        is_friend === false &&
        addFriendBtn !== null && (
          <button
                  onClick={(e) => {
                      e.stopPropagation();
                      handleSearchItemBtn(user, resultText, "Request sent");
                  }
                  }
          >
            {addFriendBtn}
          </button>
        )}
      {result_type === "room" &&
        is_joined === false &&
        joinRoomBtn !== null && (
              <button onClick={(e) => {
                  e.stopPropagation();
                  handleSearchItemBtn(user, resultText, "Joined");
              }
              }
              >
            {joinRoomBtn}
          </button>
        )}
    </div>
  );
};

export default SearchResultCard