import React from 'react'

const ProfileIcon = ({ Icons, profileHandleDropDown, profileDropDownisOpen }) => {
  return (
    <div id="profile-icon" onClick={profileHandleDropDown}>
        <a href="#">
            <img src={Icons.profilepic} alt="" />
        </a>
        {profileDropDownisOpen && (<div className='profile-dropdown'>
                <div className='dropdown-profile-name'>
                <div id='dropdown-profile-pic'>
                    <a href='#'>
                        <img src={Icons.profilepic} alt="profile-pic"/>
                    </a>
                </div>
                <div id='dropdown-profile-name'>
                    <a href='#'>
                        Simo maqbour
                    </a>
                </div>
            </div>
            <div className='separator'>
                <div id='line-break'></div>
            </div>
            <div className='settings-symbol-text'>
                <div id='settings-symbol'>
                    <a href="#">
                        <img src={Icons.settings} alt="settings-logo" />
                    </a>
                </div>
                <div id='settings-text'>
                    <a href="#">
                        Settings
                    </a>
                </div>
            </div>
            <div className='logout-symbol-text'>
                <div id='logout-symbol'>
                    <a href="#">
                        <img src={Icons.logout} alt="logout-logo" />
                    </a>
                </div>
                <div id='logout-text'>
                    <a href="#">
                        Logout
                    </a>
                </div>
            </div>
        </div>)}
    </div>
  )
}

export default ProfileIcon;