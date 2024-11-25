import {React, useContext, useRef, useEffect} from 'react'
import { Link } from 'react-router-dom';

import AuthContext from '../navbar-sidebar/Authcontext';
import ProfileContext from './ProfileWrapper';

import EditIcon from '@mui/icons-material/Edit';
import IsFriends from './FriendOptions/IsFriends';
import Report from './Report/Report';
import bg from "../assets/Profile/bg1.jpg"
import { getName } from 'country-list';



function ProfileInfo() {
  
  const { user, notifSocket } = useContext(AuthContext);
  const { userId , userIsOnline,  setUserIsOnline, userBio, userPic, userBg, userCountry } = useContext(ProfileContext);
  const isOwnProfile = user === userId;
  const flagUrl = userCountry 
        ? `https://flagcdn.com/w320/${userCountry.toLowerCase()}.png` 
        : `https://flagcdn.com/w320/ma.png`;
  const countryName = userCountry ? getName(userCountry) : "Unknown Country"; 
  
  useEffect(()=> {
    if (notifSocket && notifSocket.readyState === WebSocket.OPEN){
      notifSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const type = data.type;
        if (type === "connected_again"){
          const userConnected = data.message.user;
          if (userConnected === userId){
            setUserIsOnline(true);
            console.log("Connected Again: ", userConnected);
          }
        }
        if (type === "user_disconnected"){
          const userDisConnected = data.message.user;
          if (userDisConnected === userId){
            setUserIsOnline(false);
            console.log("DisConnected Again: ", userDisConnected);
          }
        }
      }
    }
  },[userId, notifSocket])

  return (
    <div className="profile-userinfo purple-glass" style={{backgroundImage: `url(${userBg ? userBg : bg})`}}>
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
          <div className="userinfo__country">
              <img src={flagUrl} alt="userCountry" />
              <p className='country-desc filter-glass'> {countryName} </p>
          </div>
        </div>
        <p className="userinfo__bio"> {userBio} </p>
      </div>
      {!isOwnProfile && <Report />}
    </div>
  )
}

export default ProfileInfo
