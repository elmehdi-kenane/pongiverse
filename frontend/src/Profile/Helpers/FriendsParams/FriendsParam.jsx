import React from 'react'
import {Link} from 'react-router-dom'

import ChatIcon from '@mui/icons-material/Chat';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function FriendsParam(props) {

    const handleRmFriend = () => {
        props.onRmFriend();
    }
    
  return (
        <div className="userinfo__friend-param">
            <Link className='parameter' to='/mainpage/chat'>
                <ChatIcon />
                <p> Send Message </p>
            </Link>
            <Link className='parameter' to='/mainpage/game'>
                <SportsEsportsIcon />
                <p> Challenge </p>
            </Link>
            <div className="parameter" onClick={handleRmFriend}>
                <PersonRemoveIcon />
                <p> Remove Friend </p>
            </div>
            <div className="parameter">
                <NoAccountsIcon />
                <p> Block </p>
            </div>
        </div>
  )
}

export default FriendsParam
