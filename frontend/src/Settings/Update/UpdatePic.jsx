import React, { useState } from 'react'
import mavSvg from '../assets/Group.svg'
import bg1 from "../assets/bg1.jpg"


function UpdatePic() {
    
    const [profilePic, setProfilePic] = useState(mavSvg);
    const [backgndPic, setBackgndPic] = useState(bg1);
    
    const UpdateProfilePic = (event) => {
        if (event.target.files && event.target.files[0]) {
            setProfilePic(URL.createObjectURL(event.target.files[0]));
            console.log(URL.createObjectURL(event.target.files[0]))
        }
    }

  return (
    <div>
        <div className="update"> 
            <img src={profilePic} alt="UserPic"/>
            <p className='title-pic'> Upload a new picture </p>
            <div className="update__btn" onClick={() => document.getElementById('fileInput').click()}>Update 
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={UpdateProfilePic}
                    style={{ display: 'none' }}
                    />
            </div>
        </div>
        <div className="update"> 
            <img  src={bg1} alt="UserPic"/>
            <p className='title-pic'> Upload a new walppaper </p>
            <div className="update__btn"> Update </div>
        </div>
    </div>
  )
}

export default UpdatePic
