import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDots from '../assets/Friends/dots-vertical.svg';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import AuthContext from '../navbar-sidebar/Authcontext'
import ChatContext from "../Context/ChatContext";
import { Navigate } from 'react-router-dom';

const FriendCard = ({
  isLastTwoElements,
  secondUsername,
  avatar,
  friendId,
}) => {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { setSelectedDirect } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleBlockFriend = () => {
    fetch("http://localhost:8000/friends/block_friend/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_username: user,
        to_username: secondUsername,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleMessageFriend = () => {
    setSelectedDirect({
      id: friendId,
      name: secondUsername,
      avatar: avatar,
      status: "true",
    });
    navigate("/mainpage/chat");
  };
  const handleRemoveFriendship = () => {
    fetch("http://localhost:8000/friends/remove_friendship/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_username: user,
        to_username: secondUsername,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleClickOutside = (event) => {
    if (menuRef && menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false); // Close the sidebar if the click is outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToChat = () => {
    setSelectedDirect({
      id: id,
      name: secondUsername,
      status: true,
      avatar: avatar,
    });
    setSelectedItem(secondUsername);
    setIsHome(true);
    navigate(`/mainpage/chat`);
  };
  return (
    <div className="FriendCard">
      <div className="ProfileName">
        <img src={avatar} alt="Profile" className="Profile" />
        {secondUsername}
      </div>
      {isMenuOpen ? (
        <div className="optionsWrapper">
          <div
            className={`optionsFriendCard ${
              isLastTwoElements ? "lastTwoElements" : ""
            }`}
            ref={menuRef}
          >
            <button onClick={() => {
                handleMessageFriend();
                setIsMenuOpen(false);
                }}>
              <ChatBubbleIcon />
              Message
            </button>
            <button>
              <SportsEsportsIcon />
              Challenge
            </button>
            <button onClick={() => {
                handleRemoveFriendship();
                setIsMenuOpen(false);
                }}>
              <PersonRemoveIcon />
              Unfriend
            </button>
            <button onClick={() => {
                handleBlockFriend();
                setIsMenuOpen(false);
                }}>
              <RemoveCircleOutlineIcon />
              Block
            </button>
          </div>
          <button
            className="FriendBtn detailsOpened"
            onClick={toggleMenu}
            ref={buttonRef}
          >
            <img src={ThreeDots} alt="ThreeDots" />
          </button>
        </div>
      ) : (
        <button className="FriendBtn detailsClosed" onClick={toggleMenu}>
          <img src={ThreeDots} alt="ThreeDots" />
        </button>
      )}
    </div>
  );
};

export default FriendCard;
