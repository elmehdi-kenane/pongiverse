import React from 'react'
import {Link} from 'react-router-dom'

import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function FriendsParam(props) {

    const friendsPrm = props.Prm;

    const handleRmFriend = () => {
        props.onRmFriend();
    }
    const handleCnclRequest = () => {
        props.onCnclRequest();
    }
    
    const chatJsx = (
        <Link className='parameter' to='/mainpage/chat'>
            <ChatIcon />
            <p> Send Message </p>
        </Link>
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
        <div className="parameter">
            <NoAccountsIcon />
            <p> Block </p>
        </div>
    );
    
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
