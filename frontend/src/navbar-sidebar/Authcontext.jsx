import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import { Navigate} from 'react-router-dom'
import { friends } from "../assets/navbar-sidebar";
import * as Icons from '../assets/navbar-sidebar'

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
                console.log("ALL MY FRIENDS ARE : ", friends.message)
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
                console.log("ALL MY GAME NOTIFS ARE : ", friends.message)
                if (friends.message.length)
                    setAllGameNotifs(friends.message)
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
                // console.log('USER IMAGE IS THIS : ', image)
            } catch (e) {
                console.log("something wrong with fetch")
            }
        }

        if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && location.pathname !== '/game/solo/1vs1/friends' && location.pathname !== '/game/solo/1vs1/random' && user && !allGameNotifs.length)
            getAllNotifsFriends()
        else
            setAllGameNotifs([])

        if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && user && !userImg)
            getUserImage()

        if (location.pathname === '/mainpage/game/solo/1vs1/friends' && user)
            getAllGameFriends()
        else
            setAllGameFriends([])
    }, [location.pathname, user])

    useEffect(() => {
        // setGameNotif(false)
        if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && !socket && user) {
            const newSocket = new WebSocket(`ws://localhost:8000/ws/socket-server`)
            newSocket.onopen = () => {
            //     console.log("socket opened succefully")
            //     console.log(user)
            //     newSocket.onmessage = (event) => {
            //         let data = JSON.parse(event.data)
            //         let type = data.type
            //         if (type === 'connection_established') {
            //             console.log('connection established buddy')
            //             newSocket.send(JSON.stringify({
            //                 type: 'handShake',
            //                 message: {
            //                     user: user
            //                 }
            //             }))
            //         // } else if (type === 'receiveFriendGame') {
            //         //     console.log("RECEIVED A GAME REQUEST")
            //         //     setGameNotif(true)
            //         // }
            //     }
            //     // console.log(newSocket)
            // }
                setSocket(newSocket)
            // newNotifSocket.onclose = () => {
            //     console.log("chatSocket closed")
            }
            newSocket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'connection_established') {
                    console.log('connection established buddy')
                    newSocket.send(JSON.stringify({
                        type: 'handShake',
                        message: {
                            user: user
                        }
                    }))
                    // } else if (type === 'receiveFriendGame') {
                    //     console.log("RECEIVED A GAME REQUEST")
                    //     setGameNotif(true)
                    // }
                }
                // console.log(newSocket)
            }
        } else if ((location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/signin' || location.pathname === '/SecondStep' ||  location.pathname === '/WaysSecondStep' || location.pathname === '/ForgotPassword' || location.pathname === '/ChangePassword') && socket) {
            if (socket) {
                console.log("socket closed succefully")
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
                navigate('/mainpage')
            } else {
                if (user)
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
                if (!user)
                    setUser(response.data.username)
            } else
                navigate('/signin')
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
        notifsImgs: notifsImgs
        // gameNotif: gameNotif
    }

    return (
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}