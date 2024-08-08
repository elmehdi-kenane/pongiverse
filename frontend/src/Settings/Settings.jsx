import React, { useState, useContext} from 'react'
import './Settings.css'
import PersonalInfo from './PersonalInfo'
import Security from './Security';
import AuthContext from '../navbar-sidebar/Authcontext';

import toast, { Toaster } from 'react-hot-toast';
import SettingsContext from './SettingsWrapper';

function Settings() {

  const [isInfo, setIsInfo] = useState(true);
  const {user} = useContext(AuthContext);
  const {userPic, userEmail} = useContext(SettingsContext);

  return (
    <div className='settings-page'>
      <Toaster />
      <div className="settings__leftside">
        <div className='pic-name'>
            <img src={userPic} alt='userImg'/>
            <p> {user} </p>
        </div>
        <p className='left__email'>
            {userEmail}
        </p>
        <div className={isInfo ? 'left__pers-info btn-active':'left__pers-info'}
            onClick={()=>{setIsInfo(true)}}> Personal Info </div>
        <div className={!isInfo ? 'left__security btn-active':'left__security'} onClick={()=>{setIsInfo(false)}}> Security </div>
      </div>
      {isInfo && <PersonalInfo />}
      {!isInfo && <Security />}
    </div>
  )
}

export default Settings