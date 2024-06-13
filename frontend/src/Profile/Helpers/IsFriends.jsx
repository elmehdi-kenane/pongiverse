import {React, useState, useEffect, useRef} from 'react'

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Loading from '../../Game/Loading';
// Params
import FriendsParam from './FriendsParams/FriendsParam';
import PendingParams from './FriendsParams/PendingParams';
import AddFriendParams from './FriendsParams/AddFriendParams';

function IsFriends(){
    const [isLoading, setIsLoading] = useState(false);
    const [isFriend, setIsFriend] = useState('false');
    
    const [isParam, setIsParam] = useState(false);
    const paramRef = useRef(null);

    const handleRequestFriend = (value) => {    
      
      setIsParam(false);
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
      }, 1200);

      setIsFriend(value);
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
          <>
            <div className="userinfo__isfriends no-select info-position">
              <div className="isfriends__icon-desc adjust-addfriend" onClick={() => {handleRequestFriend('pending')}}>
                <PersonAddIcon />
                <p> Add Friend </p>
              </div>
              <div className="isfriends__menu" onClick={handleFriendParam} ref={paramRef}>
                <ArrowDropDownIcon />
              </div>
            </div> 
            {isParam && <AddFriendParams onCnclRequest={() => {handleRequestFriend('false')}}/>}
          </>
      )
    }
    else if (isFriend === 'pending' ){
      return (
        <>
          <div className="userinfo__isfriends no-select info-position">
            <div className="isfriends__icon-desc" onClick={() => {handleRequestFriend('true')}}>
              <AccessTimeIcon />
              <p> Pending </p>
            </div>
            <div className="isfriends__menu" onClick={handleFriendParam} ref={paramRef}>
              <ArrowDropDownIcon />
            </div>
          </div>
          {isParam && <PendingParams onCnclRequest={() => {handleRequestFriend('false')}}/>}
        </>
      )
    }
    else if (isFriend === 'true' ){
      return (
        <>
          <div className="userinfo__isfriends no-select info-position ">
            <div className="isfriends__icon-desc">
              <HowToRegIcon />
              <p> Friends </p>
            </div>
            <div className="isfriends__menu" onClick={handleFriendParam} ref={paramRef}>
              <ArrowDropDownIcon />
            </div>
          </div>
          {isParam && <FriendsParam onRmFriend={() => {handleRequestFriend('false')}}/>}
        </>
      )
    }
  }

export default IsFriends
