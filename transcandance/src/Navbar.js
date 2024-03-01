import React from "react";
import { useState } from "react";

function Navbar({ profileDropDownisOpen, setProfileDropDownisOpen, notificationsDropDownisOpen,
    setNotificationsDropDownisOpen, notifications, setNotifications,
    Icons, profileHandleDropDown, notificationsHandleDropDown,
    handleExapandSidebar, searchbar, setSearchBar}) {

    const handleSearchBar = () => {
        setSearchBar(!searchbar);
    }

    return (
        <div className="navbar">
            <div className="logo">
                <a href="#">
                    <img src={Icons.pingpong} alt="ping pong" />
                </a>
            </div>
            <div className="sidebar-menu" onClick={handleExapandSidebar}>
                <a href="#">
                    <img src={Icons.menu} alt="sidebar menu" />
                </a>
            </div>
            <div className="search-bar">
                <input type="text" placeholder="Search" />
            </div>
            { searchbar && (<div className="search-bar-mobile">
                <input type="text" placeholder="Search" onBlur={handleSearchBar} autoFocus/>
            </div>)}
            <div className="profile-notifications">
                <div className="search-icon-mobile" onClick={handleSearchBar}>
                    <a href="#">
                        <img src={Icons.searchMobile} alt="" />
                    </a>
                </div>
                <div id="notifications-icon" onClick={notificationsHandleDropDown}>
                    <a href="#">
                        <img src={Icons.notification} alt="notifications-icon" />
                    </a>
                    {notificationsDropDownisOpen && (
                        (notifications.length && (
                            <div className='notifications-container'>
                                {
                                    notifications.map((notification, index) => {
                                        return (
                                            <div key={notification.id}
                                            className='notifications-dropdown'
                                            >
                                            <div className='notifications-pic-text'>
                                                <div id='notifications-pic'>
                                                    <a href="#">
                                                        <img src={Icons.profilepic} alt="" />
                                                    </a>
                                                </div>
                                                <div id='notifications-text'>
                                                    <a href="#">
                                                        {notification.notificationText}
                                                    </a>
                                                </div>
                                            </div>
                                            {index != notifications.length - 1 && (<hr></hr>)}
                                        </div>
                                        );
                                    })
                                }
                            </div>
                    )) || (
                        !notifications.length && (
                        <div className='no-notifications-dropdown'>
                            <div id='dropdown-notifications-title'>
                                Notifications
                            </div>
                            <div id='dropdown-notifications-separator'>
                                <div id='notifications-line-break'></div>
                            </div>
                            <div id='dropdown-notifications-body'>
                                There is no notifications for now.
                            </div>
                        </div>
                        )
                    )
                    )}
                </div>
                <div id="profile-icon" onClick={profileHandleDropDown}>
                    <a href="#">
                        <img src={Icons.profilepic} alt="" />
                    </a>
                    {profileDropDownisOpen && (<div className='profile-dropdown'>
                          <div className='dropdown-profile-name'>
                            <div id='dropdown-profile-pic'>
                              <a href='#'>
                                <img src={Icons.profilepic} />
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
                                    <img src={Icons.settings} alt="" />
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
                                    <img src={Icons.logout} alt="" />
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
            </div>
        </div>
    );
}

export default Navbar;