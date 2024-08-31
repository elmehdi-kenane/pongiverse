import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useWebSocketMessageHandler = (socket, setAllGameNotifs, setRoomID) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const handleMessage = (event) => {
                const data = JSON.parse(event.data);
                const { type, message } = data;

                switch (type) {
                    case 'goToGamingPage':
                        console.log('navigating now');
                        navigate(`/mainpage/game/solo/1vs1/friends`);
                        break;
                    case 'receiveFriendGame':
                        console.log('RECEIVED A GAME REQUEST');
                        setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message]);
                        setRoomID(message.roomID);
                        break;
                    case 'hmed':
                        console.log('hmed received');
                        socket.close()
                        break;
                    default:
                        break;
                }
            };

            socket.addEventListener('message', handleMessage);

            return () => {
                socket.removeEventListener('message', handleMessage);
            };
        }
    }, [socket]);
};

export default useWebSocketMessageHandler;
