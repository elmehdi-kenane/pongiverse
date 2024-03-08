function SidebarLaptop({ Icons }) {
    return (
        <div className="sidebar">
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <a href="#">
                        <img src={Icons.dashboard} alt="Dashboard-logo"/>
                    </a>
                </div>
                <div id="sidebar-dashboard-text">
                    <a href="#">Dashboard</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <a href="#">
                        <img src={Icons.friends} alt="friends-logo"/>
                    </a>
                </div>
                <div id="sidebar-friends-text">
                    <a href="#">Friends</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <a href="#">
                        <img src={Icons.chat} alt="chat-logo"/>
                    </a>
                </div>
                <div id="sidebar-chat-text"><a href="">Chat</a></div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <a href="#">
                        <img src={Icons.console} alt="console-logo"/>
                    </a>
                </div>
                <div id="sidebar-game-text">
                    <a href="#">Game</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <a href="#">
                        <img src={Icons.channels} alt="channels-logo"/>
                    </a>
                </div>
                <div id="sidebar-channels-text">
                    <a href="#">Channels</a>
                </div>
            </div>
        </div>
    );
}
 
export default SidebarLaptop;