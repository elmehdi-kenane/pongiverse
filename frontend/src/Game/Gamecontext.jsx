import { createContext, useState } from "react";

const GameContext = createContext();

export default GameContext;

export const GameProvider = ({children}) => {
    let url = `ws://localhost:8000/ws/socket-server`
    let [chatSocket, setChatSocket] = useState(new WebSocket(url))

    let contextData = {
        chatSocket: chatSocket,
        setChatSocket:setChatSocket
    }

    return (
        <GameContext.Provider value={contextData} >
            {children}
        </GameContext.Provider>
    )
}