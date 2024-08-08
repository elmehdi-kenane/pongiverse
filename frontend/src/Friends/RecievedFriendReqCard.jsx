import { formatDistanceToNowStrict } from 'date-fns';
import { CancelFriendRequest } from './utils';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'

const RecievedFriendReqCard = ({ secondUsername, send_at, avatar }) => {
    const { user } = useContext(AuthContext);
    const handleConfirmFriendReq = () => {
        fetch('http://localhost:8000/friends/confirm_friend_request/', {
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
    const handleCancelFriendReq = () => {
        CancelFriendRequest(user, secondUsername, 'remove');
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