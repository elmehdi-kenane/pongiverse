import { useContext, useState } from 'react'
import AuthContext from './Authcontext'
import { CancelFriendRequest } from '../Friends/utils';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const NotificationPopupCard = ({ secondUsername, avatar}) => {
    const { user } = useContext(AuthContext)
    const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);

    const handleConfirmFriendReq = () => {
        CancelFriendRequest(user, secondUsername);
        setRemoveFriendReqNotif(true);
    };
    
    const handleCancelFriendReq = () => {
        fetch('http://localhost:8000/friends/cancel_friend_request/', {
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
        setRemoveFriendReqNotif(true)
    };
    
    return (
        <div className={`NotificationPopupCard ${removeFriendReqNotif ? "NotificationPopupCardDesappeared" : ""}`}>
            <div className='NotificationPopupHeader'>
                <img src={avatar} alt="Profile" className="Profile" />
                <p>
                    <span className="NotificationPopupUsername">{secondUsername}</span> sent you a friend request
                </p>
            </div>
            <div className="NotificationPopupCardBtn">
                <button onClick={handleConfirmFriendReq}>
                    <CheckCircleIcon sx={{ fontSize: 25 }} className='CheckCircleIcon'></CheckCircleIcon>
                    Accept
                </button>
                <button onClick={handleCancelFriendReq}>
                    <CancelOutlinedIcon sx={{ fontSize: 25 }} className='CancelOutlinedIcon'></CancelOutlinedIcon>
                </button>
            </div>
        </div>
    )
}

export default NotificationPopupCard