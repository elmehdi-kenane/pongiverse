import { Link } from "react-router-dom";

function SidebarLaptop({ Icons }) {
    return (
        <div className="sidebar">
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div className="sidebar-icons">
                    <Link to="dashboard">
                        <img src={Icons.dashboard} alt="Dashboard-logo"/>
                    </Link>
                </div>
                <div className="sidebar-titles">
                    <Link to="dashboard">Dashboard</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div className="sidebar-icons">
                    <Link to="friends">
                        <img src={Icons.friends} alt="friends-logo"/>
                    </Link>
                </div>
                <div className="sidebar-titles">
                    <Link to="friends">Friends</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div className="sidebar-icons">
                    <Link to="chat">
                        <img src={Icons.chat} alt="chat-logo"/>
                    </Link>
                </div>
                <div className="sidebar-titles">
                    <Link to="chat">Chat</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div className="sidebar-icons">
                    <Link to="game">
                        <img src={Icons.console} alt="console-logo"/>
                    </Link>
                </div>
                <div className="sidebar-titles">
                    <Link to="game">Game</Link>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div className="sidebar-icons">
                    <Link to="groups">
                        <img src={Icons.channels} alt="channels-logo"/>
                    </Link>
                </div>
                <div className="sidebar-titles">
                    <Link to="groups">Channels</Link>
                </div>
            </div>
            {/* <div className="sidebar-navigations" id="none"></div> */}
        </div>
    );
}
 
export default SidebarLaptop;