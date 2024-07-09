import React from 'react'
import mavSvg from './assets/Group.svg'
import bg1 from "./assets/bg1.jpg"

const userData = {
  nickName : "Maverick",
  bio : "Lorem ipsum dolor ...",
  country : "Morocco",
}

const UpdateInfo = (props) => {
  return (
    <div className="update"> 
        <p className='title'> {props.title} </p>
        <p className='info'> {props.value} </p>
        <div className="upload-btn"> Update </div>
    </div>
  )
}

function PersonalInfo() {
  return (
    <div className="settings__personal-info ">
        <h1 className='personal-info__header'> PERSONAL INFO </h1>
        <div className="personal-info__update">
          <div className="update"> 
            <img  src={mavSvg} alt="UserPic"/>
            <p className='title-pic'> Upload a new picture </p>
            <div className="upload-btn"> Update </div>
          </div>
          <div className="update"> 
            <img  src={bg1} alt="UserPic"/>
            <p className='title-pic'> Upload a new walppaper </p>
            <div className="upload-btn"> Update </div>
          </div>
          <UpdateInfo title="Nickname" value={userData.nickName}/>
          <UpdateInfo title="Bio" value={userData.bio}/>
          <UpdateInfo title="Country" value={userData.country}/>
        </div>
    </div>
  )
}

export default PersonalInfo
