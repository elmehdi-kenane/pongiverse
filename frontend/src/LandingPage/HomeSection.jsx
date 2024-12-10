import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import ThreejsObj from "./ThreejsObj.jsx";

import PingLogo from "../assets/LandingPage/PingLogo.svg";
import arrow1 from "../assets/LandingPage/arrow1.svg";
import arrow2 from "../assets/LandingPage/arrow2.svg";

const HomeSection = () => {
  const navigate = useNavigate()

  const playOfflineModes = () => {
    navigate("/localmodes")
  }

  return (
    <div className="homeLandingPage" id="Home">
      <div className="navbarBgLandingPage">
        <div className="navbarLandingPage">
          <img src={PingLogo} alt="logo" className="pingLogo" />
          <div className="sectionsLandingPage">
            <a href="#Home" className="sectionsBtnsLandingPage">
              Home
            </a>
            <a href="#About" className="sectionsBtnsLandingPage">
              About
            </a>
            <a href="#Team" className="sectionsBtnsLandingPage">
              Team
            </a>
          </div>
          <Link to="/signin" href="login" className="loginBtnLandingPage">
            Login
          </Link>
          <Sidebar></Sidebar>
        </div>
      </div>
      <div className="threeDObjectAtTop">
        <ThreejsObj></ThreejsObj>
      </div>
      <div className="headerLandingPage">
        <div className="headerTextLandingPage">
          <div className="titleLandingPage">
            Smash Your Way to Victory, Where Every Point Counts!
          </div>
          <div className="subTitleLandingPage">
            <div> Play, Compete, Win! </div>
            <div>
              Join global ping pong matches for endless fun and competition.
            </div>
            <div> Ready to smash your way to victory? </div>
          </div>
          <button className="signUpBtnLandingPage">
            {" "}
            <Link to="/signup">Sign up</Link>{" "}
          </button>
        </div>
        <div className="threeDObjectAtRight">
          <ThreejsObj></ThreejsObj>
        </div>
      </div>
      <div className="PlayLocalGame">
        <img
          src={arrow1}
          alt="arrow"
          width={50}
          height={50}
          className="arrow1"
        />
        <button className="localGameBtn" onClick={playOfflineModes}>Try A Local Game 🏓</button>
        <img
          src={arrow2}
          alt="arrow"
          width={50}
          height={50}
          className="arrow2"
        />
      </div>
    </div>
  );
};

export default HomeSection;
