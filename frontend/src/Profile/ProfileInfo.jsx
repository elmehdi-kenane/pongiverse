import {React, useContext, useEffect, useState} from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';

import EditIcon from '@mui/icons-material/Edit';

import IsFriends from './FriendOptions/IsFriends';
import Report from './Report/Report';

import mavSvg from "./assets/Group.svg"
// import clan from "./assets/Frame.svg"
// import clan4 from "./assets/Frame4.svg"
import clan5 from "./assets/Frame5.svg"
import bg1 from "./assets/bg1.jpg"
// import bg2 from "./assets/bg2.jpg"

function ProfileInfo(props) {
  
  const {bio} = useContext(AuthContext);
  const { user, userImg } = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState(null);
  const [userPicture, setUserPicture] = useState(null);
  

  useEffect(() => {

    const getUserInfo = async () => {
      try {
        const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getuserinfo`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user
          })
        }
        )
        let res = await response.json()
        setUserInfo(res)
        console.log("response : ", res);
      }
      catch (error) {
        console.error('Error Getting userInfo :', error);
      }
    }
    if (user){
      getUserInfo();
    }
  }, [user])


  // useEffect(() => {
  //   const getUserimg = async () => {
  //     try {
  //       const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/getImage`, {
  //         method: "POST",
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           image: userInfo.avatar
  //         })
  //       }
  //       )
  //       const blob = await response.blob();
	// 			setUserPicture(URL.createObjectURL(blob));
  //       console.log("userPicture response : ", userPicture);
  //     }

  //     catch (error) {
  //       console.error('Error Getting userPic :', error);
  //     }
  //   }

  //   if (userInfo)
  //     getUserimg()
  // },[userInfo])

    const isOwnProfile = false;
    // const [isOwnProfile, setIsOwnProfile] = useState(false);

  return (
    <div className="profile-userinfo purple-glass" style={{backgroundImage: `url(${bg1})`}}>

      {isOwnProfile ? <EditIcon className='userinfo__edit info-position'/> : <IsFriends />}
      
      <div className="userinfo__pic">
        {
          userImg ? <img src={userImg} alt="Player" /> : <img src={mavSvg} alt="Player" />
        }
        <div className="is-online no-select"> Online </div>
      </div>
      <div className="userinfo__name-bio">
        <div className="userinfo__name-avatar">
          <h1 className="userinfo__name"> {userInfo && userInfo.username} </h1>
          <div className="userinfo__avatar">
              <img src={clan5} alt="Avatar" />
              <p className='avatar-desc filter-glass'> Avatar Level 5 </p>
          </div>
        </div>
        <p className="userinfo__bio"> {bio} </p>
      </div>
      {!isOwnProfile && <Report />}
    </div>
  )
}

export default ProfileInfo

