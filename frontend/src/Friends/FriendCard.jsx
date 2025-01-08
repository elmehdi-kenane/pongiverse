import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeDots from '../assets/Friends/dots-vertical.svg';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import AuthContext from '../navbar-sidebar/Authcontext'
import ChatContext from "../Context/ChatContext";

const FriendCard = ({
  isLastTwoElements,
  secondUsername,
  avatar,
  isOnline,
  friendId,
}) => {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, notifSocket } = useContext(AuthContext);
  const { setSelectedDirect, setSelectedItem, setIsHome } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleBlockFriend = () => {
    fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/block_friend/`, {
      method: "POST",
      credentials: "include",
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

  const handleRemoveFriendship = () => {
    fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/remove_friendship/`, {
      method: "POST",
      credentials: "include",
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

    const handelChallengeRequest = () => {
      if (notifSocket && notifSocket.readyState === WebSocket.OPEN && user) {
        notifSocket.send(
          JSON.stringify({
            type: "inviteFriendGame",
            message: {
              user: user,
              target: secondUsername,
            },
          })
        );
        // navigate('/mainpage/game/solo/1vs1/friends');
      } else console.log("Socket ga3ma me7lola");
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

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToChat = () => {
    setSelectedDirect({
      id: friendId,
      name: secondUsername,
      status: true,
      avatar: avatar,
    });
    setSelectedItem(secondUsername);
    setIsHome(true);
    navigate(`/mainpage/chat`);
  };
  return (
    <div
      className="FriendCard"
      onClick={() => navigate(`/mainpage/profile/${secondUsername}`)}
    >
      <div className="ProfileName">
        <div className="avatar">
          <img src={avatar} alt="Profile" className="Profile" />
          <span className={`status ${isOnline === true ? "online" : "offline"}`}></span>
        </div>
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateToChat();
                setIsMenuOpen(false);
              }}
            >
              <ChatBubbleIcon />
              Message
            </button>
            <button 
            onClick={(e) => {
                e.stopPropagation();
                handelChallengeRequest();
                setIsMenuOpen(false);
            }}
            >
              <SportsEsportsIcon />
              Challenge
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFriendship();
                setIsMenuOpen(false);
              }}
            >
              <PersonRemoveIcon />
              Unfriend
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBlockFriend();
                setIsMenuOpen(false);
              }}
            >
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
