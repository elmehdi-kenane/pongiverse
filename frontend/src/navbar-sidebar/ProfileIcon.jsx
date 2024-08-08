import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import AuthContext from './Authcontext';

const ProfileIcon = ({ Icons, profileHandleDropDown, profileDropDownisOpen }) => {

    const {user, userImg} = useContext(AuthContext);

    return (
        <div id="profile-icon" onClick={profileHandleDropDown}>
            <a href="#">
                <img src={userImg} alt="" />
            </a>
            {profileDropDownisOpen && (<div className='profile-dropdown'>
                <div className='dropdown-profile-name'>
                    <div id='dropdown-profile-pic'>
                        <Link to={`/mainpage/profile/${user}`}>
                            <img src={userImg} alt="profile-pic" />
                        </Link>
                    </div>
                    <div id='dropdown-profile-name'>
                        <Link to={`/mainpage/profile/${user}`}>
                            {user}
                        </Link>
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
                        <Link to="/mainpage/settings">
                            Settings
                        </Link>
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