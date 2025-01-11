import { useState, useEffect, useContext, useRef } from "react";
import styles from '../../assets/Tournament/tournament.module.css'
import avatar from '../avatar.svg'
import clock from '../clock.svg'
import invitefriend from '../friend_invite.svg'
import AuthContext from '../../navbar-sidebar/Authcontext'
import withReactContent from 'sweetalert2-react-content'
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import * as Icons from '../../assets/navbar-sidebar'


function CreateTournament() {
	const [open, setOpen] = useState(false);
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [inviteButton, setInviteButton] = useState(true)
	const [tournamentId, setTournamentId] = useState(0)
	const [tournamentMembers, setTournamentMembers] = useState([])
	const navigate = useNavigate()
	const location = useLocation()
	const [isAnyUserOffline, setIsAnyUserOffline] = useState(false)
	const { user, userImages, allGameFriends, socket, notifSocket, setAllGameFriends, setChatNotificationCounter, addNotificationToList, notifications,
		setNotifications, } = useContext(AuthContext)
	const allGameFriendsRef = useRef(allGameFriends);
	const divRef = useRef(null);
	const divRef2 = useRef(null);
	const inviteRef = useRef(null);
	const inviteRef2 = useRef(null);
	const isOpen = () => {
		setOpen(!open);
	}

	useEffect(() => {
		if (tournamentMembers.some(user => !user.is_online) === true)
			setIsAnyUserOffline(true)
		else
			setIsAnyUserOffline(false)
	}, [tournamentMembers])


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

	const copyTournamentId = () => {
		navigator.clipboard.writeText(tournamentId).then(
			() => {
				toast.success('Tournament Id copied successfuly', {
					position: 'top-center',
					duration: 1000,
				});
			},
			(err) => {
				console.error('Failed to copy: ', err);
			}
		);
	}

	const Destroy_tournament = () => {
		Swal.fire({
			title: "Are you sure?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes, Destroy it!",
			customClass: {
				popup: styles['destroy-popup'],
				title: styles['destroy-popup-title'],
			}
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
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/tournament-members`, {
				method: "POST",
				credentials: "include",
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
				setTournamentId(data.tournament_id)
				setTournamentMembers(allMembers)
			} else {
				navigate("/signin")
			}
		}


		const check_is_join = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/is-joining-tournament`, {
				method: "POST",
				credentials: "include",
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
				navigate("/signin")
			}
		}
		const check_is_started_and_not_finished = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/is-started-and-not-finshed`, {
				method: "POST",
				credentials: "include",
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
				navigate("/signin")
			}
		}
		if (user && socket) {
			check_is_started_and_not_finished()
		}
	}, [user, socket])

	useEffect(() => {
		const get_member = async (username) => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/get-tournament-member`, {
				method: "POST",
				credentials: "include",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: username
				})
			});
			if (response.ok) {
				const data = await response.json();
				const newUser = { 'id': data.id, 'name': data.name, 'level': data.level, 'image': data.image, 'background_image': data.background_image, 'is_online': data.is_online }
				////console.log("NEW USERRR:", newUser)
				setTournamentMembers((prevTournamentMembers) => [...prevTournamentMembers, newUser]);
				setTournamentMembers((prevTournamentMembers) => {
					if (!prevTournamentMembers.some(member => member.name === newUser.name)) {
						return [...prevTournamentMembers, newUser];
					}
					return prevTournamentMembers;
				});
			} else {
				navigate("/signin")
			}
		}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'user_kicked_out') {
					let kicked = data.message.kicked
					setTournamentMembers((prevMembers) =>
						prevMembers.filter((member) => member.name !== kicked));
				} else if (type === 'leave_tournament') {
					let kicked = data.message.kicked
					let is_a_friend = data.message.is_a_friend
					const currentAllGameFriends = allGameFriendsRef.current;
					setTournamentMembers((prevMembers) =>
						prevMembers.filter((member) => member.name !== kicked));
					if (is_a_friend === true) {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.userInfos.name)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}

					if (kicked === user) {
						navigate("/mainpage/game")
					}
				} else if (type === 'user_leave_tournament') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let is_a_friend = data.message.is_a_friend
					if (is_a_friend === true) {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.userInfos.name)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
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
					let tournament_id = data.message.tournament_id
					if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
						notifSocket.send(JSON.stringify({
							type: 'Round-16-timer',
							message: {
								tournament_id: tournament_id,
								user: user
							}
						}))
					}
					navigate('../game/tournamentbracket');
				} else if (type === 'accepted_invitation') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let username = data.message.user
					console.log("****ACCEPTEDDDD:", username);
					if (username !== user) {
						get_member(data.message.user)
						setAllGameFriends(currentAllGameFriends.filter(user => user.name !== data.message.user))
					}
				} else if (type === 'playingStatus') {
					////console.log("*****WAS HEEEEEREE")
					if (data.message.is_playing === false) {
						const currentAllGameFriends = allGameFriendsRef.current;
						const userExists = currentAllGameFriends.some(friend => friend.name === message.userInfos.name)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
					else {
						const currentAllGameFriends = allGameFriendsRef.current;
						let username = message.user
						setAllGameFriends(currentAllGameFriends.filter(user => user.name !== username))
					}
				} else if (type === 'hmed') {
					socket.close()
				} else if (type === 'blocked-friend' || type === 'remove-friendship') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let username = message.second_username
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== username))
				}
			}
		}

	}, [socket])


	useEffect(() => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'user_disconnected') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let uname = data.message.user
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname))
					setTournamentMembers(prevMembers => prevMembers.map(member => member.name === uname ? { ...member, 'is_online': false } : member));
				} else if (type === 'connected_again_tourn') {
					////console.log("ENTER TO USER CONNECTED AGAIN TOUR")
					setTournamentMembers(prevMembers => prevMembers.map(member => member.name === message.user ? { ...member, 'is_online': true } : member));
				} else if (type === 'connected_again') {
					////console.log("****IS A FRIEND:", message.is_a_friend);
					const currentAllGameFriends = allGameFriendsRef.current;
					////console.log("*******IWA YAHAMIIIIID:", message.user)
					if (message.is_a_friend === true) {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
				} else if (type === 'tournament_destroyed') {
					navigate("/mainpage/game")
				} else if (type === 'user_join_tournament') {
					////console.log("ENTER TO USER JOIN TOURNAMENT")
					const currentAllGameFriends = allGameFriendsRef.current;
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== message.user))
				} else if (type === "chatNotificationCounter") {
					setChatNotificationCounter(data.count);
				} else if (type === "receive-friend-request") {
					addNotificationToList({
						notificationText: `${message.second_username} sent you a friend request`,
						urlRedirection: "friendship",
						avatar: message.avatar,
						notifications: notifications,
						setNotifications: setNotifications,
						user: user,
					});
				}
			}
		}
	}, [notifSocket])

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
		if (tournamentMembers.some(user => !user.is_online) === true) {
			toast.error('there is an unready player', {
				position: 'top-center',
				duration: 2000,
			});
		} else {
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
				{
					allGameFriends.length > 0 && allGameFriends.map((user, key) => {
						if (user.name !== username) {
							return (
								<div key={user.id} className={styles["friend"]}>
									<div className={styles["friend-data"]}>
										<img className={styles["friend-avatar"]} src={user.image} alt="" />
										<div className={styles["friend-name-and-status"]}>
											<h3 className={styles["friend-name"]}>{user.name}</h3>
											<h3 className={styles["friend-status"]}>level {user.level}</h3>
										</div>
									</div>
									<div className={styles["friend-invite-button-div"]} onClick={() => handleInviteClick(user.name)}>
										<img className={styles["friend-invite-button-img"]} src={Icons.console} />
										<p className={styles["friend-invite-button-p"]}>Invite</p>
									</div>
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
				<Toaster />
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
									<div className={styles["tournament-id-value-and-icon"]}>
										<h5 className={styles["tournament-id-value"]} onClick={copyTournamentId}>{tournamentId}</h5>
										<ContentCopyIcon onClick={copyTournamentId} />
									</div>
								</div>
								<div className={styles["little-line"]}></div>
							</>
						}
						<div className={styles["players-number"]}>
							<h4 className={styles["players-number-title"]}>Players:</h4>
							<h5 className={styles["players-number-value"]}>{tournamentMembers.length}/8</h5>
						</div>
					</div >
					{
						isTournamentOwner ?
							<div className={styles["up-buttons"]}>
								<button className={styles["up-button"]} onClick={isOpen} ref={inviteRef2}>Invite Friend</button>
								{
									tournamentMembers.length === 8 && isAnyUserOffline === false ? <button className={styles["up-button"]} onClick={handleStart}>Start</button> : <button className={styles["up-button-disabled"]} disabled>Start</button>
								}
							</div>
							: <div className={styles["up-buttons"]}>
								<button className={styles["up-button"]} onClick={LeaveTournament}>Leave</button>
							</div>
					}
					<div className={styles["tournament-members"]}>
						{
							tournamentMembers.length >= 1 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[0].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[0].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[0].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[0].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[0].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[0].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 2 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[1].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[1].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[1].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[1].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[1].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[1].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 3 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[2].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[2].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[2].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[2].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[2].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[2].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 4 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[3].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[3].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[3].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[3].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[3].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[3].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 5 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[4].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[4].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[4].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[4].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[4].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[4].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 6 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[5].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[5].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[5].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[5].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[5].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[5].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 7 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[6].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[6].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[6].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[6].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[6].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[6].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
								</div>
							</div>)
						}

						{
							tournamentMembers.length >= 8 ? (<div className={styles["player"]} style={{
								backgroundImage: `url(${tournamentMembers[7].background_image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
								{
									tournamentMembers[7].is_online === false &&
									<div className={styles["disconnected-div"]}>
										<p>diconnected</p>
										{
											isTournamentOwner && <button className={styles["disconnected-button"]} onClick={() => handleKick(tournamentMembers[7].name)}>Kick out</button>
										}
									</div>
								}
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={tournamentMembers[7].image} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{tournamentMembers[7].name}</h4>
										<h6 className={styles["user-info-level"]}>level {tournamentMembers[7].level}</h6>
									</div>
								</div>
							</div>) : (<div className={styles["player-empty"]}>
								<div className={styles["user-avatar-empty"]}>
									<img className={styles["avatar-empty"]} src={avatar} alt="" />
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
										tournamentMembers.length === 8 && isAnyUserOffline === false ? <button className={styles["button"]} onClick={handleStart}>Start</button> : <button className={styles["button-disabled"]} disabled>Start</button>
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
