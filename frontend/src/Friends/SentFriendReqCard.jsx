import { formatDistanceToNowStrict } from 'date-fns';
import { CancelFriendRequest } from './utils';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'

const SentFriendReqCard = ({ secondUsername, send_at, avatar }) => {
    const { user } = useContext(AuthContext);
    const handleCancelFriendReq = () => {
        CancelFriendRequest(user, secondUsername, 'cancel');
    };

    return (
        <div className="SentFriendReqCard">
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                <p className="SentFriendReqCardUsername">{secondUsername}</p>
                <p className="SentFriendReqCardSendAt">{formatDistanceToNowStrict(new Date(send_at), { addSuffix: true })}</p>
            </div>
                <button className="FriendBtn Cancel" onClick={handleCancelFriendReq}>Cancel</button>
        </div>
    )
}

export default SentFriendReqCard