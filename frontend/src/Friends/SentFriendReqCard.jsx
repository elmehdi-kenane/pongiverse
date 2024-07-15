import { useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'

import Profile from '../assets/Friends/profile.png';

const SentFriendReqCard = ({ currentUsername, secondUsername }) => {
    const { user, socket } = useContext(AuthContext);
    const handleCancelFriendReq = () => {
        fetch('http://localhost:8000/friends/cancel_friend_request/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_username: currentUsername,
                to_username: secondUsername,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };
    // const handleCancelFriendReq = () => {
    //     if (user && socket) {
    //         const requestData = {
    //             type: 'cancel_friend_request',
    //             from_username: user,
    //             to_username: secondUsername
    //         };
    //         socket.send(JSON.stringify(requestData));
    //     }
    // }
    return (
        <div className="SentFriendReqCard">
            <div className="ProfileName">
                <img src={Profile} alt="Profile" className="Profile" />
                {secondUsername}
            </div>
            <button className="FriendBtn Cancel" onClick={handleCancelFriendReq}>Cancel</button>
        </div>
    )
}

export default SentFriendReqCard