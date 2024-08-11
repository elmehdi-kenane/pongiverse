import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import { Navigate} from 'react-router-dom'
import { friends } from "../assets/navbar-sidebar";
import * as Icons from '../assets/navbar-sidebar'
import { useReducer } from "react";

import userPc from "../Settings/assets/Group.svg"

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
	let navigate = useNavigate()
	let location = useLocation()
	const [allGameFriends, setAllGameFriends] = useState([])
	const [userImages, setUserImages] = useState([]);
	const [loading, setLoading] = useState(true)
	// const [gameNotif, setGameNotif] = useState(false)
	let [user, setUser] = useState('')
	let [userImg, setUserImg] = useState('')
	let [socket, setSocket] = useState(null)
	let [socketRecreated, setSocketRecreated] = useState(false)
	let [allGameNotifs, setAllGameNotifs] = useState([])
	let [notifsImgs, setNotifsImgs] = useState([])
	let allGameFriendsRef = useRef(allGameFriends)
	let [isBlur, setIsBlur] = useState(false)

	
	// Glass Background State --------------------------------------------
	const [isGlass, setIsGlass] = useState(false);
	
	// Imad's States --------------------------------------------
	//-- Glass Background
	const [isReport, setIsReport] = useState(false);
	const [isBlock, setIsBlock] = useState(false);
	const [isChatBlur, setIsChartBlur] = useState(false);

	const [reportValue, setReportValue] = useState(null);
	const reportContentRef = useRef(null);
	const blockRef = useRef(null);
	const blockContentRef = useRef(null);
	

	const [userPic, setUserPic] = useState(userPc);
	const [nickName, setNickName] = useState("Maverick");
	const [bio, setBio] = useState("Lorem ipsum dolor sit amet consectetur adipisicing elit.");
	const [country, setCountry] = useState("Morocco");

	let [notifSocket, setNotifSocket] = useState(null)

	let [hideNavSideBar, setHideNavSideBar] = useState(false)
	let [gameCustomize, setGameCustomize] = useState(['#FFFFFF', '#1C00C3', '#5241AB', false])
	const oneVsOneIdRegex = /^\/mainpage\/play\/1vs1\/\d+$/
	const twoVsTwoIdRegex = /^\/mainpage\/play\/2vs2\/\d+$/
	const gamePlayRegex = /^\/mainpage\/(game|play)(\/[\w\d-]*)*$/


	// Glass Background Effect
	useEffect (()=> {
		if (!isReport && !isBlock && !isBlur)
			setIsGlass(false);
		else
			setIsGlass(true);
	}, [isReport, isBlock])

	useEffect(() => {
		allGameFriendsRef.current = allGameFriends;
	}, [allGameFriends]);

	useEffect(() => {
		const fetchImages = async () => {
			const promises = allGameFriends.map(async (user) => {
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
			setUserImages(images);
		};
		if (allGameFriends) {
			let loadingImage = []
			for (let i = 0; i < allGameFriends.length; i++)
				loadingImage.push(Icons.solidGrey)
			setUserImages(loadingImage)
			fetchImages()
		}
	}, [allGameFriends])

	useEffect(() => {
		const fetchNotifsImages = async () => {
			const promises = allGameNotifs.map(async (user) => {
				const response = await fetch(`http://localhost:8000/api/getImage`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						image: user.avatar
					})
				});
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			});
			const images = await Promise.all(promises);
			setNotifsImgs(images);
		};
		if (allGameFriends)
			fetchNotifsImages()
	}, [allGameNotifs])

	useEffect(() => {
		const getAllGameFriends = async () => {
			try {
				let response = await fetch('http://localhost:8000/api/onlineFriends', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user: user
					})
				})
				let friends = await response.json()
				if (friends.message.length)
					setAllGameFriends(friends.message)
				setLoading(false)
			} catch (e) {
				console.log("something wrong with fetch")
			}
		}

		const getAllNotifsFriends = async () => {
			try {
				let response = await fetch('http://localhost:8000/api/notifsFriends', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user: user
					})
				})
				let friends = await response.json()
				if (friends.message.length) {
					console.log(friends.message)
					setAllGameNotifs(friends.message)
				}
			} catch (e) {
				console.log("something wrong with fetch")
			}
		}

		const getUserImage = async () => {
			try {
				let response = await fetch('http://localhost:8000/api/getUserImage', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user: user
					})
				})
				const blob = await response.blob();
				const image = URL.createObjectURL(blob)
				setUserImg(image)
			} catch (e) {
				console.log("something wrong with fetch")
			}
		}
		
		const getGameCustomize = async () => {
			try {
				let response = await fetch('http://localhost:8000/api/getCustomizeGame', {
					credentials: 'include'
				})
				const res = await response.json()
				console.log(res)
				if (res.data)
					setGameCustomize(res.data)
			} catch (e) {
				console.log("something wrong with fetch")
			}
		}

		if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && user && !allGameNotifs.length)
			getAllNotifsFriends()
		// else
		// 	setAllGameNotifs([])

		if ((location.pathname === '/mainpage/game/solo/1vs1/friends' || location.pathname === '/mainpage/game/createtournament' || location.pathname === '/mainpage/game/solo/2vs2/friends') && user)
			getAllGameFriends()
		else
			setAllGameFriends([])

		if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && user && !userImg)
			getUserImage()

		if ((location.pathname === '/mainpage/game/board' || oneVsOneIdRegex.test(location.pathname) || twoVsTwoIdRegex.test(location.pathname)) && user)
			getGameCustomize()

		if (oneVsOneIdRegex.test(location.pathname) || twoVsTwoIdRegex.test(location.pathname) || location.pathname === '/mainpage/game/solo/computer')
			setHideNavSideBar(true)
		else
			setHideNavSideBar(false)

	}, [location.pathname, user])

	useEffect(() => {
		const addUser = (newUser, currentAllGameFriends) => {
			const userExists = currentAllGameFriends.some(user => user.name === newUser.name)
			if (!userExists)
				setAllGameFriends([...currentAllGameFriends, newUser])
			// setAllGameFriends(prevFriends => [...prevFriends, newUser]);
		};
		async function sendUserData(uname, currentAllGameFriends){
			try {
				let response = await fetch('http://localhost:8000/api/get_user', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						uname: uname
					})
				});
				let data = await response.json();
				const newUser = {id: data.id, name: data.name, level : data.level, image: data.image}
				addUser(newUser, currentAllGameFriends)
			} catch (error) {
				console.error('There has been a problem with your fetch operation:', error);
			}
		}
		if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && !notifSocket && user) {
			const newNotifSocket = new WebSocket(`ws://localhost:8000/ws/notif-socket`)
			newNotifSocket.onopen = () => {
				setNotifSocket(newNotifSocket)
				console.log("NOTIF SOCKET OPENED SUCCEFULLY")
			}
			newNotifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				// let message = data.message
				let uname = data.username
				// if (type === 'user_disconnected') {
				// 	const currentAllGameFriends = allGameFriendsRef.current;
				// 	console.log("user disconnected : ", allGameFriends)
				// 	let uname = data.username
				// 	setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname));
				// }
				// if (type === 'connected_again') {
				// 	const currentAllGameFriends = allGameFriendsRef.current;
				// 	console.log("user connected : ", allGameFriends)
				// 	console.log("VISITED CONNECTED AGAIN")
				// 	sendUserData(uname, currentAllGameFriends)
				// }
			}
		} else if ((location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/signin' || location.pathname === '/SecondStep' ||  location.pathname === '/WaysSecondStep' || location.pathname === '/ForgotPassword' || location.pathname === '/ChangePassword') && notifSocket) {
			if (notifSocket) {
				console.log("NOTIF SOCKET CLOSED SUCCEFULLY")
				notifSocket.close()
				setNotifSocket(null)
			}
		}
		if (gamePlayRegex.test(location.pathname) && !socket && user) {
			const newSocket = new WebSocket(`ws://localhost:8000/ws/socket-server`)
			newSocket.onopen = () => {
				setSocket(newSocket)
				console.log("GAME SOCKET OPENED SUCCEFULLY")
			}
			newSocket.onmessage = (event) => {
				console.log("GAME SOCKET IN AUTHCONTEXT CLOSED SUCCEFULLY")
				let data = JSON.parse(event.data)
				let type = data.type
				// let message = data.message
				// let uname = data.username
				// console.log("GAME SOCKET IN AUTHCONTEXT CLOSED SUCCEFULLY 1")
				if (type === 'close_socket') {
					newSocket.close()
					setSocket(null)
				}
				// if (type === 'user_disconnected') {
				// 	const currentAllGameFriends = allGameFriendsRef.current;
				// 	console.log("user disconnected : ", allGameFriends)
				// 	let uname = data.username
				// 	setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname));
				// }
				// if (type === 'connected_again') {
				// 	const currentAllGameFriends = allGameFriendsRef.current;
				// 	console.log("user connected : ", allGameFriends)
				// 	console.log("VISITED CONNECTED AGAIN")
				// 	sendUserData(uname, currentAllGameFriends)
				// }
			}
			newSocket.onclose = () => {
				console.log("GAME SOCKET CLOSED SUCCEFULLY FROM THE BACK")
				// setSocket(null)
			}
			newSocket.onerror = () => {
				console.log("GAME SOCKET ERROR HAPPENED")
			}
		} else if (!gamePlayRegex.test(location.pathname) && socket) {
			if (socket) {
				console.log("GAME SOCKET CLOSED SUCCEFULLY")
				socket.close()
				setSocket(null)
			}
		}

	}, [location.pathname, user])

	async function publicCheckAuth() {
		try {
			let response = await fetch('http://localhost:8000/auth/verifytoken/', {  // 10.12.7.3   localhost   127.0.0.1
				method : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					user : user
				}),
			})
			response = await response.json()
			if (response.Case !== "Invalid token") {
				setUser(response.data.username)
				navigate('/mainpage')
			} else {
				setUser('')
			}
		} catch (e) {
			console.log("something wrong with fetch")
		}
	}

	async function privateCheckAuth() {
		try {
			let response = await fetch('http://localhost:8000/auth/verifytoken/', {  // 10.12.7.3   localhost   127.0.0.1
				method : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					user : user
				}),
			})
			response = await response.json()
			if (response.Case !== "Invalid token") {
				setUser(response.data.username)
				console.log("USER USERNSME: ",response.data.username)
			} else {
				setUser('')
				navigate('/signin')
			}
		} catch (e) {
			console.log("something wrong with fetch")
		}
	}

	let contextData = {
		user: user,
		setUser: setUser,
		publicCheckAuth: publicCheckAuth,
		privateCheckAuth: privateCheckAuth,
		socket: socket,
		setSocket: setSocket,
		socketRecreated: socketRecreated,
		setSocketRecreated: setSocketRecreated,
		userImg: userImg,
		allGameFriends: allGameFriends,
		setAllGameFriends: setAllGameFriends,
		loading: loading,
		userImages: userImages,
		setAllGameNotifs: setAllGameNotifs,
		allGameNotifs: allGameNotifs,
		notifsImgs: notifsImgs,
		gameCustomize: gameCustomize,
		hideNavSideBar: hideNavSideBar,
		// Profile Settings
		isGlass:isGlass,
		setIsGlass:setIsGlass,
		isReport: isReport,
		setIsReport: setIsReport,
		reportContentRef: reportContentRef,
		reportValue: reportValue,
		setReportValue: setReportValue,
		isBlock: isBlock,
		setIsBlock:setIsBlock,
		blockRef:blockRef,
		blockContentRef:blockContentRef,
		// User Credintials
		userPic:userPic,
		setUserPic:setUserPic,
		nickName:nickName,
		bio:bio,
		country,country,
		setNickName:setNickName,
		setBio:setBio,
		setCountry:setCountry,
		// chat blur
		isBlur:isBlur,
		setIsBlur:setIsBlur,
		notifSocket: notifSocket,
		// gameNotif: gameNotif
	}

	return (
		<AuthContext.Provider value={contextData} >
			{children}
		</AuthContext.Provider>
	)
}
