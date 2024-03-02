import HomeSection from './HomeSection.jsx';
import DescriptionCard from './DescriptionCard.jsx';
import {CTASection, FooterSection} from './CtaFooterSections.jsx';
import TeamSection from './TeamSection.jsx';

import './LandingPage.css'

const Description = [
	{
		id: 1,
		title: "Play, Chat, Compete!",
		text: "Our website offers an immersive and interactive experience for ping pong enthusiasts of all skill levels. With a sleek user interface designed for seamless navigation, users can engage in exhilarating matches and tournaments, all from the comfort of their own device. Additionally, our integrated chat feature allows users to communicate in real-time, fostering a sense of community and enabling players to strategize and coordinate matches effortlessly."
	},
	{
		id: 2,
		title: "Speed, Strategy, Skill!",
		text: "Ping pong, also known as table tennis, is a fast-paced and dynamic sport enjoyed by millions worldwide. Played on a table divided by a net, participants use small paddles to volley a lightweight ball back and forth, aiming to score points by landing the ball within the opposing player's half of the table. Renowned for its quick reflexes, agility, and precision, ping pong offers a thrilling blend of athleticism and strategy. Whether played recreationally for leisure or competitively at the highest levels, ping pong is a sport that promotes physical fitness, mental acuity, and above all, enjoyment."
	}
]

const LandingPage = () => {
	return (
		<div className="page">
			<div id="Home"> <HomeSection></HomeSection> </div>
			<div id="About">
				<h1>About</h1>
				<div className='AboutCards'>
					{
						Description.map((e) => (
						<DescriptionCard key={e.id} title={e.title} text={e.text}></DescriptionCard>
						)
					)}
				</div>
			</div>
			<div id="Team"> <TeamSection></TeamSection> </div>
			<div> <CTASection></CTASection> </div>
			<div> <FooterSection></FooterSection> </div>
		</div>
	)
}

export default LandingPage;