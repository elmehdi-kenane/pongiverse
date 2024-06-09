import React from 'react'
import {Link} from 'react-router-dom'

import chatSvg from "../../assets/navbar-sidebar/chat.svg"

import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ReportIcon from '@mui/icons-material/Report';
import FlagIcon from '@mui/icons-material/Flag';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function FriendsParam() {
  return (
    <div className="userinfo__friend-param">
        <Link className='param__chat'>
            <img src={chatSvg} alt='chatIcon'/>
            <p> Send Message </p>
        </Link>
        <div className="param__rm-friend">
            <PersonRemoveIcon />
            <p> Remove Friend </p>
        </div>
        <div className="param__rp-friend">
            <FlagIcon />
            <p> Report </p>
        </div>
        <div className="param__rp-friend">
            <NoAccountsIcon />
            <p> Block </p>
        </div>
    </div>
  )
}

export default FriendsParam
