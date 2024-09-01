import {React, useState, useEffect, useRef, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Loading from '../../Game/Loading';
import FriendsParam from './FriendsParam';

const addfriendsPrm = ["chat", "challenge"];
const pendingPrm = ["chat", "challenge", "cancel"];
const friendPrm = ["chat", "challenge", "remove", "block"];

function IsFriends(){
    const [isLoading, setIsLoading] = useState(false);
    const [isFriend, setIsFriend] = useState('true');

    const [isParam, setIsParam] = useState(false);
    const paramRef = useRef(null);

    const {blockRef} = useContext(AuthContext);
    const {blockContentRef} = useContext(AuthContext);
    const {setIsBlock} = useContext(AuthContext);

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
      const handleClickOutside = (event)=> {
        if (!event.composedPath().includes(paramRef.current)) {
          setIsParam(false);
          // console.log("click outside Param");
          // console.log(event.composedPath());
        }
        if (!event.composedPath().includes(blockRef.current) 
          && !event.composedPath().includes(blockContentRef.current) 
        ) {
          setIsBlock(false);
        }
      }
      document.body.addEventListener('click', handleClickOutside)
      return () => {
        document.body.removeEventListener('click', handleClickOutside)
      }
    }, [])

    if (isLoading === true) {
      return (
        <div className="userinfo__loading no-select info-position" >
          <Loading />
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
            {isParam && <FriendsParam Prm={addfriendsPrm} />}
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
          {isParam && <FriendsParam onCnclRequest={() => {handleRequestFriend('false')}} Prm={pendingPrm}/>}
        </>
      )
    }
    else if (isFriend === 'true' ){
      return (
        <>
          <div className="userinfo__isfriends no-select info-position">
            <div className="isfriends__icon-desc">
              <HowToRegIcon />
              <p> Friends </p>
            </div>
            <div className="isfriends__menu" onClick={handleFriendParam} ref={paramRef}>
              <ArrowDropDownIcon />
            </div>
          </div>
          {isParam && <FriendsParam onRmFriend={() => {handleRequestFriend('false') }} Prm={friendPrm} />}
        </>
      )
    }
  }

export default IsFriends