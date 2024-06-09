import {React, useState} from 'react'
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';

// import clan from "./assets/Frame.svg"
// import clan4 from "./assets/Frame4.svg"
import clan5 from "./assets/Frame5.svg"
import mavSvg from "./assets/Group.svg"
import bg1 from "./assets/bg1.jpg"
import bg2 from "./assets/bg2.jpg"



  const UserFriend = () => {
    const [isFriend, setIsFriend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFriendClick = () => {
      setIsLoading(true);

      setTimeout(() => {
        console.log("Waited 3 Sec");  
        setIsLoading(false);
      }, 2500);

      setIsFriend(!isFriend);
    }

    if (isLoading === true) {
      return (
        <div className="userinfo__is-friends no-select info-position friends-padding" >
            <p> Waiting </p>
        </div>
      )
    }
    else if (isFriend === true ){
      return (
        <div className="userinfo__is-friends no-select info-position friends-padding" 
        onClick={handleFriendClick}>
            <HowToRegIcon />
            <p> Friends </p>
        </div>
      )
    }
    else if (isFriend === false ){
        return (
          <div className="userinfo__is-friends no-select info-position" 
          onClick={handleFriendClick}>
            <PersonAddIcon />
            <p> Add Friend </p>
          </div> 
        )
    }
  }

function ProfileInfo() {

    const bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."
    const [isOwnProfile, setIsOwnProfile] = useState(false);

  return (
    <div className="profile-userinfo purple-glass" style={{backgroundImage: `url(${bg1})`}}>
     
      {isOwnProfile ? <EditIcon className='userinfo__edit info-position'/> : <UserFriend />}
      
      <div className="userinfo__pic">
        <img src={mavSvg} alt="Player" />
        <div className="is-online no-select"> Online </div>
      </div>
      <div className="userinfo__name-bio">
        <div className="userinfo__name-avatar">
          <h1 className="userinfo__name"> Maverick </h1>
          <div className="userinfo__avatar">
              <img src={clan5} alt="Avatar" />
              <p className='avatar-desc filter-glass'> Avatar Level 5 </p>
          </div>
        </div>
        <p className="userinfo__bio"> {bio} </p>
      </div>
    </div>
  )
}

export default ProfileInfo
