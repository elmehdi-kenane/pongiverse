import { Link } from 'react-router-dom';

const CTASection = () => {
	return (
		<div className="ctaLandingPage">
			<div className="cta-textLandingPage">
				<div> Play now and level up your ping pong game! </div>
				<div> Join Ping Pong Palace for matches, tournaments, and chat with enthusiasts. </div>
			</div>
            <button className="signUpBtnLandingPage"> <Link to="/signup">Let's play!</Link> </button>
		</div>
	)
}

export default CTASection;