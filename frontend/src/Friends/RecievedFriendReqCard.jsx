import { formatDistanceToNowStrict } from 'date-fns';
import { cancelFriendRequest, confirmFriendRequest } from "./utils";
import AuthContext from "../navbar-sidebar/Authcontext";
import { useContext } from "react";

const RecievedFriendReqCard = ({ secondUsername, send_at, avatar }) => {
  const { user } = useContext(AuthContext);
  const handleConfirmFriendReq = () => {
    confirmFriendRequest(user, secondUsername);
  };
  const handleCancelFriendReq = () => {
    cancelFriendRequest(user, secondUsername, "remove");
  };
  return (
    <div className="RecievedFriendReqCard">
      <div className="ProfileName">
        <img src={avatar} alt="Profile" className="Profile" />
        <p className="SentFriendReqCardUsername">{secondUsername}</p>
        <p className="SentFriendReqCardSendAt">
          {formatDistanceToNowStrict(new Date(send_at), { addSuffix: true })}
        </p>
      </div>
      <div className="GroupFriendBtn">
        <button className="FriendBtn Confirm" onClick={handleConfirmFriendReq}>
          Confirm
        </button>
        <button className="FriendBtn Remove" onClick={handleCancelFriendReq}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default RecievedFriendReqCard