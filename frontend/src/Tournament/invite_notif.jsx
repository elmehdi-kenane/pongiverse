import styles from '../assets/Tournament/tournament.module.css'

function InviteNotif(props)
{
	return(
		<div className={styles["notif"]} key={props.key}>
			<p className={styles["invite-notif-text"]}><b>{props.user}</b> invited you to a tournament</p>
			<div className={styles["invite-notif-buttons"]}>
				<button className={styles["invite-notif-button-accept"]} onClick={props.handleAccept}>accept</button>
				<button className={styles["invite-notif-button-deny"]} onClick={props.handleDeny}>deny</button>
			</div>
		</div>
	);

}
export default InviteNotif