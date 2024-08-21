import { formatDistanceToNowStrict } from 'date-fns';

import Profile from '../assets/Friends/profile.png';

const RecievedFriendReqCard = ({ currentUsername, secondUsername, send_at, avatar }) => {
    const handleConfirmFriendReq = () => {
        fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/friends/confirm_friend_request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_username: secondUsername,
                to_username: currentUsername,
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
    const handleCancelFriendReq = () => {
        fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/friends/cancel_friend_request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_username: secondUsername,
                to_username: currentUsername,
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
        <div className="RecievedFriendReqCard">
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                <p className="SentFriendReqCardUsername">{secondUsername}</p>
                <p className="SentFriendReqCardSendAt">{formatDistanceToNowStrict(new Date(send_at), { addSuffix: true })}</p>
            </div>
            <div className="GroupFriendBtn">
                <button className="FriendBtn Confirm" onClick={handleConfirmFriendReq}>Confirm</button>
                <button className="FriendBtn Remove" onClick={handleCancelFriendReq}>Remove</button>
            </div>
        </div>
    )
}

export default RecievedFriendReqCard