import Profile from '../assets/Friends/profile.png';

const BlockedAccountCard = ({ name }) => {
    return (
        <div className="BlockedAccountCard">
            <div className="ProfileName">
                <img src={Profile} alt="Profile" className="Profile" />
                {name}
            </div>
            <button className="FriendBtn Unblock">Unblock</button>
        </div>
    )
}

export default BlockedAccountCard