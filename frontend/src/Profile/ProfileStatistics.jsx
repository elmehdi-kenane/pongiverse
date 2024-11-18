import React from 'react';

import ProfileUserFriends from './Statistics/ProfileUserFriends'
import ProfileUserStatistics from './Statistics/ProfileUserStatistics';
import ProfileUserDiagrame from './Statistics/ProfileUserDiagrame';
import ProfileUserGames from './Statistics/ProfileUserGames';
  
function ProfileStatistics() {
  return (
    <div className="profile-userstats">
      <ProfileUserStatistics />
      <div className="userstate__friends-diagrame">
            <ProfileUserFriends />
            <ProfileUserDiagrame />
      </div>
      <ProfileUserGames />
    </div>
  )
}

export default ProfileStatistics
