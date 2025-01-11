import React, { useEffect, useState, useContext } from 'react'
import chatSvg from "../../assets/navbar-sidebar/chat.svg"
import { Link, useNavigate } from "react-router-dom"
import AvatarSvg from "../../assets/Profile/avatar.png"

import AuthContext from '../../navbar-sidebar/Authcontext'
import ProfileContext from '../ProfileWrapper'
import ChatContext from '../../Context/ChatContext'

const ProfileUserFriends = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { userId, getUserFriends, friendsData } = useContext(ProfileContext);
  const { setSelectedDirect, setIsHome, setSelectedItem } = useContext(ChatContext);

  useEffect(() => {
    if (userId)
      getUserFriends()
  }, [userId])

  const handleProfileClick = (username) => {
    navigate(`/mainpage/profile/${username}`);
    // window.location.reload();
  };
  
  const chatNavigate = (player) => {
    const userImage = player.pic ? player.pic : AvatarSvg
    setSelectedDirect({
      id: player.userId,
      name : player.username,
      status: player.userIsOnline,
      avatar: userImage,
    })
    setIsHome(true)
    setSelectedItem(player.username)
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
              {/* {(user !== player.username) &&  */}
              {player.userIsFriend && 
                <div className='chat__button no-select' to='/mainpage/chat' onClick={() => chatNavigate(player)}>
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
