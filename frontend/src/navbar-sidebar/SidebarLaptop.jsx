import { Link } from "react-router-dom";

function SidebarLaptop({ Icons }) {
    return (
        <div className="sidebar">
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <Link to={'/mainpage/dashboard'}>
                        <img src={Icons.dashboard} alt="Dashboard-logo"/>
                    </Link>
                </div>
                <div id="sidebar-dashboard-text">
                    <Link to={'/mainpage/dashboard'}>Dashboard</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <Link to={'/mainpage/friends'}>
                        <img src={Icons.friends} alt="friends-logo"/>
                    </Link>
                </div>
                <div id="sidebar-friends-text">
                    <Link to={'/mainpage/friends'}>Friends</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <Link to={'/mainpage/chat'}>
                        <img src={Icons.chat} alt="chat-logo"/>
                    </Link>
                </div>
                <div id="sidebar-chat-text">
                    <Link to={'/mainpage/chat'}>Chat</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <Link to={'/mainpage/game'}>
                        <img src={Icons.console} alt="console-logo"/>
                    </Link>
                </div>
                <div id="sidebar-game-text">
                    <Link to={'/mainpage/game'}>Game</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <Link to={'/mainpage/groups'}>
                        <img src={Icons.channels} alt="channels-logo"/>
                    </Link>
                </div>
                <div id="sidebar-channels-text">
                    <Link to={'/mainpage/groups'}>Channels</Link>
                </div>
            </div>
        </div>
    );
}
 
export default SidebarLaptop;