import React, { useState } from 'react'
import { Toaster } from "react-hot-toast";
import SettingsLeft from "./SettingsLeft";
import "./Settings.css";

import UpdateBio from './Update/UpdateBio';
import UpdateCountry from './Update/UpdateCountry';
import UpdateBg from './Update/UpdateBg';
import UpdateAvatar from './Update/UpdateAvatar';
import UpdatePictures from './Update/UpdatePictures';
import GameNotifications from '../GameNotif/GameNotifications';


function PersonalInfo() {
  const [isUpdate, setIsUpdate] = useState(false);

  return (
    <div className="settings-page">
      <Toaster />
      <GameNotifications />
      <SettingsLeft />
      <div className="settings__personal-info ">
        <h1 className='settings__header'> PERSONAL INFO </h1>
        <div className="personal-info__update linear-purple-bg">
          {!isUpdate && 
            <>
              <UpdatePictures setIsUpdate={setIsUpdate}/>
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
