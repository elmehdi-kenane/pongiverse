import {React, useState} from 'react'
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// import clan from "./assets/Frame.svg"
import clan4 from "./assets/Frame4.svg"
import mavSvg from "./assets/Group.svg"

function ProfileInfo() {

    const bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."
    const [isOwnProfile, setIsOwnProfile] = useState(false);

  return (
    <div className="profile-userinfo purple-glass">
      {isOwnProfile ? <EditIcon className='userinfo__edit info-position'/> :
        <div className="userinfo__addfriend no-select info-position">
          <PersonAddIcon />
          <p> Add Friend </p>
        </div>
      }
      
      <div className="userinfo__pic">
        <img src={mavSvg} alt="Player" />
        <div className="is-online no-select"> Online </div>
      </div>
      <div className="userinfo__name-bio">
        <div className="userinfo__name-avatar">
          <h1 className="userinfo__name"> Maverick </h1>
          <img src={clan4} alt="Avatar" />
        </div>
        <p className="userinfo__bio"> {bio} </p>
      </div>
    </div>
  )
}

export default ProfileInfo
