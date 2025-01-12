import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { trimStringWithEllipsis } from "../GameNotif/GameNotifications";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
	let navigate = useNavigate();
	let location = useLocation();
	const [allGameFriends, setAllGameFriends] = useState([]);
	const [userImages, setUserImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [userLevel, setUserLevel] = useState(null)
	// const [gameNotif, setGameNotif] = useState(false)
	let [user, setUser] = useState("");
	let [userImg, setUserImg] = useState("");
	let [socket, setSocket] = useState(null);
	let socketRef = useRef(socket);
	let [socketRecreated, setSocketRecreated] = useState(false);
	let [allGameNotifs, setAllGameNotifs] = useState([]);
	let [notifsImgs, setNotifsImgs] = useState([]);
	// let allGameFriendsRef = useRef(allGameFriends);
	const [isBlur, setIsBlur] = useState(false);
	//chat socket ------------------------------------
	let [chatSocket, setChatSocket] = useState(null);

	// Glass Background State --------------------------------------------
	const [isGlass, setIsGlass] = useState(false);

	// Imad's States --------------------------------------------
	//-- Glass Background
	const [isReport, setIsReport] = useState(false);
	const [isBlock, setIsBlock] = useState(false);
	const [isGameStats, setIsGameStats] = useState(false);

	const reportContentRef = useRef(null);
	const blockRef = useRef(null);
	const blockContentRef = useRef(null);

	let [notifSocket, setNotifSocket] = useState(null);

	let [hideNavSideBar, setHideNavSideBar] = useState(false);
	let [gameCustomize, setGameCustomize] = useState([
		"#FFFFFF",
		"#C100BA",
		"#5241AB",
		false,
	]);
	const oneVsOneIdRegex = /^\/mainpage\/play\/1vs1\/\d+$/;
	const twoVsTwoIdRegex = /^\/mainpage\/play\/2vs2\/\d+$/;
	const gamePlayRegex = /^\/mainpage\/(game|play)(\/[\w\d-]*)*$/;
	const gameRegex = /^\/mainpage\/game(\/[\w\d-]*)*$/;
	const checkPrivateAuthRegex = /^\/mainpage(?:\/.*|$)/;

	// Chat Notification and Chat Room Invitation States --------------------------------------------
	const [chatRoomInvitationsCounter, setChatRoomInvitationsCounter] =
		useState(0);
	const [chatNotificationCounter, setChatNotificationCounter] = useState(0);
	const RoomsInvitationRef = useRef(null);
	const chatNotificationRef = useRef(null);
	const [notifications, setNotifications] = useState([]);
	const [isNotificationsRead, setIsNotificationsRead] = useState();

	useEffect(() => {
		RoomsInvitationRef.current = chatRoomInvitationsCounter;
	}, [chatRoomInvitationsCounter]);

	useEffect(() => {
		chatNotificationRef.current = chatNotificationCounter;
	}, [chatNotificationCounter]);

	// Glass Background Effect
	useEffect(() => {
		if (!isReport && !isBlock && !isGameStats && !isBlur) setIsGlass(false);
		else setIsGlass(true);
	}, [isReport, isBlock, isGameStats, isBlur]);

	useEffect(() => {
		socketRef.current = socket
	}, [socket])

	useEffect(() => {
		if (checkPrivateAuthRegex.test(location.pathname))
			privateCheckAuth();
		else if (
			location.pathname === "/signup" ||
			location.pathname === "/signin" ||
			location.pathname === "/SecondStep" ||
			location.pathname === "/WaysSecondStep" ||
			location.pathname === "/ForgotPassword" ||
			location.pathname === "/ChangePassword"
		)
			publicCheckAuth();
		else if (/^\/$/.test(location.pathname) || location.pathname === '/localtournamentbracket' 
		|| location.pathname === '/localtournamentfillmembers' || location.pathname === '/localmodes' 
		|| location.pathname === '/1vs1/offline') {}
		else
			navigate("/Error404");

	}, [location.pathname])

	useEffect(() => {
		const getAllGameFriends = async () => {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/onlineFriends`,
					{
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user: user,
						}),
					}
				);
				if (response.status === 401)
					navigate('/signin')
				let friends = await response.json();
				if (friends.message.length) setAllGameFriends(friends.message);
				setLoading(false);
			} catch (e) {
				////console.log("something wrong with fetch");
			}
		};


		const getAllNotifsFriends = async () => {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/notifsFriends`,
					{
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user: user,
						}),
					}
				);
				if (response.status === 401)
					navigate('/signin')
				let friends = await response.json();
				////console.log("*****Friends: ", friends)
				setAllGameNotifs(friends.message);
			} catch (e) {
				////console.log("something wrong with fetch");
			}
		};

		const getUserImage = async () => {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/getUserImage`,
					{
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user: user,
						}),
					}
				);
				if (response.status === 401)
					navigate('/signin')
                let data = await response.json()
				setUserImg(data.image);
			} catch (e) {
				////console.log("something wrong with fetch");
			}
		};

		const getGameCustomize = async () => {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/getCustomizeGame`,
					{
						credentials: "include",
					}
				);
				if (response.status === 401)
					navigate('/signin')
				const res = await response.json();
				if (res.data) setGameCustomize(res.data);
			} catch (e) {
				////console.log("something wrong with fetch");
			}
		};

		if (
			location.pathname !== "/" &&
			location.pathname !== "/signup" &&
			location.pathname !== "/signin" &&
			location.pathname !== "/SecondStep" &&
			location.pathname !== "/WaysSecondStep" &&
			location.pathname !== "/ForgotPassword" &&
			location.pathname !== "/ChangePassword" &&
			user
		)
			getAllNotifsFriends();
		// else
		// 	setAllGameNotifs([])

		if (
			(location.pathname === "/mainpage/game/solo/1vs1/friends" ||
				location.pathname === "/mainpage/game/createtournament" ||
				location.pathname === "/mainpage/game/solo/2vs2/friends") &&
			user
		)
			getAllGameFriends();
		else setAllGameFriends([]);

		if (
			location.pathname !== "/" &&
			location.pathname !== "/signup" &&
			location.pathname !== "/signin" &&
			location.pathname !== "/SecondStep" &&
			location.pathname !== "/WaysSecondStep" &&
			location.pathname !== "/ForgotPassword" &&
			location.pathname !== "/ChangePassword" &&
			user &&
			!userImg
		)
			getUserImage();

		if (
			(location.pathname === "/mainpage/game/board" ||
				oneVsOneIdRegex.test(location.pathname) ||
				twoVsTwoIdRegex.test(location.pathname)) &&
			user
		)
			getGameCustomize();

		if (
			oneVsOneIdRegex.test(location.pathname) ||
			twoVsTwoIdRegex.test(location.pathname) ||
			location.pathname === "/mainpage/game/solo/computer"
		)
			setHideNavSideBar(true);
		else setHideNavSideBar(false);
	}, [location.pathname, user]);

	useEffect(() => {
		const check_is_in_game = async () => {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/check_is_in_game`,
					{
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user: user,
						}),
					}
				);
				if (response.status === 401)
					navigate('/signin')
				let data = await response.json();
				if (!data.error) {
					(data.mode === 'tournament') ?
						navigate('mainpage/game/createtournament') :
						((data.mode === '1vs1') && (location.pathname !== '/mainpage/game/solo/1vs1/random' &&
						location.pathname !== '/mainpage/game/solo/1vs1/friends' &&
						location.pathname !== '/mainpage/game/solo/1vs1/create-or-join')) ?
						navigate(`/mainpage/play/1vs1/${data.id}`) :
						((data.mode === '2vs2') && ((location.pathname !== '/mainpage/game/solo/2vs2/random' &&
						location.pathname !== '/mainpage/game/solo/2vs2/friends' &&
						location.pathname !== '/mainpage/game/solo/2vs2/create-or-join'))) ?
						navigate(`/mainpage/play/2vs2/${data.id}`) : ''
				}
			} catch (error) {
				console.error(
					"There has been a problem with your fetch operation:",
					error
				);
			}
		}
		if (socket && user && (location.pathname === '/mainpage/game/solo' ||
			location.pathname === '/mainpage/game/solo/1vs1' ||
			location.pathname === '/mainpage/game/solo/1vs1/random' ||
			location.pathname === '/mainpage/game/solo/1vs1/friends' ||
			location.pathname === '/mainpage/game/solo/1vs1/create-or-join' ||
			location.pathname === '/mainpage/game/solo/2vs2' ||
			location.pathname === '/mainpage/game/solo/2vs2/random' ||
			location.pathname === '/mainpage/game/solo/2vs2/friends' ||
			location.pathname === '/mainpage/game/solo/2vs2/create-or-join' ||
			location.pathname === '/mainpage/game/jointournament' ||
			location.pathname === '/mainpage/game'))
			check_is_in_game()
	}, [location.pathname, user, socket])

	const addNotificationToList = ({
		avatar,
		notificationText,
		urlRedirection,
		notifications,
		setNotifications,
		user,
	}) => {
		const addNewNotification = async () => {
			const response = await fetch(
				`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
				}:${import.meta.env.VITE_PORT}/navBar/add_notification/`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						notification_text: notificationText,
						url_redirection: urlRedirection,
						username: user,
						avatar: avatar,
					}),
				}
			);
			if (response.status === 401)
				navigate('/signin')
			const res = await response.json();
			//   if (res) setFriendSuggestions(res);
		};
		if (user) {
			addNewNotification();
			const newNotification = {
				notification_text: trimStringWithEllipsis(notificationText),
				url_redirection: urlRedirection,
				send_at: new Date().toISOString(),
				avatar: avatar,
			};
			setNotifications([newNotification, ...notifications]);
			setIsNotificationsRead(false);
		}
	};

	useEffect(() => {
		const addUser = (newUser, currentAllGameFriends) => {
			const userExists = currentAllGameFriends.some(
				(user) => user.name === newUser.name
			);
			if (!userExists) setAllGameFriends([...currentAllGameFriends, newUser]);
		};
		async function sendUserData(uname, currentAllGameFriends) {
			try {
				let response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/get_user`,
					{
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							uname: uname,
						}),
					}
				);
				if (response.status === 401)
					navigate('/signin')
				let data = await response.json();
				const newUser = {
					id: data.id,
					name: data.name,
					level: data.level,
					image: data.image,
				};
				addUser(newUser, currentAllGameFriends);
			} catch (error) {
				console.error(
					"There has been a problem with your fetch operation:",
					error
				);
			}
		}
		if (
			location.pathname !== "/" &&
			location.pathname !== "/signup" &&
			location.pathname !== "/signin" &&
			location.pathname !== "/SecondStep" &&
			location.pathname !== "/WaysSecondStep" &&
			location.pathname !== "/ForgotPassword" &&
			location.pathname !== "/ChangePassword" &&
			!notifSocket &&
			user
		) {
			const newNotifSocket = new WebSocket(
				`${import.meta.env.VITE_SOCKET}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/ws/notif-socket`
			);
			newNotifSocket.onopen = () => {
				setNotifSocket(newNotifSocket);
				////console.log("NOTIF SOCKET OPENED SUCCEFULLY");
			};
			newNotifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data);
				////console.log("NOTIF SOCKET MESSAGE TYPE: ", data.type);
			};
		} else if (
			(location.pathname === "/" ||
				location.pathname === "/signup" ||
				location.pathname === "/signin" ||
				location.pathname === "/SecondStep" ||
				location.pathname === "/WaysSecondStep" ||
				location.pathname === "/ForgotPassword" ||
				location.pathname === "/ChangePassword") &&
			notifSocket
		) {
			if (notifSocket) {
				////console.log("NOTIF SOCKET CLOSED SUCCEFULLY");
				notifSocket.close();
				setNotifSocket(null);
			}
		}
		if (gamePlayRegex.test(location.pathname) && !socket && user) {
			const newSocket = new WebSocket(
				`${import.meta.env.VITE_SOCKET}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/ws/socket-server`
			);
			newSocket.onopen = () => {
				setSocket(newSocket);
				console.log("GAME SOCKET OPENED SUCCEFULLY");
			};
			newSocket.onclose = () => {
				console.log("GAME SOCKET CLOSED SUCCEFULLY FROM THE BACK");
			};
			newSocket.onerror = () => {
				console.log("GAME SOCKET ERROR HAPPENED");
			};
		} else if (!gamePlayRegex.test(location.pathname) && socket) {
			if (socket) {
				console.log("GAME SOCKET CLOSED SUCCEFULLY");
				socket.close();
				setSocket(null);
			}
		}
		if (
			(location.pathname === "/mainpage/chat" ||
				location.pathname === "/mainpage/groups") &&
			!chatSocket &&
			user
		) {
			const newChatSocket = new WebSocket(
				`${import.meta.env.VITE_SOCKET}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/ws/chat_socket`
			);
			newChatSocket.onopen = () => {
				setChatSocket(newChatSocket);
			};
		} else if (
			location.pathname !== "/mainpage/chat" &&
			location.pathname !== "/mainpage/groups"
		) {
			if (chatSocket) {
				////console.log("CHAT SOCKET CLOSED SUCCEFULLY");
				chatSocket.close();
				setChatSocket(null);
			}
		}
		////console.log("LOCATION PATHNAME: ", location.pathname);
	}, [location.pathname, user]);


	useEffect(() => {
		const set_is_inside = async (flag) => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/set-is-inside`, {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: user,
					is_inside: flag
				})
			})
			if (response.status === 401) {
				navigate('/signin')
			}
		}
		if (user) {
			if (location.pathname !== "/mainpage/game/createtournament" && location.pathname !== "/mainpage/game/tournamentbracket")
				set_is_inside(false)
			else
				set_is_inside(true)
		}
	}, [user, location.pathname])


	useEffect(() => {
		const getUnrecievedRoomInvitee = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
					}:${import.meta.env.VITE_PORT}/chatAPI/unrecievedRoomInvitee`,
					{
						credentials: "include",
					}
				);
				const data = await response.json();
				if (response.ok) {
					setChatRoomInvitationsCounter(data.count);
				} else if (response.status === 401)
					navigate('/signin')
				else {
					////console.log("Error in getting unrecieved room invitee");
				}
			} catch (error) {
				console.error(
					"There has been a problem with your fetch operation:",
					error
				);
			}
		};
		const getUnreadConversations = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
					}:${import.meta.env.VITE_PORT}/chatAPI/unreadConversations`, {
					credentials: "include",
				}
				);
				if (response.status === 401)
					navigate('/signin')
				const data = await response.json();
				if (response.ok) {
					setChatNotificationCounter(data.count);
				}
				else {
					////console.log("Error in getting unread conversations");
				}
			} catch (error) {
				console.error(
					"There has been a problem with your fetch operation:",
					error
				);
			}
		};
		if (user && location.pathname !== "/mainpage/groups") {
			getUnrecievedRoomInvitee();
		}
		if (user && location.pathname !== "/mainpage/chat") {
			getUnreadConversations();
		}
	}, [user]);


	async function publicCheckAuth() {
		try {
			let response = await fetch(
				`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/verifytoken/`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			if (response.status === 401)
				navigate('/signin')
			response = await response.json();
			if (response.Case !== "Invalid token") {
				setUser(response.data.username);
				setUserLevel(response.level);
				navigate("/mainpage/dashboard");
			} else {
				setUser("");
				setUserLevel(null);
			}
		} catch (e) {
			////console.log("something wrong with fetch");
		}
	}

	async function privateCheckAuth() {
		try {
			let response = await fetch(
				`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/verifytoken/`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			response = await response.json();
			if (response.Case !== "Invalid token") {
				setUser(response.data.username);
				setUserLevel(response.level);
			} else {
				////console.log("FAILD TO LOGIN SUCCESSFULY");
				setUser("");
				setUserLevel(null);
				navigate("/signin");
			}
		} catch (e) {
			////console.log("something wrong with fetch: ", e);
		}
	}

	let contextData = {
		user: user,
		userLevel: userLevel,
		setUser: setUser,
		publicCheckAuth: publicCheckAuth,
		privateCheckAuth: privateCheckAuth,
		socket: socket,
		setSocket: setSocket,
		socketRef: socketRef,
		socketRecreated: socketRecreated,
		setSocketRecreated: setSocketRecreated,
		userImg: userImg,
		setUserImg: setUserImg,
		allGameFriends: allGameFriends,
		setAllGameFriends: setAllGameFriends,
		loading: loading,
		userImages: userImages,
		setAllGameNotifs: setAllGameNotifs,
		addNotificationToList: addNotificationToList,
		notifications: notifications,
		isNotificationsRead: isNotificationsRead,
		setNotifications: setNotifications,
		setIsNotificationsRead: setIsNotificationsRead,
		allGameNotifs: allGameNotifs,
		notifsImgs: notifsImgs,
		gameCustomize: gameCustomize,
		hideNavSideBar: hideNavSideBar,
		// Profile Settings
		isGlass: isGlass,
		setIsGlass: setIsGlass,
		isReport: isReport,
		setIsReport: setIsReport,
		reportContentRef: reportContentRef,
		isBlock: isBlock,
		setIsBlock: setIsBlock,
		isGameStats: isGameStats,
		setIsGameStats: setIsGameStats,
		blockRef: blockRef,
		blockContentRef: blockContentRef,
		// chat blur
		isBlur: isBlur,
		setIsBlur: setIsBlur,
		notifSocket: notifSocket,
		// gameNotif: gameNotif
		//chat socket
		chatSocket: chatSocket,
		setChatSocket: setChatSocket,
		// Chat Notification and Chat Room Invitation States
		chatRoomInvitationsCounter: chatRoomInvitationsCounter,
		setChatRoomInvitationsCounter: setChatRoomInvitationsCounter,
		chatNotificationCounter: chatNotificationCounter,
		setChatNotificationCounter: setChatNotificationCounter,
		RoomsInvitationRef: RoomsInvitationRef,
		chatNotificationRef: chatNotificationRef,
	};

	return (
		<AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
	);
};
