import { useState } from 'react'
import Profile from '../assets/Friends/profile.png';

const SuggestionFriendCard = ({ currentUsername, secondUsername }) => {
    const [friendRequestBtn, setFriendRequestBtn] = useState(false);
    const handleAddFriendReq = () => {
        setFriendRequestBtn(true);
        fetch('http://localhost:8000/friends/add_friend_request/', {
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

    const handleCancelFriendReq = () => {
        setFriendRequestBtn(false);
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

    return (
        <div className="SuggestionFriendCard">
            <div className="ProfileName">
                <img src={Profile} alt="Profile" className="Profile" />
                    {secondUsername}
                    {console.log("secondUsername: " + secondUsername)}
                <div className="lvl">1.5lvl</div>
            </div>
                {friendRequestBtn ?
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", alignContent: "center", width: "100%" }}>
                        <div style={{ fontSize: "small" }}>Request Sent</div>
                        <button className="FriendBtn Add" onClick={handleCancelFriendReq}>X</button>
                    </div>
                    :
                    <button className="FriendBtn Add" onClick={handleAddFriendReq}>Add friend</button>
                }
        </div>
    )
}

export default SuggestionFriendCard