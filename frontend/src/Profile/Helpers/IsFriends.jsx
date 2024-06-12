import {React, useState, useEffect, useRef} from 'react'

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Loading from '../../Game/Loading';
import FriendsParam from './FriendsParam';

function IsFriends(){
    const [isLoading, setIsLoading] = useState(false);
    const [isFriend, setIsFriend] = useState('true');
    
    const [isParam, setIsParam] = useState(false);
    const paramRef = useRef(null);

    const handleRequestFriend = () => {    
      if (isFriend !== 'pending'){
          setIsLoading(true);
          setTimeout(() => {
              setIsLoading(false);
          }, 1200);
      }
          
      if (isFriend === 'false')
          setIsFriend('pending');
      else if (isFriend === 'pending')
          setIsFriend('true');
      else if (isFriend === 'true'){
        setIsParam(false);
        setIsFriend('false');
      }
    }

    const handleFriendParam = () => {
        setIsParam(!isParam);
    }

    useEffect (() => {
      document.body.addEventListener('click', (event)=> {
        if (paramRef.current && !event.composedPath().includes(paramRef.current)) {
          setIsParam(false);
          // console.log("click outside Param");
          // console.log(event.composedPath);
        }
      })
    }, [])

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
          <div className="userinfo__isfriends no-select info-position" 
          onClick={handleRequestFriend}>
            <PersonAddIcon />
            <p> Add Friend </p>
          </div> 
        )
    }
    else if (isFriend === 'pending' ){
      return (
        <div className="userinfo__isfriends no-select info-position " 
        onClick={handleRequestFriend}>
            <AccessTimeIcon />
            <p> Pending </p>
        </div>
      )
    }
    else if (isFriend === 'true' ){
      return (
        <>
            <div className="userinfo__isfriends no-select info-position " ref={paramRef}
            onClick={handleFriendParam}>
                <HowToRegIcon />
                <p> Friends </p>
            </div>
            {isParam && <FriendsParam onRmFriend={handleRequestFriend}/>}
        </>
      )
    }
  }

export default IsFriends
