import React, { useState, useContext } from 'react'
import { Toaster } from "react-hot-toast";
import SettingsContext from "./SettingsWrapper";
import SettingsLeft from "./SettingsLeft";
import "./Settings.css";
import EditIcon from '@mui/icons-material/Edit';

import UpdateNkName from './Update/UpdateNkName';
import UpdateBio from './Update/UpdateBio';
import UpdateCountry from './Update/UpdateCountry';
import UpdateBg from './Update/UpdateBg';
import UpdateAvatar from './Update/UpdateAvatar';


function PersonalInfo() {
  
  const [isUpdate, setIsUpdate] = useState(false);
  const { userPic, userBg } = useContext(SettingsContext)

  const UpdatePictures = () => {
    return (
      <>
        <div className="update">
          <img src={userPic} alt="userImg" />
          <p className='title-pic'> Upload a new picture </p>
          <div className="update__btn" onClick={() => setIsUpdate('avatar')}> <p> Update </p>
            <EditIcon /> 
          </div>
        </div>
        <div className="update">
          <img src={userBg} alt="userBg" />
          <p className='title-pic'> Upload a new wallpaper </p>
          <div className="update__btn" onClick={() => setIsUpdate('background')}> <p> Update </p>
            <EditIcon />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="settings-page">
      <Toaster />
      <SettingsLeft />
      <div className="settings__personal-info ">
        <h1 className='settings__header'> PERSONAL INFO </h1>
        <div className="personal-info__update linear-purple-bg">
          {!isUpdate && 
            <>
              <UpdatePictures />
              <UpdateNkName />
              <UpdateBio />
              <UpdateCountry />
            </>
          }
          {isUpdate === 'avatar' && <UpdateAvatar setAdjust={setIsUpdate}/>}
          {isUpdate === 'background' && <UpdateBg setAdjust={setIsUpdate}/>}
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
