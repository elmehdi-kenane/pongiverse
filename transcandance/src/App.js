import Navbar from './Navbar';
import * as Icons from './icons';
import { useEffect, useState } from 'react';

function App() {
    const [expand, setExpand] = new useState(false);
    const [profileDropDownisOpen, setProfileDropDownisOpen] = new useState(false);
    const [notificationsDropDownisOpen, setNotificationsDropDownisOpen] = new useState(false);
    const [sidebarIsOpen, setSidebarIsOpen] = new useState(false);
    const [searchbar, setSearchBar] = new useState(false);
    const [notifications, setNotifications] = new useState([]);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          setSidebarIsOpen(false);
          setSearchBar(false);
        }
    });

    const profileHandleDropDown = () => {
        if (notificationsDropDownisOpen)
            setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
        setProfileDropDownisOpen(!profileDropDownisOpen);
        console.log("in the profile handler", notificationsDropDownisOpen, profileDropDownisOpen);
    };
    
    const notificationsHandleDropDown = () => {
        if (profileDropDownisOpen)
            setProfileDropDownisOpen(!profileDropDownisOpen);
        setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
        console.log("in the notifications handler", notificationsDropDownisOpen, profileDropDownisOpen);
    };

    const handleExapandSidebar = () => {
        setSidebarIsOpen(!sidebarIsOpen)
    }

  return (
    <div className="page">
        <Navbar
            profileDropDownisOpen={profileDropDownisOpen}
            setProfileDropDownisOpen={setProfileDropDownisOpen}
            notificationsDropDownisOpen={notificationsDropDownisOpen}
            setNotificationsDropDownisOpen={setNotificationsDropDownisOpen}
            notifications={notifications}
            setNotifications={setNotifications}
            Icons={Icons}
            profileHandleDropDown={profileHandleDropDown}
            notificationsHandleDropDown={notificationsHandleDropDown}
            handleExapandSidebar={handleExapandSidebar}
            searchbar={searchbar}
            setSearchBar={setSearchBar}
        />
        <div className="sidebar">
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <a href="#">
                        <img src={Icons.dashboard} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-dashboard-text">
                    <a href="#">Dashboard</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <a href="#">
                        <img src={Icons.friends} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-friends-text">
                    <a href="#">Friends</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <a href="#">
                        <img src={Icons.chat} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-chat-text"><a href="">Chat</a></div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <a href="#">
                        <img src={Icons.console} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-game-text">
                    <a href="#">Game</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <a href="#">
                        <img src={Icons.channels} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-channels-text">
                    <a href="#">Channels</a>
                </div>
            </div>
        </div>
        <div className="sidebar-mobile" style={{display:sidebarIsOpen ? "flex":"none"}}>
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <a href="#">
                        <img src={Icons.dashboard} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-dashboard-text">
                    <a href="#">Dashboard</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <a href="#">
                        <img src={Icons.friends} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-friends-text">
                    <a href="#">Friends</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <a href="#">
                        <img src={Icons.chat} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-chat-text"><a href="">Chat</a></div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <a href="#">
                        <img src={Icons.console} alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-game-text">
                    <a href="#">Game</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <a href="#">
                        <img src={Icons.channels} alt="cute-girl"/>
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
