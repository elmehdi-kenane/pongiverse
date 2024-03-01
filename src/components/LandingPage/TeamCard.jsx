import GithubIcon from '../../assets/github-icon.svg';
import LinkedinIcon from '../../assets/linkedin-icon.svg';

const TeamCard = ({picture, name, GithubLink, LinkedinLink}) => {
	return (
		<div className="TeamCard">
			<img src={picture} alt="profile"/>
			{name}
			<span>
				<a href={GithubLink} target="_blank" rel="noopener noreferrer">
						{/* rel="noopener noreferrer" attribute for security reasons.
						This attribute prevents potential security vulnerabilities
						by ensuring that the new tab does not have access to the window.opener property
						and does not pass referrer information to the linked document. */}
							<img src={GithubIcon} alt="github"/>
				</a>
				<a href={LinkedinLink} target="_blank" rel="noopener noreferrer">
					<img src={LinkedinIcon} alt="linkedin"/>
				</a>
			</span>
		</div>
	)
}

export default TeamCard;