import React, { useState, useContext } from 'react'
import ProfileContext from './ProfileWrapper';

function ProfileLevel() {
    const {userLevel, userXp} = useContext(ProfileContext);
    
    const [per, setPer] = useState(0);
      
      setTimeout(() => {
        setPer(userXp*100/1000)
      }, 500);

      return (
      <div className="profile-userlevel">
          <div className='userlevel__per' style={{width:`${per}%`}} />
          <p> Level {userLevel} - {per}% </p>
      </div>
    )
  }

export default ProfileLevel
