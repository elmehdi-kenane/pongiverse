import {React, useState} from 'react'

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Loading from '../../Game/Loading';
import FriendsParam from './FriendsParam';

function UserFriends(){
    
    const [isLoading, setIsLoading] = useState(false);
    
    const [isFriend, setIsFriend] = useState('true');

    const [isParam, setIsPAram] = useState(false);

    const handleRequestFriend = () => {
        
    // if (isFriend != 'pending'){
    //     setIsLoading(true);
    //     setTimeout(() => {
    //         setIsLoading(false);
    //     }, 1500);
    // }
        
    // if (isFriend === 'false')
    //     setIsFriend('pending');
    // else if (isFriend === 'pending')
    //     setIsFriend('true');
    // else if (isFriend === 'true')
    //     setIsFriend('false');
    }

    const handleFriendParam = () => {
        setIsPAram(!isParam);
    }

    if (isLoading === true) {
      return (
        <div className="userinfo__loading no-select info-position" >
            <div className='loading-friend'>
                <Loading />
            </div>
        </div>
      )
    }
    else if (isFriend === 'false' ){
        return (
          <div className="userinfo__is-friends no-select info-position" 
          onClick={handleRequestFriend}>
            <PersonAddIcon />
            <p> Add Friend </p>
          </div> 
        )
    }
    else if (isFriend === 'pending' ){
      return (
        <div className="userinfo__is-friends no-select info-position " 
        onClick={handleRequestFriend}>
            <AccessTimeIcon />
            <p> Pending </p>
        </div>
      )
    }
    else if (isFriend === 'true' ){
      return (
        <>
            <div className="userinfo__is-friends no-select info-position " 
            onClick={handleFriendParam}>
                <HowToRegIcon />
                <p> Friends </p>
            </div>
            {isParam && <FriendsParam />}
        </>
      )
    }
  }

export default UserFriends
