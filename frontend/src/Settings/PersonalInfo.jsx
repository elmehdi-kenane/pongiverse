import React, { useState } from 'react'
import { Toaster } from "react-hot-toast";
import SettingsContext from "./SettingsWrapper";
import SettingsLeft from "./SettingsLeft";
import "./Settings.css";

import UpdateNkName from './Update/UpdateNkName';
import UpdateBio from './Update/UpdateBio';
import UpdateCountry from './Update/UpdateCountry';
import UpdatePic from './Update/UpdatePic';
import AdjustPic from './Update/AdjustPic';

function PersonalInfo() {

  const [isAdjustPic, setIsAdjustPic] = useState(false);

  return (
    <div className="settings-page">
      <Toaster />
      <SettingsLeft />
      <div className="settings__personal-info ">
        <h1 className='settings__header'> PERSONAL INFO </h1>
        <div className="personal-info__update linear-purple-bg">
          {isAdjustPic ? <AdjustPic setAdjust={setIsAdjustPic}/> :
            <>
              <UpdatePic setAdjust={setIsAdjustPic}/>
              <UpdateNkName />
              <UpdateBio />
              <UpdateCountry />
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
