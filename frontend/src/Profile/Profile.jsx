import {React, useState} from 'react'
import {Link} from "react-router-dom"
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import mavSvg from "./Group.svg"
import chatSvg from "../assets/navbar-sidebar/chat.svg"
import achvSvg from "./achv.svg"
import { rankData } from '../Dashboard/helpers/rankData'
import Pagination from "../Dashboard/helpers/Pagination"
import BarGraph from "../Dashboard/charts/BarGraph"
import clan from "./Frame.svg"
import clan4 from "./Frame4.svg"
import "./Profile.css"


const bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."

const achv = [
  {
    image : achvSvg,
    title: "Triple Row ",
    desc: "Get a triple wins in a row"
  },
  {
    image : achvSvg,
    title: "Table Killer",
    desc: "Get a dominant shutout victory"
  },
  {
    image : achvSvg,
    title: "Tournament Master",
    desc: "Win a tournament"
  },
]

const profileUserFriends = () => {
  
  return (
    <>
      <h1> Friends </h1>
      <div className="userfriends__classment purple-glass">
      {rankData.map((player) => {
        return (
          <div className='classment__friend'>
            <div className="friend__pic-name">
              <img src={player.img} alt='playerImg'/>
              <p> {player.name} </p>
            </div>
            <div className='friend__chat'>
              <Link className='chat__button'>
                <img src={chatSvg} alt='chatIcon'/>
                <p style={{cursor: 'pointer'}}> message </p>
              </Link>
            </div>
          </div>
        )
      })}
      </div>
      <Pagination />
    </>
  )
} 

const profileUserAchievement = () => {
  return (
    <>
      <h1> Achievements </h1>
      <div className="achievements__container">
        { achv.map((ach) => {
          return (
            <div className="achivement purple-glass">
              <img src={ach.image} alt='achievmentImg'/>
              <div className="achivement__title-desc">
                <h3> {ach.title} </h3>
                <p> {ach.desc} </p>
              </div>
            </div>
          )
        })}
      </div>
      <Pagination />
    </>
  )
}

function profileUserStatistics(){
  return (
    <>
      <h1> Statistics </h1>
      <div className="statistics__container">
        <BarGraph marginLeft={-34} marginRight={8}/>
      </div>
    </>
  )
}


function Profile() {
  const level = 8;
  const per = 55;
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  return (
    <div className='profile-page'>
      {/* User Info */}
      <div className="profile-userinfo purple-glass">
        <div className="userinfo__head">
            {isOwnProfile ? <EditIcon className='userinfo__head__edit'/> :
              <div className="userinfo__addfriend">
                <PersonAddIcon />
                <p> Add Friend </p>
              </div> 
            }
        </div>

        <div className="userinfo__body">
          <div className="userinfo__pic">
            <img src={mavSvg} alt="Player" />
            <div className="is-online"> Online </div>

          </div>
          <div className="userinfo__name-bio">
            <div className="userinfo__name-avatar">
              <h1 className="userinfo__name"> Maverick </h1>
              <img src={clan4} />
            </div>
            <p className="userinfo__bio"> {bio} </p>
          </div>
        </div>

      </div>

      {/* User Level */}
      <div className="profile-userlevel">
        <div className='userlevel__per' style={{width:`${per}%`}} />
        <p> Level {level} - {per}% </p>
      </div>

      {/* User State */}
      <div className="profile-userstats">
        <div className='userstate__friends'>
          {profileUserFriends()}
        </div>
        <div className='userstate__achievements'>
          {profileUserAchievement()}
        </div>
        <div className='userstate_statistics'>
          {profileUserStatistics()}
        </div>
      </div>
    </div>
  )
}

export default Profile
