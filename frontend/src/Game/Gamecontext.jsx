import { createContext, useState } from "react";

const GameContext = createContext();

export default GameContext;

export const GameProvider = ({children}) => {
    let url = `${import.meta.env.VITE_SOCKET}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/ws/socket-server`
    let [socket, setsocket] = useState(new WebSocket(url))

    let contextData = {
        socket: socket,
        setsocket:setsocket
    }

    return (
        <GameContext.Provider value={contextData} >
            {children}
        </GameContext.Provider>
    )
}