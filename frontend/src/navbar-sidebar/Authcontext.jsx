import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import { Navigate} from 'react-router-dom'

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    let navigate = useNavigate()
    let location = useLocation()
    let [user, setUser] = useState('')
    let [socket, setSocket] = useState(null)
    let [chatSocket, setChatSocket] = useState(null)
    let [socketRecreated, setSocketRecreated] = useState(false)
    const idRegex = /^\/mainpage\/play\/1vs1\/room_\d+$/

    useEffect(() => {
        if (location.pathname === '/mainpage/groups' || location.pathname === '/mainpage/chat' && !chatSocket) {
            const newChatSocket = new WebSocket(`ws://localhost:8000/ws/chat`)
            setChatSocket(newChatSocket)
        } else if (location.pathname !== '/mainpage/groups' && location.pathname !== '/mainpage/chat' && chatSocket) {
            console.log("pathname", location.pathname, chatSocket)
            if (chatSocket) {
                console.log("chatSocket closed succefully")
                chatSocket.close()
                setChatSocket(null)
            }
        } else if (location.pathname !== '/mainpage/game/solo/1vs1' && !idRegex.test(location.pathname) && socket) {
            console.log("pathname", location.pathname, socket)
            if (socket) {
                console.log("Socket closed succefully")
                socket.close()
                setSocket(null)
            }
        } else if ((location.pathname === '/mainpage/game/solo/1vs1' || idRegex.test(location.pathname)) && !socket) {
            const newSocket = new WebSocket(`ws://localhost:8000/ws/socket-server`)
            newSocket.onopen = () => {
                console.log("Socket opened succefully")
                newSocket.onmessage = (event) => {
                    let data = JSON.parse(event.data)
                    let type = data.type
                    if (type === 'connection_established') {
                        console.log('connection established buddy')
                        setSocketRecreated(true)
                    }
                }
                console.log(newSocket)
                setSocket(newSocket)
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
    }, [location.pathname])

    async function publicCheckAuth() {
        try {
            let response = await fetch('http://localhost:8000/api/get', {  // 10.12.7.3   localhost   127.0.0.1
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            response = await response.json()
            if (response.detail !== "Unauthenticated")
                navigate('/mainpage')
            else {
                if (user)
                    setUser('')
            }
        } catch (e) {
            console.log("something wrong with fetch")
        }
    }

    async function privateCheckAuth() {
        try {
            let response = await fetch('http://localhost:8000/api/get', {  // 10.12.7.3   localhost   127.0.0.1
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            response = await response.json()
            if (response.detail !== "Unauthenticated") {
                if (!user)
                    setUser(response.name)
            }
            else
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
        chatSocket : chatSocket,
        setChatSocket : setChatSocket,
    }

    return (
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}