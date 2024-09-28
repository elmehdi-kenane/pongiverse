import React, { useContext } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../ProfileWrapper';
import ChatContext from '../../Context/ChatContext';

import ChatIcon from '@mui/icons-material/Chat';
import MavSvg from "../../assets/Profile/Group.svg"
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function FriendsParam(props) {
    const friendsPrm = props.Prm;
    const { isBlock, setIsBlock } = useContext(AuthContext);
    const navigate = useNavigate();
    const { setIsFriend, userId, userPic } = useContext(ProfileContext);
    const { setSelectedDirect } = useContext(ChatContext);

    const handleRmFriend = () => {
        setIsFriend('false');
    }
    const handleCnclRequest = () => {
        setIsFriend('false');
    }
    const handleBlock = () => {
        setIsBlock(!isBlock);
    }
    const chatNavigate = () => {
        const userImage = userPic ? userPic : MavSvg
        setSelectedDirect({
          name : userId,
          status: true,
          avatar: userImage,
        })
        navigate('/mainpage/chat');
      }
    
    // Params JSX -----------------------
    const chatJsx = (
        <div className='parameter' onClick={chatNavigate}>
            <ChatIcon />
            <p> Send Message </p>
        </div>
    );
    const challengeJsx = (
        <Link className='parameter' to='/mainpage/game'>
            <SportsEsportsIcon />
            <p> Challenge </p>
        </Link>
    );
    const cancelJsx = (
        <div className="parameter" onClick={handleCnclRequest}>
            <CancelScheduleSendIcon />
            <p> Cancel Request </p>
        </div>
    )
    const removeJsx = (
        <div className="parameter" onClick={handleRmFriend}>
            <PersonRemoveIcon />
            <p> Remove Friend </p>
        </div>
    )
    const blockJsx = (
        <div className="parameter" onClick={handleBlock} id='block-click'>
            <NoAccountsIcon />
            <p> Block </p>
        </div>
    );
    // ------------------------------------------

    return (
        <div className="userinfo__friend-param">
            {friendsPrm.map((prm, key) => {
                return (
                    <div key={key}>
                        {prm === "chat" && chatJsx}
                        {prm === "challenge" && challengeJsx}
                        {prm === "cancel" && cancelJsx}
                        {prm === "remove" && removeJsx}
                        {prm === "block" && blockJsx}
                    </ div>
                )
            })}
        </div>
  )
}

export default FriendsParam
