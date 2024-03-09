import EkenanePicture from '../../assets/landing_page/EkenanePicture.svg';
import IdabligiPicture from '../../assets/landing_page/IdabligiPicture.svg';
import AagouzoulPicture from '../../assets/landing_page/AagouzouPicture.svg';
import RennacirPicture from '../../assets/landing_page/RennacirPicture.svg';
import MmaqbourPicture from '../../assets/landing_page/MmaqbourPicture.svg';

import TeamCard from './TeamCard.jsx';

const Team = [
	{
		id:	1,
		FullName: "El Mehdi Kenane",
		PictureProfile: EkenanePicture,
		GithubLink: "https://github.com/elmehdi-kenane",
		LinkedinLink: "https://profile.intra.42.fr/users/ekenane",
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
	,{
		id:	4,
		FullName: "Rida Ennaciri",
		PictureProfile: RennacirPicture,
		GithubLink: "https://github.com/ennaciririda",
		LinkedinLink: "https://www.linkedin.com/in/rida-ennaciri-89782b19a/",
	}
	,{
		id:	5,
		FullName: "Mohamed Maqbour",
		PictureProfile: MmaqbourPicture,
		GithubLink: "https://github.com/MohamedMQ",
		LinkedinLink: "https://www.linkedin.com/in/mohamed-maqbour-65792a233/",
	}
]

const TeamSection = () => {
	return (
		<div className='team' id='Team'>
			<h1 className="title">Team</h1>
			<div className="teamList">
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