import React, { useContext, useState } from 'react'
import "./Settings.css";
import { Toaster } from "react-hot-toast";
import UpdatePwd from './UpdateSecurity/UpdatePwd';
import UpdateTFQ from './UpdateSecurity/UpdateTFQ';
import SettingsLeft from './SettingsLeft';
import SettingsContext from './SettingsWrapper';
import DisableTFQ from './UpdateSecurity/DisableTFQ';
import GameNotifications from '../GameNotif/GameNotifications';

function Security() {
  const [option, setOption] = useState('security');
  const { userTfq } = useContext(SettingsContext);
  
  const SecurityOptions = () => {
    return (
      <>
        <div className="update">
          <p className='title more-width'> Change Password </p>
          <div className="update__btn" onClick={() => setOption('pwd')}> Update </div>
        </div>
        <div className="update no-bottom">
          <p className='title more-width'> Authenticator App </p>
          {!userTfq ? <div className="update__btn" onClick={() => setOption('enable-tfq')}> Enable </div>
            : <div className="update__btn" onClick={() => setOption('disable-tfq')}> Disable </div>
          }
        </div>
      </>
    )
  }

  return (
    <div className="settings-page">
      <Toaster />
      <GameNotifications />
      <SettingsLeft />
      <div className="settings__security">
        <h1 className='settings__header'> SECURITY </h1>
        <div className="security__update linear-purple-bg">
          {option === 'security' && <SecurityOptions />}
          {option === 'pwd' && <UpdatePwd cancelPwd={setOption} />}
          {option === 'enable-tfq' && <UpdateTFQ cancelTFQ={setOption}/>}
          {option === 'disable-tfq' && <DisableTFQ cancelTFQ={setOption}/>}
        </div>
      </div>
    </div>
  )
}

export default Security
