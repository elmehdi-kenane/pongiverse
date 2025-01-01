import { useState, useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { handleAddFriendReq } from './utils'
import { useNavigate } from 'react-router-dom';

const SuggestionFriendCard = ({ username, avatar, level, total_xp }) => {
  const { user } = useContext(AuthContext);
  const [friendRequestBtn, setFriendRequestBtn] = useState(false);
  const navigate = useNavigate();
  const handleAddFriendReq = () => {
    fetch(
      `${import.meta.env.VITE_PROTOCOL}://${
        import.meta.env.VITE_IPADDRESS
      }:${import.meta.env.VITE_PORT}/friends/add_friend_request/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_username: user,
          to_username: username,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
       console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setFriendRequestBtn(true);
  };
  return (
    <div
      className="SuggestionFriendCard embla__slide"
      onClick={() => navigate(`/mainpage/profile/${username}`)}
    >
      <div className="ProfileName">
        <img src={avatar} alt="Profile" className="Profile" />
        {username}
        <div className="lvl">
          <span>level</span>{" "}
          <span>•</span>{" "}
          <span>{level}</span>
        </div>
      </div>
      {friendRequestBtn ? (
        <>
          <div style={{ fontSize: "small", marginTop: "10px" }}>
            Request Sent
          </div>
          <div className="loadingBox">
            <div className="loadingLine"></div>
          </div>
        </>
      ) : (
        <button
          className="FriendBtn Add"
          onClick={(e) => {
            e.stopPropagation();
            handleAddFriendReq(user, username, setFriendRequestBtn);
          }}
        >
          Add friend
        </button>
      )}
    </div>
  );
};

export default SuggestionFriendCard