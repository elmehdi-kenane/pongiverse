import React from 'react'
import {Link} from "react-router-dom"

import chatSvg from "../assets/navbar-sidebar/chat.svg"
import achvSvg from "./assets/achv.svg"
import { rankData } from '../Dashboard/helpers/rankData'
import Pagination from "../Dashboard/helpers/Pagination"
import BarGraph from "../Dashboard/charts/BarGraph"
import { profileLevel } from './data/ProfileDataLevel';

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
                <Link className='chat__button no-select'>
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
          <BarGraph marginLeft={-30} marginRight={10} dataLevel={profileLevel}/>
        </div>
      </>
    )
  }

function ProfileStatistics() {
  return (
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
  )
}

export default ProfileStatistics
