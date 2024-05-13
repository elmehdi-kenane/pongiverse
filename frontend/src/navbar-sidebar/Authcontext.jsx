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
    let [user, setUser] = useState('')
    let [socket, setSocket] = useState(null)
    let [socketRecreated, setSocketRecreated] = useState(false)

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
                console.log(friends.message)
                if (friends.message.length)
                    setAllGameFriends(friends.message)
                setLoading(false)
            } catch (e) {
                console.log("something wrong with fetch")
            }
        }
        if (location.pathname === '/mainpage/game/solo/1vs1' && user)
            getAllGameFriends()
        else
            setAllGameFriends([])
    }, [location.pathname, user])

    useEffect(() => {
        if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/Signin' && location.pathname !== '/SecondStep' &&  location.pathname !== '/WaysSecondStep' && location.pathname !== '/ForgotPassword' && location.pathname !== '/ChangePassword' && !socket && user) {
            const newSocket = new WebSocket(`ws://localhost:8000/ws/socket-server`)
            newSocket.onopen = () => {
                console.log("socket opened succefully")
                console.log(user)
                newSocket.onmessage = (event) => {
                    let data = JSON.parse(event.data) 
                    let type = data.type
                    if (type === 'connection_established')
                        console.log('connection established buddy')
                    else if (type === 'friendRequest') {
                        
                    }
                }
            setSocket(newSocket)
            }
        } else if ((location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/Signin' || location.pathname === '/SecondStep' ||  location.pathname === '/WaysSecondStep' || location.pathname === '/ForgotPassword' || location.pathname === '/ChangePassword') && socket) {
            if (socket) {
                console.log("socket closed succefully")
                socket.close()
                setSocket(null)
            }
        }

        const refRemoveRoomFromBack = () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("BEFORE GETTING OUT OF THE PAGE : BEFORE UNLOAD")
                socket.close()
                setSocket(null)
            }
        }
        window.addEventListener("beforeunload", refRemoveRoomFromBack)
        return () => {
            //ma3eza said khass tkon clean up hana
            window.addEventListener("beforeunload", refRemoveRoomFromBack)
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
        allGameFriends: allGameFriends,
        loading: loading,
        userImages: userImages
    }

    return (
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}