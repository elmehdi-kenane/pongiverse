import React, { useState, useContext } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../../Profile/ProfileWrapper';
import EditIcon from '@mui/icons-material/Edit';


function UpdatePic(props) {

  const { user } = useContext(AuthContext)
  const { userPic, userBg, setUserBg } = useContext(ProfileContext)

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const UpdateBgPic = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const newBg = event.target.files[0];
      const base64Bg = await convertToBase64(newBg);
      try {
        const response = await fetch('http://localhost:8000/profile/updateUserBg', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user,
            image: base64Bg,
          })
        });
        const res = await response.json()
        if (response.ok){
          // console.log(res.case);
          setUserBg(base64Bg);
        }
        else
          console.log(res.error);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div>
      <div className="update">
        <img src={userPic} alt="userImg" />
        <p className='title-pic'> Upload a new picture </p>
        <div className="update__btn" onClick={() => props.setAdjust(true)}> <p> Update </p>
          <EditIcon /> 
        </div>
      </div>
      <div className="update">
        <img src={userBg} alt="userBg" />
        <p className='title-pic'> Upload a new walppaper </p>
        <div className="update__btn" onClick={() => document.getElementById('fileInput').click()}> <p> Update </p>
          <EditIcon />
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
