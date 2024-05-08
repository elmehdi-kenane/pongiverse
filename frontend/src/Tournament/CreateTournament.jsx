import { useState } from "react";
import styles from '../assets/Tournament/tournament.module.css'
import avatar from './cross.png'

function CreateTournament()
{
	return(
		<div className={styles["full_page"]}>
			<h1 className={styles["title"]}>Tournament Creation</h1>
			<div className={styles["line"]}></div>
			<div className={styles["tournament-infos"]}>
				<div className={styles["id"]}>
					<h4 className={styles["h4-title"]}>Tournament ID:</h4>
					<h5 className={styles["h5-title"]}>1111111111</h5>
				</div>
				<div className={styles["little-line"]}></div>
				<div className={styles["players-number"]}>
					<h4 className={styles["h4-title"]}>Players:</h4>
					<h5 className={styles["h5-title"]}>6/16</h5>
				</div>
			</div>
			<div className={styles["up-buttons"]}>
				<button className={styles["up-button"]}>Invite Friend</button>
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
				<button className={styles["button"]}>Invite Friend</button>
				<button className={styles["button"]}>Next</button>
			</div>
		</div>
	);
}

export default CreateTournament