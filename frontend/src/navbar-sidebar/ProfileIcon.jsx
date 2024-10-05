import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './Authcontext';
import MavSvg from "../assets/Profile/Group.svg"

const ProfileIcon = ({ Icons, profileHandleDropDown, profileDropDownisOpen }) => {

    const {user, privateCheckAuth, setUser, hideNavSideBar, userImg} = useContext(AuthContext);
    const navigate = useNavigate();

    const settingsNavigation = () => { // Done by Imad
        navigate(`/mainpage/settings`)
      }
    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/auth/logout/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                setUser("");
                navigate("/signin");
            }
        } catch (e) {
            console.log("Error in network or URL");
        }
    }
    return (
        <div id="profile-icon" onClick={profileHandleDropDown}>
            <a href="#">
                <img src={userImg ? userImg : MavSvg} alt="" />
            </a>
            {profileDropDownisOpen && (<div className='profile-dropdown'>
                <div className='dropdown-profile-name'>
                    <div id='dropdown-profile-pic'>
                        <Link to={`/mainpage/profile/${user}`}>
                            <img src={userImg ? userImg : MavSvg} alt="profile-pic" />
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
                <div className='settings-symbol-text' onClick={settingsNavigation}>
                    <div id='settings-symbol'>
                        <a href="#">
                            <img src={Icons.settings} alt="settings-logo" />
                        </a>
                    </div>
                    <div id='settings-text'>
                        <Link>
                            Settings
                        </Link>
                    </div>
                </div>
                <div className='logout-symbol-text' onClick={logout}>
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