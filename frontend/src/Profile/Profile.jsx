import React from 'react'
import idabligiSvg from "../Dashboard/assets/Group2.svg"
// import mmaqbourSvg from "../Dashboard/assets/Group5.svg"
import EditIcon from '@mui/icons-material/Edit';
import mavSvg from "./Group.svg"
import "./Profile.css"

const bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."

function Profile() {
  const level = 8;
  const per = 55; 
  return (
    <div className='profile-page'>
      {/* User Info */}
      <div className="profile-userinfo">
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
        <div className='userstate'></div>
        <div className='userstate'></div>
        <div className='userstate'></div>
      </div>
    </div>
  )
}

export default Profile
