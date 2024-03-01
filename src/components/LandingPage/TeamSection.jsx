import EkenanePicture from '../../assets/EkenanePicture.svg';
import IdabligiPicture from '../../assets/IdabligiPicture.svg';
import AagouzoulPicture from '../../assets/AagouzouPicture.svg';

import TeamCard from './TeamCard.jsx';

const Team = [
	{
		id:	1,
		FullName: "El Mehdi Kenane",
		PictureProfile: EkenanePicture,
		GithubLink: "https://github.com/elmehdi-kenane",
		LinkedinLink: "https://profile.intra.42.fr/users/ekenane", // replace it with linkedin link of el mehdi kenane
	}
	,{
		id:	2,
		FullName: "Imad Dabligi",
		PictureProfile: IdabligiPicture,
		GithubLink: "https://github.com/IMADDABLIGI",
		LinkedinLink: "https://www.linkedin.com/in/imad-dabligi-015071236/",
	}
	,{
		id:	3,
		FullName: "Abdellah Agouzoul",
		PictureProfile: AagouzoulPicture,
	}
]

const TeamSection = () => {
	return (
		<div className='Team'>
			<h1>Team</h1>
			<div className="TeamList">
				{
					Team.map((member) => (
						<TeamCard key={member.id} picture={member.PictureProfile} name={member.FullName} GithubLink={member.GithubLink} LinkedinLink={member.LinkedinLink}></TeamCard>
					)
				)}
			</div>
		</div>
	)
}

export default TeamSection;