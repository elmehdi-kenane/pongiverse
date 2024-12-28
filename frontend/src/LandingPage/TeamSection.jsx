import EkenanePicture from '../assets/LandingPage/EkenanePicture.svg';
import IdabligiPicture from '../assets/LandingPage/IdabligiPicture.svg';
import AagouzoulPicture from '../assets/LandingPage/AagouzouPicture.svg';
import RennacirPicture from '../assets/LandingPage/RennacirPicture.svg';
import MmaqbourPicture from '../assets/LandingPage/MmaqbourPicture.svg';

import TeamCard from './TeamCard.jsx';

const Team = [
  {
    id: 1,
    FullName: "El Mehdi Kenâne",
    PictureProfile: EkenanePicture,
    GithubLink: "https://github.com/elmehdi-kenane",
    LinkedinLink: "https://www.linkedin.com/in/el-mehdi-ken%C3%A2ne-b32036329/",
  },
  {
    id: 2,
    FullName: "Imad Dabligi",
    PictureProfile: IdabligiPicture,
    GithubLink: "https://github.com/IMADDABLIGI",
    LinkedinLink: "https://www.linkedin.com/in/imad-dabligi-015071236/",
  },
  {
    id: 3,
    FullName: "Abdellah Agouzoul",
    PictureProfile: AagouzoulPicture,
    GithubLink: "https://github.com/a-agouzou",
    LinkedinLink: "https://ma.linkedin.com/in/aagouzou",
  },
  {
    id: 4,
    FullName: "Rida Ennaciri",
    PictureProfile: RennacirPicture,
    GithubLink: "https://github.com/ennaciririda",
    LinkedinLink: "https://www.linkedin.com/in/rida-ennaciri-89782b19a/",
  },
  {
    id: 5,
    FullName: "Mohamed Maqbour",
    PictureProfile: MmaqbourPicture,
    GithubLink: "https://github.com/MohamedMQ",
    LinkedinLink: "https://www.linkedin.com/in/mohamed-maqbour-65792a233/",
  },
];

const TeamSection = () => {
	return (
		<div className='teamLandingPage' id='Team'>
            <h1 className="titleLandingPage">Team</h1>
			<div className="teamListLandingPage">
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