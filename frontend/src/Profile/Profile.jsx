import React from 'react'
import {Link} from "react-router-dom"
import idabligiSvg from "../Dashboard/assets/Group2.svg"
import rennacirSvg from "../Dashboard/assets/Group4.svg"
import AgouzouSvg from "../Dashboard/assets/Group3.svg"
import ekenaneSvg from "../Dashboard/assets/Group1.svg"
import mmaqbourSvg from "../Dashboard/assets/Group5.svg"
import mavSvg from "./Group.svg"
import chatSvg from "../assets/navbar-sidebar/chat.svg"

import EditIcon from '@mui/icons-material/Edit';

import "./Profile.css"

const bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."

const friends = [
  {
    name: "rennacir",
    level: "15.4 XP",
    img: rennacirSvg
  },
  {
    name: "idabligi",
    level: "13.4 XP",
    img: idabligiSvg
  },
  {
    name: "aagouzou",
    level: "10.3 XP",
    img: AgouzouSvg
  },
  {
    name: "mmaqbour",
    level: "8.8 XP",
    img: mmaqbourSvg
  },
  {
    name: "Ekenane",
    level: "8.7 XP",
    img: ekenaneSvg
  },
  {
    name: "Ekenane",
    level: "8.7 XP",
    img: ekenaneSvg
  },
  {
    name: "Ekenane",
    level: "8.7 XP",
    img: ekenaneSvg
  },  
  {
    name: "Ekenane",
    level: "8.7 XP",
    img: ekenaneSvg
  },  
  {
    name: "Ekenane",
    level: "8.7 XP",
    img: ekenaneSvg
  },
]


const profileUserFriends = () => {
  return (
    <>
      <h1> Friends </h1>
      <div className="userfriends__classment purple-glass">
      {friends.map((player) => {
        return (
          <div className='classment__friend'>
            <div className="friend__pic-name">
              <img src={player.img}/>
              <p> {player.name} </p>
            </div>
          <div className='friend__chat'>
            <Link className='chat__button'>
              <img src={chatSvg}/>
              <p> message </p>
            </Link>
          </div>
        </div>
        )
      })}
      </div>
    </>
  )
} 


function Profile() {
  const level = 8;
  const per = 55;

  return (
    <div className='profile-page'>
      {/* User Info */}
      <div className="profile-userinfo purple-glass">
        <div className="userinfo__pic">
          <img src={mavSvg} alt="Player" />
        </div>
        <div className="userinfo__name-bio">
          <EditIcon className='userinfo-edit'/>
          <h1 className="userinfo__name"> Maverick </h1>
          <p className="userinfo__bio"> {bio} </p>
        </div>
      </div>

      {/* User Level */}
      <div className="profile-userlevel">
        <div className='userlevel__per' style={{width:`${per}%`}} />
        <p> Level {level} - {per}% </p>
      </div>

      {/* User State */}
      <div className="profile-userstats">
        <div className='userstate__userfriends'>
          {profileUserFriends()}
        </div>
        <div className='userstate'></div>
        <div className='userstate'></div>
      </div>
    </div>
  )
}

export default Profile
