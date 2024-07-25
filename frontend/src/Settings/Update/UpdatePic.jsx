import React, { useState, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import bg1 from "../assets/bg1.jpg"


function UpdatePic(props) {
    
    const [backgndPic, setBackgndPic] = useState(bg1);
    const {userImg, dfltPic} = useContext(AuthContext)

    const UpdateBgPic = (event) => {
      if (event.target.files && event.target.files[0]) {
          setBackgndPic(URL.createObjectURL(event.target.files[0]));
          // console.log(URL.createObjectURL(event.target.files[0]))
      }
    }

  return (
    <div>
        <div className="update"> 
            <img src={userImg ? userImg : dfltPic} alt="userImg"/>
            <p className='title-pic'> Upload a new picture </p>
            <div className="update__btn" onClick={() => props.setAdjust(true)}> Update </div>
        </div>
        <div className="update"> 
            <img  src={backgndPic} alt="userBg"/>
            <p className='title-pic'> Upload a new walppaper </p>
            <div className="update__btn" onClick={() => document.getElementById('fileInput').click()}> Update 
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={UpdateBgPic}
                    style={{ display: 'none' }}
                    />
            </div>
        </div>
    </div>
  )
}

export default UpdatePic
