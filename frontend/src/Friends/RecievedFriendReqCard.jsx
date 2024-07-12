import Profile from '../assets/Friends/profile.png';

const RecievedFriendReqCard = ({ currentUsername, secondUsername }) => {
    const handleConfirmFriendReq = () => {
        fetch('http://localhost:8000/friends/confirm_friend_request/', {
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
        fetch('http://localhost:8000/friends/cancel_friend_request/', {
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
                <img src={Profile} alt="Profile" className="Profile" />
                {secondUsername}
            </div>
            <div className="GroupFriendBtn">
                <button className="FriendBtn Confirm" onClick={handleConfirmFriendReq}>Confirm</button>
                <button className="FriendBtn Remove" onClick={handleCancelFriendReq}>Remove</button>
            </div>
        </div>
    )
}

export default RecievedFriendReqCard