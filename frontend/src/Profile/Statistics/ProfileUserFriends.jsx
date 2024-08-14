import React, { useEffect, useState, useContext } from 'react'
import chatSvg from "../../assets/navbar-sidebar/chat.svg"
// import { rankData } from '../../Dashboard/helpers/rankData'
import Pagination from "../../Dashboard/helpers/Pagination"
import { Link, useNavigate } from "react-router-dom"
import MavSvg from "../../assets/Profile/Group.svg"

import ProfileContext from '../ProfileWrapper'

const ProfileUserFriends = () => {

  const { userId } = useContext(ProfileContext);
  const [friendsData, setFriendsData] = useState([])
  const [userImages, setUserImages] = useState([]);

  useEffect(()=> {
    const fetchImages = async () => {
			const promises = friendsData.map(async (user) => {
				const response = await fetch(`http://localhost:8000/api/getImage`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						image: user.pic
					})
				});
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			});
			const images = await Promise.all(promises);
			setUserImages(images);
		};
    if (friendsData.length)
      fetchImages()
  },[friendsData])

  useEffect(() => {
    const getUserFriends = async () => {
      try {
        const response = await fetch(`http://localhost:8000/profile/getUserFriends/${userId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const res = await response.json()
        if (response.ok) {
          // console.log("Response allUserData : ", res.allUserData);
          setFriendsData(res.allUserData)
        }
        else 
          console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    }
    if (userId)
      getUserFriends()
  }, [userId])


  const navigate = useNavigate();
  const handleProfileClick = (username) => {
    navigate(`/mainpage/profile/${username}`);
    // window.location.reload();
  };

  return (
    <div className='userstate__friends purple-glass-stats'>
      <div className='userstate-header'><h1> Friends </h1> </div>
      <div className="userfriends__classment">
        {friendsData.map((player, key) => {
          return (
            <div className='classment__friend' key={key}>
              <div className="friend__pic-name" onClick={() => handleProfileClick(player.username)}>
                <img src={userImages.length ? userImages[key] : MavSvg} alt='playerImg' />
                <p> {player.username} </p>
              </div>
              {/* <Link className="friend__pic-name" to={`/mainpage/profile/${player.username}`}>
                <img src={userImages.length ? userImages[key] : MavSvg} alt='playerImg' />
                <p> {player.username} </p>
              </Link> */}
              <Link className='chat__button no-select' to='/mainpage/chat'>
                <img src={chatSvg} alt='chatIcon' />
                <p style={{ cursor: 'pointer' }}> message </p>
              </Link>
            </div>
          )
        })}
      </div>
      <Pagination />
    </div>
  )
}

export default ProfileUserFriends
