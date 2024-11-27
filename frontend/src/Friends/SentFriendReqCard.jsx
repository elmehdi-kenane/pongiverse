import { formatDistanceToNowStrict } from 'date-fns';
import { cancelFriendRequest } from "./utils";
import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';

const SentFriendReqCard = ({ secondUsername, send_at, avatar }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleCancelFriendReq = () => {
        cancelFriendRequest(user, secondUsername, "cancel");
    };

    return (
        <div className="SentFriendReqCard" onClick={() => navigate(`/mainpage/profile/${secondUsername}`)}>
            <div className="ProfileName">
                <img src={avatar} alt="Profile" className="Profile" />
                <p className="SentFriendReqCardUsername">{secondUsername}</p>
                <p className="SentFriendReqCardSendAt">{formatDistanceToNowStrict(new Date(send_at), { addSuffix: true })}</p>
            </div>
            <button className="FriendBtn Cancel" onClick={
                (e) => {
                    e.stopPropagation()
                    handleCancelFriendReq()
                }
            }>Cancel</button>
        </div>
    )
}

export default SentFriendReqCard