import { useContext, useState } from 'react'
import AuthContext from './Authcontext'

import Profile from '../assets/Friends/profile.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const NotificationPopupCard = ({ secondUsername }) => {
    const { user } = useContext(AuthContext)
    const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);

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
        setRemoveFriendReqNotif(true)
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
                <img src={Profile} alt="Profile" />
                <p>
                    <span className="NotificationPopupUsername">{secondUsername}</span> sent you a friend request
                </p>
            </div>
            <div>
                <button onClick={handleConfirmFriendReq}>
                    <CheckCircleIcon sx={{ fontSize: 25 }} className='CheckCircleIcon'></CheckCircleIcon>
                </button>
                <button onClick={handleCancelFriendReq}>
                    <CancelOutlinedIcon sx={{ fontSize: 30 }} className='CancelOutlinedIcon'></CancelOutlinedIcon>
                </button>
            </div>
        </div>
    )
}

export default NotificationPopupCard