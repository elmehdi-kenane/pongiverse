import { React, useContext, useEffect, useState } from 'react'

import ProfileInfo from './ProfileInfo';
import ProfileLevel from './ProfileLevel';
import ProfileStatistics from './ProfileStatistics'
import AuthContext from '../navbar-sidebar/Authcontext';
import ReportContent from "./Report/ReportContent"
import "./Profile.css"
import Block from './Report/Block';
import ProfileContext from './ProfileWrapper';
import { Navigate } from 'react-router-dom';


function Profile() {

  const { isReport, isBlock, user } = useContext(AuthContext);
  const { userId, checkUser } = useContext(ProfileContext);

  // useEffect(() => {
  //   console.log("Scroll Effect Here")
  //   function topFunction() {
  //     document.body.scrollTop = 0; // For Safari
  //     document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  //   }
  //   topFunction();
  // }, [userId]);

  return (
    <>
      {isBlock && <Block />}
      {isReport && <ReportContent />}
      {!checkUser && <Navigate to="/Error404" />}

      {user &&
        <div className={(isReport || isBlock) ? 'profile-page profile-blur' : 'profile-page'}>
          <ProfileInfo />
          <ProfileLevel />
          <ProfileStatistics />
        </div>
      }
    </>
  )
}

export default Profile
