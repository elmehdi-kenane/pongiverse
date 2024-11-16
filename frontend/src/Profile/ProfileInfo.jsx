import {React, useContext, useRef, useEffect} from 'react'
import { Link } from 'react-router-dom';

import AuthContext from '../navbar-sidebar/Authcontext';
import ProfileContext from './ProfileWrapper';

import EditIcon from '@mui/icons-material/Edit';
import IsFriends from './FriendOptions/IsFriends';
import Report from './Report/Report';
import clan5 from "../assets/Profile/Frame5.svg"
import bg from "../assets/Profile/bg1.jpg"


function ProfileInfo() {
  
  const { user, notifSocket } = useContext(AuthContext);
  const { userId , userIsOnline,  setUserIsOnline, userBio, userPic, userBg } = useContext(ProfileContext);

  const isOwnProfile = user === userId;

  useEffect(()=> {
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN){
      notifSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const type = data.type;
        if (type === "connected_again"){
          const userConnected = data.message.user;
          if (userConnected === userId)
            setUserIsOnline(true);
          console.log("Connected Again: ", userConnected);
        }
        if (type === "user_disconnected"){
          const userDisConnected = data.message.user;
          if (userDisConnected === userId)
            setUserIsOnline(false);
          console.log("DisConnected Again: ", userDisConnected);
        }
      }
    }

  },[notifSocket])

  return (
    <div id="scrollTop" className="profile-userinfo purple-glass" style={{backgroundImage: `url(${userBg ? userBg : bg})`}}>
      {isOwnProfile ? 
      <Link to="/mainpage/settings" className="info-position">
        <EditIcon className='userinfo__edit info-position'/>
      </Link> :
      <IsFriends />}
      
      <div className="userinfo__pic">
          <img src={userPic} alt="Player" /> 
          {userIsOnline ? 
            <div className="is-online online  no-select"> Online </div> : 
            <div className="is-online offline no-select"> Offline </div> 
          }
      </div>
      <div className="userinfo__name-bio">
        <div className="userinfo__name-avatar">
          <h1 className="userinfo__name"> {userId} </h1>
          <div className="userinfo__avatar">
              <img src={clan5} alt="Avatar" />
              <p className='avatar-desc filter-glass'> Avatar Level 5 </p>
          </div>
        </div>
        <p className="userinfo__bio"> {userBio} </p>
      </div>
      {!isOwnProfile && <Report />}
    </div>
  )
}

export default ProfileInfo
