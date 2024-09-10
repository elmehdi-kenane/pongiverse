import React, { useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';
import SettingsContext from './SettingsWrapper';
import { useNavigate } from 'react-router-dom';



function SettingsLeft() {
  const { user } = useContext(AuthContext);
  const { userPic, userEmail, isInfo, setIsInfo } = useContext(SettingsContext);
  const navigate = useNavigate();
  
  const profileNavigation = () => {
      navigate(`/mainpage/profile/${user}`)
  }

  const settingsNavigation = (setting) => {
    setting === "personalinfo" && setIsInfo(true);
    setting === "security" && setIsInfo(false);
    navigate(`/mainpage/settings/${setting}`)
  }

  return (
    <div className="settings__leftside" >
        <div className="pic-name" onClick={profileNavigation}>
          <img src={userPic} alt="userImg" />
          <p> {user} </p>
        </div>
        <p className="left__email">{userEmail}</p>
        <div className={isInfo ? "left__pers-info btn-active" : "left__pers-info"} onClick={()=>settingsNavigation("")}>
          Personal Info
        </div>
        <div className={!isInfo ? "left__security btn-active" : "left__security"} onClick={()=>settingsNavigation("security")}> 
          Security
        </div>
    </div>
  )
}

export default SettingsLeft
