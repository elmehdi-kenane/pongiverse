import {React} from 'react'

import ProfileInfo from './ProfileInfo';
import ProfileLevel from './ProfileLevel';
import ProfileStatistics from './ProfileStatistics'
import "./Profile.css"

function Profile() {
  
  return (
    <div className='profile-page'>
        <ProfileInfo />
        <ProfileLevel />
        <ProfileStatistics />
    </div>
  )
}

export default Profile

// window.addEventListener('resize', () => {
//   if (window.innerWidth > 768) {
//     setSidebarIsOpen(false);
//     setSearchBar(false);
//   }
// });