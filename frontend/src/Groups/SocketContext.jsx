import { createContext, useEffect, useState } from "react";

const SocketContext = createContext();

export default SocketContext;

export const SocketProvider = ({children}) => {
    let url = `ws://localhost:8000/ws/chat`
    let [chatSocket, setChatSocket] = useState(null)
    useEffect(() => {
        if (!chatSocket)
            setChatSocket(new WebSocket(url))
    }, [chatSocket])
    let contextData = {
        chatSocket: chatSocket,
        setChatSocket: setChatSocket
    }

    return (
        <SocketContext.Provider value={contextData} >
            {children}
        </SocketContext.Provider>
    )
}