import React, { useState } from 'react'

function ProfileLevel() {
    const [level, setLevel] = useState(0);
    const [per, setPer] = useState(60);

    return (
    <div className="profile-userlevel">
        <div className='userlevel__per' style={{width:`${per}%`}} />
        <p> Level {level} - {per}% </p>
    </div>
  )
}

export default ProfileLevel
