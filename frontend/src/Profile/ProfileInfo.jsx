import {React, useContext, useEffect, useState} from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';
import ProfileContext from './ProfileWrapper';

import EditIcon from '@mui/icons-material/Edit';

import IsFriends from './FriendOptions/IsFriends';
import Report from './Report/Report';

import mavSvg from "./assets/Group.svg"
// import clan from "./assets/Frame.svg"
// import clan4 from "./assets/Frame4.svg"
import clan5 from "./assets/Frame5.svg"

function ProfileInfo(props) {
  
  const { user } = useContext(AuthContext);
  const {userBio, userPic, userLevel, userBg} = useContext(ProfileContext);

    const isOwnProfile = false;
    // const [isOwnProfile, setIsOwnProfile] = useState(false);

  return (
    <div className="profile-userinfo purple-glass" style={{backgroundImage: `url(${userBg})`}}>

      {isOwnProfile ? <EditIcon className='userinfo__edit info-position'/> : <IsFriends />}
      
      <div className="userinfo__pic">
        {
          userPic ? <img src={userPic} alt="Player" /> : <img src={mavSvg} alt="Player" />
        }
        <div className="is-online no-select"> Online </div>
      </div>
      <div className="userinfo__name-bio">
        <div className="userinfo__name-avatar">
          <h1 className="userinfo__name"> {user && user} </h1>
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

