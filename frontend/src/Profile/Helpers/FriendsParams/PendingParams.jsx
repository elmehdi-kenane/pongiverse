import React from 'react'
import {Link} from 'react-router-dom'

import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function PendingParams(props) {

    const handleCnclRequest = () => {
        props.onCnclRequest();
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
            <div className="parameter" onClick={handleCnclRequest}>
                <CancelScheduleSendIcon />
                <p> Cancel Request </p>
            </div>
            <div className="parameter">
                <NoAccountsIcon />
                <p> Block </p>
            </div>
        </div>
  )
}

export default PendingParams