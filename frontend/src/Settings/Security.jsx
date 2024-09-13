import React, { useState } from 'react'
import "./Settings.css";

import { Toaster } from "react-hot-toast";
import UpdatePwd from './UpdateSecurity/UpdatePwd';
import UpdateTFQ from './UpdateSecurity/UpdateTFQ';
import SettingsLeft from './SettingsLeft';

function Security() {

  const [isPwd, setIsPwd] = useState(false);
  const [isTF, setIsTF] = useState(false);

  const setUpdate = (option) => {
    if (option === 'pwd')
      setIsPwd(!isPwd);
    else
      setIsTF(!isTF);
  }
  
  return (
    <div className="settings-page">
      <Toaster />
      <SettingsLeft />
      <div className="settings__security">
        <h1 className='settings__header'> SECURITY </h1>
        <div className="security__update linear-purple-bg">
          {!isPwd && !isTF &&
            <>
              <div className="update">
                <p className='title more-width'> Change Password </p>
                <div className="update__btn" onClick={() => setUpdate('pwd')}> Update </div>
              </div>
              <div className="update no-bottom">
                <p className='title more-width'> Authenticator App </p>
                <div className="update__btn" onClick={() => setUpdate('tf')}> Enable </div>
              </div>
            </>
          }
          {isPwd && <UpdatePwd cancelPwd={setIsPwd} />}
          {isTF && <UpdateTFQ />}
        </div>
      </div>
    </div>
  )
}

export default Security
