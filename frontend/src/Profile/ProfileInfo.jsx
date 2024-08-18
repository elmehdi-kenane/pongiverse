import {React, useContext, useRef, useEffect} from 'react'
import { Link } from 'react-router-dom';

import AuthContext from '../navbar-sidebar/Authcontext';
import ProfileContext from './ProfileWrapper';

import EditIcon from '@mui/icons-material/Edit';
import IsFriends from './FriendOptions/IsFriends';
import Report from './Report/Report';
import clan5 from "../assets/Profile/Frame5.svg"

function ProfileInfo() {
  
  const { user } = useContext(AuthContext);
  const {userId ,userBio, userPic, userBg} = useContext(ProfileContext);
  const getTopRef = useRef(null);

  const isOwnProfile = user === userId;

  useEffect(() => {
    if (getTopRef.current) {
      getTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userId]);

  return (
    <div className="profile-userinfo purple-glass" style={{backgroundImage: `url(${userBg})`}} ref={getTopRef}>
      {isOwnProfile ? 
      <Link to="/mainpage/settings" className="info-position">
        <EditIcon className='userinfo__edit info-position'/>
      </Link> :
      <IsFriends />}
      
      <div className="userinfo__pic">
          <img src={userPic} alt="Player" /> 
        <div className="is-online no-select"> Online </div>
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
