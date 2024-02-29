import * as Icons from './icons';
import { useState } from 'react';

function App() {
  const [expand, setExpand] = new useState(false);

  const handleExpand = () => {
    setExpand(!expand);
  }

  return (
    <div className="page">
        <div className="navbar">
            <div className="logo">
                <a>
                    <img src={Icons.pingpong} alt="ping pong" />
                </a>
            </div>
            <div className="search-bar">
                <input type="text" placeholder="Search" />
            </div>
            <div className="profile-notifications">
                <div id="notifications-icon">
                    <a href="#">
                        <img src={Icons.notification} alt="notifications-icon" />
                    </a>
                </div>
                <div id="profile-icon">
                    <a href="#">
                        <img src={Icons.profilepic} alt="" />
                    </a>
                    <div className='profile-dropdown'>
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
                    </div>
                </div>
            </div>
        </div>
        <div className={!expand ? "sidebar" : "extendedSidebar"}>
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <a href="#">
                        <img src={Icons.dashboard} alt="cute-girl" />
                    </a>
                </div>
                <div id="sidebar-dashboard-text">
                    <a href="#">Dashboard</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <a href="#">
                        <img src={Icons.friends} alt="cute-girl" />
                    </a>
                </div>
                <div id="sidebar-friends-text">
                    <a href="#">Friends</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <a href="#">
                        <img src={Icons.chat} alt="cute-girl" />
                    </a>
                </div>
                <div id="sidebar-chat-text"><a href="">Chat</a></div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <a href="#">
                        <img src={Icons.console} alt="cute-girl" />
                    </a>
                </div>
                <div id="sidebar-game-text">
                    <a href="#">Game</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <a href="#">
                        <img src={Icons.channels} alt="cute-girl" />
                    </a>
                </div>
                <div id="sidebar-channels-text">
                    <a href="#">Channels</a>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
