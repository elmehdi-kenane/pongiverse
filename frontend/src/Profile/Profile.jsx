import {React, useContext} from 'react'

import ProfileInfo from './ProfileInfo';
import ProfileLevel from './ProfileLevel';
import ProfileStatistics from './ProfileStatistics'
import AuthContext from '../navbar-sidebar/Authcontext';
import ReportContent from "./Report/ReportContent"
import "./Profile.css"
import Block from './Report/Block';

function Profile() {
  
  const {isReport} = useContext(AuthContext);
  const {isBlock} = useContext(AuthContext);

  return (
    <>
      {/* {isBlock && <Block /> } */}
      {isReport && <ReportContent /> }
      <div className={(isReport) ?'profile-page profile-blur':'profile-page'}>
          <ProfileInfo />
          <ProfileLevel />
          <ProfileStatistics />
      </div>
    </>
  )
}

export default Profile
