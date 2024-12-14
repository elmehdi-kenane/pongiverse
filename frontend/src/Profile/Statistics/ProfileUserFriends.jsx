import React, { useEffect, useState, useContext } from 'react'
import chatSvg from "../../assets/navbar-sidebar/chat.svg"
import { Link, useNavigate } from "react-router-dom"
import AvatarSvg from "../../assets/Profile/Group.svg"

import AuthContext from '../../navbar-sidebar/Authcontext'
import ProfileContext from '../ProfileWrapper'
import ChatContext from '../../Context/ChatContext'

const ProfileUserFriends = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { userId } = useContext(ProfileContext);
  const [friendsData, setFriendsData] = useState([])
  const { setSelectedDirect } = useContext(ChatContext);

  useEffect(() => {
    const getUserFriends = async () => {
      try {
        const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getUserFriends/${userId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const res = await response.json()
        if (response.ok) {
          // console.log("Response data : ", res.data);
          setFriendsData(res.data)
        }
        else 
          console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    }
    if (userId)
      getUserFriends()
  }, [userId])

  const handleProfileClick = (username) => {
    navigate(`/mainpage/profile/${username}`);
    // window.location.reload();
  };
  
  const chatNavigate = (username, pic) => {
    const userImage = pic ? pic : AvatarSvg
    setSelectedDirect({
      name : username,
      status: true,
      avatar: userImage,
    })
    navigate('/mainpage/chat');
  }

  return (
    <div className='userstate__friends purple--glass'>
      <div className='userstate-header'><h1> Friends </h1> </div>
      <div className="userfriends__classment">
        {friendsData.map((player, key) => {
          return (
            <div className='classment__friend' key={key}>
              <div className="friend__pic-name" onClick={() => handleProfileClick(player.username)}>
                <img src={player.pic ? player.pic : AvatarSvg} alt='playerImg' />
                <p> {player.username} </p>
              </div>
              {(user !== player.username) && 
                <div className='chat__button no-select' to='/mainpage/chat' onClick={() => chatNavigate(player.username, player.pic)}>
                  <img src={chatSvg} alt='chatIcon' />
                  <p style={{ cursor: 'pointer' }}> message </p>
                </div>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileUserFriends
