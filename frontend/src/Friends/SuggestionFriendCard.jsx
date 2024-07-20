import { useState, useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import Profile from '../assets/Friends/profile.png';

const SuggestionFriendCard = ({ currentUsername, secondUsername, avatar}) => {
    const { user, socket } = useContext(AuthContext);
    const [friendRequestBtn, setFriendRequestBtn] = useState(false);
    // const handleCancelFriendReq = () => {
        //     setFriendRequestBtn(false);
        //     if (user && socket) {
            //         const requestData = {
    //             type: 'cancel_friend_request',
    //             from_username: user,
    //             to_username: secondUsername
    //         };
    //         socket.send(JSON.stringify(requestData));
    //     }
    // }
    
    // 
    const handleAddFriendReq = () => {
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
        setFriendRequestBtn(true);
};

// const handleCancelFriendReq = () => {
//     setFriendRequestBtn(false);
//     fetch('http://localhost:8000/friends/cancel_friend_request/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             from_username: currentUsername,
//             to_username: secondUsername,
//         }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Success:', data);
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
// };
    
    // const handleAddFriendReq = () => {
    //     setFriendRequestBtn(true);
    //     if (user && socket) {
    //         const requestData = {
    //             type: 'add_friend_request',
    //             from_username: user,
    //             to_username: secondUsername
    //         };
    //         socket.send(JSON.stringify(requestData));
    //     }
    // }

    return (
        <div className="SuggestionFriendCard embla__slide">
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                {secondUsername}
                <div className="lvl">1.5lvl</div>
            </div>
                {friendRequestBtn ?
                        <div style={{ fontSize: "small", marginTop: "10px" }}>Request Sent</div>
                        // <button className="FriendBtn Add" onClick={handleCancelFriendReq}>X</button>
                    :
                    <button className="FriendBtn Add" onClick={handleAddFriendReq}>Add friend</button>
                }
        </div>
    )
}

export default SuggestionFriendCard