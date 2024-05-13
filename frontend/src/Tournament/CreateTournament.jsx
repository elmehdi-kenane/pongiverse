import { useRef, useState, useEffect } from "react";
import styles from '../assets/Tournament/tournament.module.css'
import avatar from './cross.png'
import av from './avatar.jpeg'
import invitefriend from './friend_invite.svg'

function CreateTournament()
{
	const [open, setOpen] = useState(false);
	const isOpen = () =>{
		setOpen(!open);
	}

	const InviteFriendComp = (props) =>
	{
		return(
			<div className={styles[props.class]}>
				<h3 className={styles["pop-up-title"]}></h3>
				<div className={styles["friend"]}>
					<div className={styles["friend-data"]}>
						<img className={styles["friend-avatar"]} src={av} alt="" />
						<div className={styles["friend-name-and-status"]}>
							<h3 className={styles["friend-name"]}>rennacir</h3>
							<h3 className={styles["friend-status"]}>online</h3>
							
						</div>
					</div>
				<img className={styles["friend-invite-button"]} src={invitefriend} alt="" />
				</div>
				<div className={styles["friend"]}>
					<div className={styles["friend-data"]}>
						<img className={styles["friend-avatar"]} src={av} alt="" />
						<div className={styles["friend-name-and-status"]}>
							<h3 className={styles["friend-name"]}>rennacir</h3>
							<h3 className={styles["friend-status"]}>online</h3>
							
						</div>
					</div>
				<img className={styles["friend-invite-button"]} src={invitefriend} alt="" />
				</div>
				<div className={styles["friend"]}>
					<div className={styles["friend-data"]}>
						<img className={styles["friend-avatar"]} src={av} alt="" />
						<div className={styles["friend-name-and-status"]}>
							<h3 className={styles["friend-name"]}>rennacir</h3>
							<h3 className={styles["friend-status"]}>online</h3>
							
						</div>
					</div>
				<img className={styles["friend-invite-button"]} src={invitefriend} alt="" />
				</div>
			</div>
		);
	}
	return(
		<>
			<div className={styles["tournament-page"]}>
				<div className={styles["tournament-page-content"]}>
					<h1 className={styles["tournament-title"]}>Tournament Creation</h1>
					<div className={styles["line"]}></div>
					<div className={styles["tournament-infos"]}>
						<div className={styles["tournament-id"]}>
							<h4 className={styles["tournament-id-title"]}>Tournament ID:</h4>
							<h5 className={styles["tournament-id-value"]}>1111111111</h5>
						</div>
						<div className={styles["little-line"]}></div>
						<div className={styles["players-number"]}>
							<h4 className={styles["players-number-title"]}>Players:</h4>
							<h5 className={styles["players-number-value"]}>1/16</h5>
						</div>
					</div >
					<div className={styles["up-buttons"]}>
							<button className={styles["up-button"]} onClick={isOpen}>Invite Friend</button>
						<button className={styles["up-button"]}>Next</button>
					</div>
					<div className={styles["tournament-members"]}>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
						<div className={styles["player"]}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>mmaqbour</h4>
								<h5 className={styles["user-info-level"]}>Level 6</h5>
							</div>
						</div>
					</div>
					<div className={styles["buttons"]}>
						<div className={styles["down-popup-button"]}>
							{open && <InviteFriendComp class="Invite-friend-popup-down"/>}
							<button className={styles["button"]} onClick={isOpen}>Invite Friend</button>
						</div>
						<button className={styles["button"]}>Next</button>
					</div>
					{open && <InviteFriendComp class="Invite-friend-popup-up"/>}
				</div>
			</div>
		</>
	);
}

export default CreateTournament