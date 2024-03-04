import Sidebar from "./Sidebar.jsx";

import PingLogo from '../../assets/PingLogo.svg';
import twoRacketsDrawing from '../../assets/landing_page/two-rackets-drawing.svg';

const HomeSection = () => {
  return (
    <div className="home" id="Home">
      <div className="navbar">
        <img src={PingLogo} alt="logo" className="pingLogo" />
        <div className="sections">
          <a href="#Home">
            <button className="sectionsBtns"> Home </button>
          </a>
          <a href="#About">
            <button className="sectionsBtns"> About </button>
          </a>
          <a href="#Team">
            <button className="sectionsBtns"> Team </button>
          </a>
        </div>
        <a href="login">   
          <button className="loginbBtn"> Login </button>
        </a>
        <Sidebar></Sidebar>
      </div>
      <div className="header">
        <div className="headerText">
          <div className="title">
            Smash Your Way to Victory, Where Every Point Counts!
          </div>
          <div className="subTitle">
            <div> Play, Compete, Win! </div>
            <div>
              
              Join global ping pong matches for endless fun and competition.
            </div>
            <div> Ready to smash your way to victory? </div>
          </div>
          <button className="signUpBtn"> Sign up </button>
        </div>
        <img
          src={twoRacketsDrawing}
          alt="two-rackets-drawing.svg"
          className="header-img"
        />
      </div>
    </div>
  );
};

export default HomeSection;