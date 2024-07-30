import { useState, useEffect, useContext, useRef } from "react";
import styles from '../../assets/Tournament/tournament.module.css'
import avatar from '../avatar.svg'
import clock from '../clock.svg'
import invitefriend from '../friend_invite.svg'
import AuthContext from '../../navbar-sidebar/Authcontext'
import withReactContent from 'sweetalert2-react-content'
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';


function CreateTournament() {
	const [open, setOpen] = useState(false);
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [inviteButton, setInviteButton] = useState(true)
	const [tournamentId, setTournamentId] = useState(0)
	const [tournamentMembers, setTournamentMembers] = useState([])
	const [membersImages, setMemberImages] = useState([])
	const navigate = useNavigate()
	const location = useLocation()
	const { user, userImages, allGameFriends, socket, setAllGameFriends , publicCheckAuth } = useContext(AuthContext)
	const allGameFriendsRef = useRef(allGameFriends);
	const divRef = useRef(null);
	const divRef2 = useRef(null);
	const inviteRef = useRef(null);
	const inviteRef2 = useRef(null);
	const isOpen = () => {
		setOpen(!open);
	}

	// useEffect(() => {
	//   publicCheckAuth()
	// }, [])

	const handleInviteClick = (name) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'invite-friend',
				message: {
					user: user,
					invited: name,
					tournament_id: tournamentId
				}
			}))
		}
	};

	const Destroy_tournament = () => {
		Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes, Destroy it!",
		}).then((result) => {
			if (result.isConfirmed) {
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify({
						type: 'destroy-tournament',
						message: {
							tournament_id: tournamentId,
							user: user
						}
					}))
				}
			}
		});
	}
	useEffect(() => {
		allGameFriendsRef.current = allGameFriends;
	}, [allGameFriends]);

	useEffect(() => {
		const get_members = async () => {
			const response = await fetch(`http://localhost:8000/api/tournament-members`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				const allMembers = data.allMembers
				if (data.is_owner === 'yes')
					setIsTournamentOwner(true)
				console.log(data)
				setTournamentId(data.tournament_id)
				setTournamentMembers(allMembers)
				const fetchImages = async () => {
					const promises = allMembers.map(async (user) => {
						const response = await fetch(`http://localhost:8000/api/getImage`, {
							method: "POST",
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								image: user.image
							})
						});
						const blob = await response.blob();
						return URL.createObjectURL(blob);
					});
					const images = await Promise.all(promises);
					setMemberImages(images)
				};
				fetchImages()
			} else {
				console.error('Failed to fetch data');
			}
		}
		const set_is_inside = async () => {
			const response = await fetch(`http://localhost:8000/api/set-is-inside`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: user,
					is_inside: true
				})
			})
		}

		const check_is_join = async () => {
			const response = await fetch(`http://localhost:8000/api/is-joining-tournament`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				if (data.Case === 'yes')
					get_members()
				else
					navigate("../game")
			} else {
				console.error('Failed to fetch data');
			}
		}
		const check_is_started_and_not_finished = async () => {
			const response = await fetch(`http://localhost:8000/api/is-started-and-not-finshed`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				if (data.Case === 'yes')
					navigate('../game/tournamentbracket');
				else
					check_is_join()
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (user) {
			check_is_started_and_not_finished()
			set_is_inside()
		}
	}, [user])

	useEffect(() => {
		const fetchImages = async () => {
			const promises = tournamentMembers.map(async (user) => {
				const response = await fetch(`http://localhost:8000/api/getImage`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						image: user.image
					})
				});
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			});
			const images = await Promise.all(promises);
			setMemberImages(images)
		};
		if (tournamentMembers)
			fetchImages()
	}, [tournamentMembers])

	useEffect(() => {
		const get_member = async (username) => {
			const response = await fetch(`http://localhost:8000/api/get-tournament-member`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: username
				})
			});
			if (response.ok) {
				const data = await response.json();
				console.log(" haha data :", data)
				const newUser = { 'id': data.id, 'name': data.name, 'level': data.level, 'image': data.image }
				setTournamentMembers((prevTournamentMembers) => [...prevTournamentMembers, newUser]);
				setTournamentMembers((prevTournamentMembers) => {
					if (!prevTournamentMembers.some(member => member.name === newUser.name)) {
						return [...prevTournamentMembers, newUser];
					}
					return prevTournamentMembers;
				});
				const fetchImages = async (user_image) => {
					const response = await fetch(`http://localhost:8000/api/getImage`, {
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							image: user_image
						})
					});
					const blob = await response.blob();
					const image = URL.createObjectURL(blob);
					setMemberImages((prevMemberImages) => [...prevMemberImages, image]);
				};
				fetchImages(data.image)
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				console.log("DATA RECEIVED:", data)
				if (type === 'user_disconnected') {
					const currentAllGameFriends = allGameFriendsRef.current;
					console.log("user disconnected : ", allGameFriends)
					let uname = data.message.user
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname))
					setTournamentMembers(prevMembers => prevMembers.map(member => member.name === uname ? { ...member, 'is_online': false } : member));
				} else if (type === 'connected_again_tourn') {
					setTournamentMembers(prevMembers => prevMembers.map(member => member.name === message.user ? { ...member, 'is_online': true } : member));
				} else if (type === 'connected_again') {
					const currentAllGameFriends = allGameFriendsRef.current;
					const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
					if (!userExists)
						setAllGameFriends([...currentAllGameFriends, message.userInfos])
				} else if (type === 'accepted_invitation') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let username = data.message.user
					if (username !== user) {
						get_member(data.message.user)
						setAllGameFriends(currentAllGameFriends.filter(user => user.name !== data.message.user))
					}
				} else if (type === 'user_kicked_out') {
					let kicked = data.message.kicked
					setTournamentMembers((prevMembers) =>
						prevMembers.filter((member) => member.name !== kicked));
				} else if (type === 'leave_tournament') {
					let kicked = data.message.kicked
					const currentAllGameFriends = allGameFriendsRef.current;
					setTournamentMembers((prevMembers) =>
						prevMembers.filter((member) => member.name !== kicked));
					setAllGameFriends([...currentAllGameFriends, message.userInfos])
					if (kicked === user) {
						navigate("/mainpage/game")
					}
				} else if (type === 'tournament_destroyed') {
					navigate("/mainpage/game")
				} else if (type === 'friend_created_tournament') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let userInfos = message.userInfos
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== userInfos.name))
				} else if (type === 'friend_distroyed_tournament') {
					const currentAllGameFriends = allGameFriendsRef.current;
					const userExists = currentAllGameFriends.some(friend => friend.name === message.userInfos.name)
					if (!userExists)
						setAllGameFriends([...currentAllGameFriends, message.userInfos])
				} else if (type === 'tournament_started') {
					console.log("YESSS")
					if (socket && socket.readyState === WebSocket.OPEN) {
						socket.send(JSON.stringify({
							type: 'Round-16-timer',
						}))
					}
					navigate('../game/tournamentbracket');
				}
			}
		}

	}, [socket])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'tournament-member-loged-again',
				message: {
					user: user
				}
			}))
		}
	}, [socket])

	// useEffect(() =>{
	// 	const is_tournament_advanced = async () =>{
	// 		const response = await fetch(`http://localhost:8000/api/is-tournament-advanced`, {
	// 			method: "POST",
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 			body: JSON.stringify({
	// 				tournament_id: tournamentId
	// 			})
	// 		});
	// 		if (response.ok) {
	// 			const data = await response.json();
	// 			if (data.Case === 'tournament_advanced')
	// 				navigate("../game/tournamentbracket")
	// 		} else {
	// 			console.error('Failed to fetch data');
	// 		}
	// 	}
	// 	is_tournament_advanced()

	// },[user, tournamentId])
	const handleKick = (username) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'kick-player-out',
				message: {
					user: user,
					kicked: username,
					tournament_id: tournamentId
				}
			}))
		}
	}

	const LeaveTournament = () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'leave-tournament',
				message: {
					kicked: user,
					tournament_id: tournamentId
				}
			}))
		}
	}

	const handleStart = () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'start-tournament',
				message: {
					user: user,
					tournament_id: tournamentId
				}
			}))
		}
	}

	const username = user

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.composedPath().includes(inviteRef.current) && !event.composedPath().includes(divRef.current) && !event.composedPath().includes(inviteRef2.current) && !event.composedPath().includes(divRef2.current)) {
				setOpen(false)
			}
		};
		document.body.addEventListener('click', handleClickOutside);
		return () => {
			document.body.removeEventListener('click', handleClickOutside);
		};

	}, [])

	const InviteFriendComp = (props) => {
		return (
			<div className={styles[props.class]} ref={props.refs}>
				{/* <h3 className={styles["pop-up-title"]}></h3> */}
				{
					allGameFriends.length > 0 && allGameFriends.map((user, key) => {
						if (user.name !== username) {
							return (
								<div key={user.id} className={styles["friend"]}>
									<div className={styles["friend-data"]}>
										<img className={styles["friend-avatar"]} src={userImages[key]} alt="" />
										<div className={styles["friend-name-and-status"]}>
											<h3 className={styles["friend-name"]}>{user.name}</h3>
											<h3 className={styles["friend-status"]}>online</h3>
										</div>
									</div>
									{inviteButton && <img className={styles["friend-invite-button"]} src={invitefriend} alt="" onClick={() => handleInviteClick(user.name)} />}
								</div>
							);
						}
					})
				}
			</div>
		);
	}
	return (
		<>
			<div className={styles["tournament-page"]}>
				<div className={styles["tournament-page-content"]}>
					<div className={styles["title-and-destroy"]}>
						<h1 className={styles["tournament-title"]}>Tournament Creation</h1>
						{
							isTournamentOwner &&
							<button className={styles["destroy-button"]} onClick={Destroy_tournament}>Destroy</button>
						}
					</div>
					<div className={styles["line"]}></div>
					<div className={styles["tournament-infos"]}>
						{
							isTournamentOwner &&
							<>
								<div className={styles["tournament-id"]}>
									<h4 className={styles["tournament-id-title"]}>Tournament ID:</h4>
									<h5 className={styles["tournament-id-value"]}>{tournamentId}</h5>
								</div>
								<div className={styles["little-line"]}></div>
							</>
						}
						<div className={styles["players-number"]}>
							<h4 className={styles["players-number-title"]}>Players:</h4>
							<h5 className={styles["players-number-value"]}>{tournamentMembers.length}/16</h5>
						</div>
					</div >
					{
						isTournamentOwner ?
							<div className={styles["up-buttons"]}>
								<button className={styles["up-button"]} onClick={isOpen} ref={inviteRef2}>Invite Friend</button>
								{
									tournamentMembers.length > 0 ? <button className={styles["up-button"]} onClick={handleStart}>Start</button> : <button className={styles["up-button-disabled"]} onClick={handleStart} disabled>Start</button>
								}
							</div>
							: <div className={styles["up-buttons"]}>
								<button className={styles["up-button"]} onClick={LeaveTournament}>Leave</button>
							</div>
					}
					<div className={styles["tournament-members"]}>
						{
							tournamentMembers.length >= 1 ? (<div className={styles["player"]}>
								{
									tournamentMembers[0].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[0].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[0]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[0].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[0].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 2 ? (<div className={styles["player"]}>
								{
									tournamentMembers[1].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[1].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[1]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[1].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[1].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 3 ? (<div className={styles["player"]}>
								{
									tournamentMembers[2].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[2].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[2]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[2].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[2].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 4 ? (<div className={styles["player"]}>
								{
									tournamentMembers[3].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[3].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[3]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[3].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[3].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 5 ? (<div className={styles["player"]}>
								{
									tournamentMembers[4].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[4].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[4]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[4].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[4].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 6 ? (<div className={styles["player"]}>
								{
									tournamentMembers[5].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[5].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[5]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[5].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[5].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 7 ? (<div className={styles["player"]}>
								{
									tournamentMembers[6].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[6].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[6]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[6].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[6].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 8 ? (<div className={styles["player"]}>
								{
									tournamentMembers[7].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[7].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[7]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[7].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[7].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 9 ? (<div className={styles["player"]}>
								{
									tournamentMembers[8].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[8].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[8]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[8].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[8].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 10 ? (<div className={styles["player"]}>
								{
									tournamentMembers[9].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[9].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[9]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[9].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[9].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 11 ? (<div className={styles["player"]}>
								{
									tournamentMembers[10].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[10].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[10]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[10].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[10].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 12 ? (<div className={styles["player"]}>
								{
									tournamentMembers[11].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[11].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[11]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[11].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[11].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 13 ? (<div className={styles["player"]}>
								{
									tournamentMembers[12].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[12].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[12]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[12].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[12].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 14 ? (<div className={styles["player"]}>
								{
									tournamentMembers[13].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[13].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[13]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[13].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[13].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 15 ? (<div className={styles["player"]}>
								{
									tournamentMembers[14].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{

											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[14].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[14]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[14].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[14].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
						{
							tournamentMembers.length >= 16 ? (<div className={styles["player"]}>
								{
									tournamentMembers[15].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[15].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={membersImages[15]} alt="" />
								</div>
								<div className={styles["user-info"]}>
									<h4 className={styles["user-info-name"]}>{tournamentMembers[15].name}</h4>
									<h5 className={styles["user-info-level"]}>Level {tournamentMembers[15].level}</h5>
								</div>
							</div>) : (<div className={styles["player"]}>
								<div className={styles["user-avatar"]}>
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
							</div>)
						}
					</div>
					{
						isTournamentOwner ?
							<>
								<div className={styles["buttons"]}>
									<div className={styles["down-popup-button"]}>
										{open && <InviteFriendComp class="Invite-friend-popup-down" refs={divRef} />}
										<button className={styles["button"]} onClick={isOpen} ref={inviteRef}>Invite Friend</button>
									</div>
									{
										tournamentMembers.length > 0 ? <button className={styles["button"]} onClick={handleStart}>Start</button> : <button className={styles["button-disabled"]} onClick={handleStart} disabled>Start</button>
									}
								</div>
								{open && <InviteFriendComp class="Invite-friend-popup-up" refs={divRef2} />}
							</> :
							<div className={styles["down-buttons"]}>
								<button className={styles["down-button"]} onClick={LeaveTournament}>Leave</button>
							</div>
					}
				</div>
			</div>
		</>
	);
}
export default CreateTournament
//check number of memebrs
