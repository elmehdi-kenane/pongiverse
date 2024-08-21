import { useContext, useState } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'

import Profile from '../assets/Friends/profile.png';

const BlockedAccountCard = ({ secondUsername, avatar}) => {
    const { user } = useContext(AuthContext)

    const handleUnblockFriend = () => {
        fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/friends/unblock_friend/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_username: secondUsername,
                to_username: user,
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

    return (
        <div className="BlockedAccountCard">
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                {secondUsername}
            </div>
            <button onClick={handleUnblockFriend} className="FriendBtn Unblock">Unblock</button>
        </div>
    )
}

export default BlockedAccountCard