import { useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'

const BlockedAccountCard = ({ secondUsername, avatar}) => {
    const { user } = useContext(AuthContext)
    const handleUnblockFriend = () => {
        fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/unblock_friend/`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to_username: secondUsername,
                from_username: user,
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