import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import ThreejsObj from "./ThreejsObj.jsx";

import PingLogo from "../assets/LandingPage/PingLogo.svg";
import arrow1 from "../assets/LandingPage/arrow1.svg";
import arrow2 from "../assets/LandingPage/arrow2.svg";
import { useEffect, useState } from "react";

const HomeSection = () => {
	const navigate = useNavigate()
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	const playOfflineModes = () => {
		navigate("/localmodes")
	}

	const navigateToLogin = () => {
		if (isAuthenticated)
			navigate("/mainpage/dashboard");
		else
			navigate("/signin")
	}

	async function check_auth() {
		try {
			let response = await fetch(
				`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/verifytoken/`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			response = await response.json();
			if (response.Case !== "Invalid token") {
				setIsAuthenticated(true)
			} else {
				setIsAuthenticated(false)
			}
		} catch (e) {
			////console.log("something wrong with fetch");
		}
	}

	useEffect(() => {
		check_auth()
	}, [])

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
					<button className="loginBtnLandingPage" onClick={navigateToLogin}>{!isAuthenticated ? 'Login' : 'Home'}</button>
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
					{
						!isAuthenticated &&
					<button className="signUpBtnLandingPage">
						{" "}
						<Link to="/signup">Sign up</Link>{" "}
					</button>
					}
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
