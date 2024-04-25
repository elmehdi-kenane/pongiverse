import { createContext, useEffect, useState } from "react";

const GameContext = createContext();

export default GameContext;

export const GameProvider = ({children}) => {
    let url = `ws://localhost:8000/ws/socket-server`
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
        <GameContext.Provider value={contextData} >
            {children}
        </GameContext.Provider>
    )
}