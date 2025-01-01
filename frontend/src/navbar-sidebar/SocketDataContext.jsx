import { createContext, useContext, useEffect, useState } from 'react';
import AuthContext from './Authcontext'

const SocketDataContext = createContext();

export default SocketDataContext

export const SocketDataContextProvider = ({ children }) => {
    const { socket } = useContext(AuthContext);
    const [data, setData] = useState({ message: 'messageStart', type: 'typeStart' });
    // useEffect(() => {
    //     if (socket) {
    //        console.log(".............. NEW MESSAGE FROM BACKEND ..............");
    //         socket.onmessage = (e) => {
    //             const parsedData = JSON.parse(e.data);
    //             const data =
    //             {
    //                 message: parsedData.message,
    //                 type: parsedData.type,
    //             };
    //             setData(data)
    //         }
    //     }
    //     // else
    //         //console.log("socket", socket, "doesn't exist");
    // }, [socket]);
    return (
        <SocketDataContext.Provider value={data}>
            {children}
        </SocketDataContext.Provider>
    )
}