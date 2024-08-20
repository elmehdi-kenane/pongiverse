import { createContext, useEffect, useState } from "react";

const SocketContext = createContext();

export default SocketContext;

export const SocketProvider = ({children}) => {
    let url = `ws://localhost:8000/ws/chat`
    let [socket, setsocket] = useState(null)
    useEffect(() => {
        if (!socket)
            setsocket(new WebSocket(url))
    }, [socket])
    let contextData = {
        socket: socket,
        setsocket: setsocket
    }

    return (
        <SocketContext.Provider value={contextData} >
            {children}
        </SocketContext.Provider>
    )
}