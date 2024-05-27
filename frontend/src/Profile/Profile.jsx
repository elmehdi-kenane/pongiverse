import React from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Profile.css"

function Profile() {
    const level = 8
    const per = 80;
  return (
    <div className='profile-page'>
      <div className="profile-userinfo"></div>
      <div className="profile-userlevel">
        <ProgressBar animated now={per} label = { `${level} - ${per}%`}
            className='custom-progress-bar'  
            >
                {/* Level {level} - {per}% */}
           </ProgressBar>
      </div>
      <div className="profile-userstats"></div>
    </div>
  )
}

export default Profile
