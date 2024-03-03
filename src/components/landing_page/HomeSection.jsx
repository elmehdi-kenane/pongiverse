import PingLogo from '../../assets/PingLogo.svg';
import twoRacketsDrawing from '../../assets/landing_page/two-rackets-drawing.svg';

const HomeSection = () => {
	const handleLogoClick = () => {
        window.location.reload();
    };

	return (
			<div className="home">
				<div className="navbar">
					<img src={PingLogo} alt="logo" className="PingLogo" onClick={handleLogoClick}/>
					<div className="sections">
						<a href="#Home"> <button className="sections-btns"> Home </button> </a>
						<a href="#About"> <button className="sections-btns"> About </button> </a>
						<a href="#Team"> <button className="sections-btns"> Team </button> </a>
					</div>
					<a href="login"> <button className="login-btn"> Login </button> </a>
				</div>
				<div className="header">
					<div className="header-text">
						<div className="title">
							Smash Your Way to Victory, Where Every Point Counts!
						</div>
						<div className="sub-title">
							<div> Play, Compete, Win! </div>
							<div> Join global ping pong matches for endless fun and competition. </div>
							<div> Ready to smash your way to victory? </div>
						</div>
						<button className="sign-up-btn"> Sign up </button>
					</div>
					<img src={twoRacketsDrawing} alt="two-rackets-drawing.svg" className="header-img" />
				</div>
			</div>
	)
}

export default HomeSection;