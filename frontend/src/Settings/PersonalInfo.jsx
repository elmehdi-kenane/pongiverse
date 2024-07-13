import React, { useRef, useState ,useEffect} from 'react'

import mavSvg from './assets/Group.svg'
import bg1 from "./assets/bg1.jpg"

import UpdateNkName from './Update/UpdateNkName';
import UpdateBio from './Update/UpdateBio';
import UpdateCountry from './Update/UpdateCountry';

function PersonalInfo() {

  return (
    <div className="settings__personal-info ">
        <h1 className='personal-info__header'> PERSONAL INFO </h1>
        <div className="personal-info__update">
          <div className="update"> 
            <img  src={mavSvg} alt="UserPic"/>
            <p className='title-pic'> Upload a new picture </p>
            <div className="update__btn"> Update </div>
          </div>
          <div className="update"> 
            <img  src={bg1} alt="UserPic"/>
            <p className='title-pic'> Upload a new walppaper </p>
            <div className="update__btn"> Update </div>
          </div>
          <UpdateNkName />
          <UpdateBio />
          <UpdateCountry/>
        </div>
    </div>
  )
}

export default PersonalInfo
