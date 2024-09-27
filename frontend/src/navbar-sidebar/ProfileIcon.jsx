import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from "../navbar-sidebar/Authcontext";

const ProfileIcon = ({ Icons, profileHandleDropDown, profileDropDownisOpen }) => {
    const { user, privateCheckAuth, setUser, hideNavSideBar } = useContext(AuthContext)
    const navigate = useNavigate()
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
                <img src={Icons.profilepic} alt="" />
            </a>
            {profileDropDownisOpen && (<div className='profile-dropdown'>
                <div className='dropdown-profile-name'>
                    <div id='dropdown-profile-pic'>
                        <a href='#'>
                            <img src={Icons.profilepic} alt="profile-pic" />
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