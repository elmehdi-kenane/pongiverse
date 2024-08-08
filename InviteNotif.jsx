
const [notifications, setNotifications] = useState([])



const handleAccept = async (tournament_id) => {
	const response = await fetch(`http://localhost:8000/api/get-tournament-size`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			tournament_id: tournament_id
		})
	});
	if (response.ok) {
		const data = await response.json();
		if (data.Case === 'Tournament_started'){
			Swal.fire({
				icon: "warning",
				position: "top-end",
				title: "Tournament is already started",
				showConfirmButton: false,
				customClass: {
					popup: styles['error-container'] ,
					title: styles['title-swal'],
				},
				timer: 1500
			});
		}else if (data.Case === 'Tournament_is_full'){
			Swal.fire({
				icon: "warning",
				position: "top-end",
				title: "Tournament is full",
				showConfirmButton: false,
				customClass: {
					popup: styles['error-container'] ,
					title: styles['title-swal'],
				},
				timer: 1500
			});
		} else {
			if (socket && socket.readyState === WebSocket.OPEN) {
			  try {
				await socket.send(
				  JSON.stringify({
					type: 'accept-tournament-invitation',
					message: {
					  user: user,
					  tournament_id: tournament_id
					}
				  })
				);
			  } catch (error) {
				console.error("Error sending message:", error);
			  }
			}
		  }
};

const handleDeny = (sender, tournament_id) => {
	setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif.sender !== sender));
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({
			type: 'deny-tournament-invitation',
			message: {
				user: user,
				sender: sender,
				tournament_id: tournament_id
			}
		}))
	}

}

useEffect(() => {
	const getNotifications = async () => {
		const response = await fetch(`http://localhost:8000/api/get-notifications`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: user,
			})
		})
		const res = await response.json()
		console.log("reskh :", res.notifications)
		setNotifications(res.notifications)
		console.log("RESSS :", res)
	}
	if (user)
		getNotifications()
}, [user])

useEffect(() => {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.onmessage = (event) => {
			let data = JSON.parse(event.data)
			let type = data.type
			if (type === 'invited_to_tournament') {
				console.log("YOU HAVE BEEN INVITED BY " + data.message.user + " TO TOURNAMENT N: ", data.message.tournament_id)
				const notif = { 'sender': data.message.user, 'tournament_id': data.message.tournament_id }
				setNotifications((prevNotifications) => [...prevNotifications, notif]);
			}
			else if (type == 'accepted_invitation') {
				navigate("/mainpage/game/createtournament");
			}
		}
	}
}, [socket])


<div className={styles["notifications"]}>
				{
					notifications.length > 0 && notifications.map((user, key) => {
						return (
							<div className={styles["notif"]} key={key}>
								<p className={styles["invite-notif-text"]}><b>{user.sender}</b> invited you to a tournament</p>
								<div className={styles["invite-notif-buttons"]}>
									<button className={styles["invite-notif-button-accept"]} onClick={() => handleAccept(user.tournament_id)}>accept</button>
									<button className={styles["invite-notif-button-deny"]} onClick={() => handleDeny(user.sender, user.tournament_id)}>deny</button>
								</div>
							</div>
						)
					})
				}
</div>