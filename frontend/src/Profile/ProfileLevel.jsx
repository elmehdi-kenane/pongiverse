import React from 'react'

function ProfileLevel() {
    const level = 8;
    const per = 55;

    return (
    <div className="profile-userlevel">
        <div className='userlevel__per' style={{width:`${per}%`}} />
        <p> Level {level} - {per}% </p>
    </div>
  )
}

export default ProfileLevel
