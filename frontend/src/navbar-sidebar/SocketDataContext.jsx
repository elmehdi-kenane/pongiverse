import { createContext, useContext, useEffect, useState } from 'react';
import AuthContext from './Authcontext'

const SocketDataContext = createContext();

export default SocketDataContext

export const SocketDataContextProvider = ({ children }) => {
    const { notifSocket } = useContext(AuthContext);
    const [data, setData] = useState({ message: 'messageStart', type: 'typeStart' });
    useEffect(() => {
        if (notifSocket) {
            console.log(".............. NEW MESSAGE FROM BACKEND ..............");
            notifSocket.onmessage = (e) => {
                const parsedData = JSON.parse(e.data);
                const data =
                {
                    message: parsedData.message,
                    type: parsedData.type,
                };
                setData(data)
            }
        }
        else
            console.log("notifSocket", notifSocket, "doesn't exist");
    }, [notifSocket]);
    return (
        <SocketDataContext.Provider value={data}>
            {children}
        </SocketDataContext.Provider>
    )
}