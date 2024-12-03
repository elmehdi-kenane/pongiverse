import { React, useContext } from 'react'
import ProfileInfo from './ProfileInfo';
import ProfileLevel from './ProfileLevel';
import ProfileStatistics from './ProfileStatistics'
import AuthContext from '../navbar-sidebar/Authcontext';
import ReportContent from "./Report/ReportContent"
import "./Profile.css"
import Block from './Report/Block';
import GameNotifications from '../GameNotif/GameNotifications';


function Profile() {
  const { isReport, isBlock, user } = useContext(AuthContext);

  return (
    <>
      {isBlock && <Block />}
      {isReport && <ReportContent />}

      {user &&
        <div className={(isReport || isBlock) ? 'profile-page profile-blur' : 'profile-page'}>
          <GameNotifications />
          <ProfileInfo />
          <ProfileLevel />
          <ProfileStatistics />
        </div>
      }
    </>
  )
}

export default Profile
