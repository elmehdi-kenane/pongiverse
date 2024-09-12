import { useState, useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { handleAddFriendReq } from './utils'

const SuggestionFriendCard = ({ secondUsername, avatar }) => {
    const { user } = useContext(AuthContext);
    const [friendRequestBtn, setFriendRequestBtn] = useState(false);
    const handleAddFriendReq = () => {
    fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/friends/add_friend_request/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from_username: user,
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
    return (
        <div className="SuggestionFriendCard embla__slide">
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                {secondUsername}
                <div className="lvl">1.5lvl</div>
            </div>
                {friendRequestBtn ?
                <>
                    <div style={{ fontSize: "small", marginTop: "10px" }}>Request Sent</div>
                    <div className="loadingBox">
                        <div className="loadingLine"></div>
                    </div>
                </>
                    :
                    <button className="FriendBtn Add" onClick={() => handleAddFriendReq(user, secondUsername, setFriendRequestBtn)}>Add friend</button>
                }
        </div>
    )
}

export default SuggestionFriendCard