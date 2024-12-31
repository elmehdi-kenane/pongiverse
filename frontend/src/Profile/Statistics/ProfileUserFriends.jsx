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
  const { userId, getUserFriends, friendsData, chatUserId } = useContext(ProfileContext);
  const { setSelectedDirect, setIsHome, setSelectedItem } = useContext(ChatContext);

  useEffect(() => {
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
      id: chatUserId,
      name : username,
      status: true,
      avatar: userImage,
    })
    setIsHome(true)
    setSelectedItem(username)
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
