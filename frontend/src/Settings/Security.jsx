import React, { useState } from 'react'
import "./Settings.css";

import { Toaster } from "react-hot-toast";
import UpdatePwd from './UpdateSecurity/UpdatePwd';
import UpdateTFQ from './UpdateSecurity/UpdateTFQ';
import SettingsLeft from './SettingsLeft';

function Security() {

  const [option, setOption] = useState('security');

  const setComponent = (option) => {
    setOption(option);
  }
  
  const SecurityOptions = () => {
    return (
      <>
        <div className="update">
          <p className='title more-width'> Change Password </p>
          <div className="update__btn" onClick={() => setOption('pwd')}> Update </div>
        </div>
        <div className="update no-bottom">
          <p className='title more-width'> Authenticator App </p>
          <div className="update__btn" onClick={() => setOption('tfq')}> Enable </div>
        </div>
      </>
    )
  }

  return (
    <div className="settings-page">
      <Toaster />
      <SettingsLeft />
      <div className="settings__security">
        <h1 className='settings__header'> SECURITY </h1>
        <div className="security__update linear-purple-bg">
          {option === 'security' && <SecurityOptions />}
          {option === 'pwd' && <UpdatePwd cancelPwd={setOption} />}
          {option === 'tfq' && <UpdateTFQ cancelTFQ={setOption}/>}
        </div>
      </div>
    </div>
  )
}

export default Security
