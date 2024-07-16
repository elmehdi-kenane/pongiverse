import React, { useState } from 'react'
import mavSvg from '../assets/Group.svg'
import bg1 from "../assets/bg1.jpg"


function UpdatePic() {
    
    const [profilePic, setProfilePic] = useState(mavSvg);
    const [backgndPic, setBackgndPic] = useState(bg1);
    
    const UpdateProfilePic = (event) => {
        console.log("click ...")
        if (event.target.files && event.target.files[0]) {
            setProfilePic(event.target.files[0]);
            console.log(event.target.files[0])
            // Here you can save the uploaded image, for example, by sending it to a server
            // using an API call or storing it in the browser's local storage
        }
    }

  return (
    <div>
        <div className="update"> 
            <img  src={mavSvg} alt="UserPic"/>
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
