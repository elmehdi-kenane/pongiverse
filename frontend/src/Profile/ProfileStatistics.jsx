import React from 'react'
import {Link} from "react-router-dom"

import chatSvg from "../assets/navbar-sidebar/chat.svg"
import { rankData } from '../Dashboard/helpers/rankData'
import Pagination from "../Dashboard/helpers/Pagination"
import BarGraph from "../Dashboard/charts/BarGraph"
import { profileLevel } from './data/ProfileDataLevel';

import DashboardHead from '../Dashboard/DashboardHead'

import { achv } from './data/achvData'


  function ProfileUserStatistics(){
    return (
      <div className='userstate_statistics purple-glass-stats'>
        <div className='userstate-header'><h1> Statistics </h1> </div>
        <div className="statistics__container">
          <BarGraph marginLeft={-35} marginRight={10} dataLevel={profileLevel} barSize={15}/>
        </div>
      </div>
    )
  }
  
  const ProfileUserFriends = () => {
    return (
      <div className='userstate__friends purple-glass-stats'>
        <div className='userstate-header'><h1> Friends </h1> </div>
        <div className="userfriends__classment">
        {rankData.map((player) => {
          return (
            <div className='classment__friend'>
              <Link className="friend__pic-name">
                <img src={player.img} alt='playerImg'/>
                <p> {player.name} </p>
              </Link>
              <Link className='chat__button no-select' to='/mainpage/chat'>
                <img src={chatSvg} alt='chatIcon'/>
                <p style={{cursor: 'pointer'}}> message </p>
              </Link>
            </div>
          )
        })}
        </div>
        <Pagination />
      </div>
    )
  } 
  
  const ProfileUserAchievement = () => {
    return (
      <div className='userstate__achievements purple-glass-stats'>
        <div className='userstate-header'> <h1> Achievements </h1> </div>
        <div className="achievements__container">
          { achv.map((ach) => {
            return (
              <div className="achivement">
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
      </div>
    )
  }
  
function ProfileStatistics() {

    
  return (
    <div className="profile-userstats">
        <ProfileUserStatistics />
      <div className="userstate__friends-achievements">
            <ProfileUserFriends />
            <ProfileUserAchievement />
      </div>
    
    </div>
  )
}

export default ProfileStatistics
