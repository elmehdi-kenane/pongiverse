

function App() {
  return (
    <div className="page">
        <div className="sidebar">
            <div className="sidebar-navigations" id="sidebar-popup">
                <div id="sidebar-popup-image">
                    <a href="#">
                        <img src={images.manu.default} alt="cute-girl"/>
                    </a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-dashboard">
                <div id="sidebar-dashboard-image">
                    <a href="#">
                        <img src="./images/Dashboard2.svg" alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-dashboard-text">
                    <a href="#">Dasboard</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="sidebar-friends">
                <div id="sidebar-friends-image">
                    <a href="#">
                        <img src="./images/profile.svg" alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-friends-text">
                    <a href="#">Friends</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="chat">
                <div id="sidebar-chat-image">
                    <a href="#">
                        <img src="./images/chat.svg" alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-chat-text"><a href="">Chat</a></div>
            </div>
            <div className="sidebar-navigations" id="game">
                <div id="sidebar-game-image">
                    <a href="#">
                        <img src="./images/game.svg" alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-game-text">
                    <a href="#">Game</a>
                </div>
            </div>
            <div className="sidebar-navigations" id="channels">
                <div id="sidebar-channels-image">
                    <a href="#">
                        <img src="./images/channels.svg" alt="cute-girl"/>
                    </a>
                </div>
                <div id="sidebar-channels-text">
                    <a href="#">Channels</a>
                </div>
            </div>
        </div>
        <div className="navbar">
            <div className="logo">
                <img src="./images/logoPingPong.svg" alt="ping pong"/>
            </div>
            <div className="search-bar">
                <input type="text" placeholder="Search"></input>
            </div>
            <div className="profile-notifications">
                <div id="notifications-icon">
                    <a href="#">
                    <img src="./images/notification.svg" alt="notifications-icon"/>
                    </a>
                </div>
                <div id="profile-icon">
                    <a href="#">
                        <img src="./images/profile-pic.svg" alt=""/>
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
