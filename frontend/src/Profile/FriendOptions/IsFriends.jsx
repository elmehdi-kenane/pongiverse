import {React, useState, useEffect, useRef, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../ProfileWrapper';

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

    const [isParam, setIsParam] = useState(false);

    const {isFriend, setIsFriend} = useContext(ProfileContext);

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

    // useEffect (() => {
    //   const handleClickOutside = (event)=> {
    //     // if (!event.composedPath().includes(paramRef.current)) {
    //     //   setIsParam(false);
    //     //   // console.log("click outside Param");
    //     //   // console.log(event.composedPath());
    //     // }
    //     if (!event.composedPath().includes(blockRef.current) 
    //       && !event.composedPath().includes(blockContentRef.current))
    //         setIsBlock(false);
    //   }
    //   document.body.addEventListener('click', handleClickOutside)
    //   return () => {
    //     document.body.removeEventListener('click', handleClickOutside)
    //   }
    // }, [])
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#param-click') && isParam){  
        setIsParam(false);
      }
    });

    const Looading = () => {
      return (
        <div className="userinfo__loading no-select info-position" >
          <Loading />
        </div>
      )
    }

    const AddFriend = () => {
      return (
        <>
            <div className="userinfo__isfriends no-select info-position">
              <div className="isfriends__icon-desc adjust-addfriend" onClick={() => {handleRequestFriend('pending')}}>
                <PersonAddIcon />
                <p> Add Friend </p>
              </div>
              <div className="isfriends__menu" onClick={handleFriendParam} id='param-click' >
                <ArrowDropDownIcon />
              </div>
            </div> 
            {isParam && <FriendsParam Prm={addfriendsPrm} />}
          </>
      )
    }

    const Accept = () => {
      return (
        <>
            <div className="userinfo__isfriends no-select info-position">
              <div className="isfriends__icon-desc accept-friend" onClick={() => {handleRequestFriend('true')}}>
                <HowToRegIcon />
                <p> Accept </p>
              </div>
              <div className="isfriends__menu" onClick={handleFriendParam} id='param-click' >
                <ArrowDropDownIcon />
              </div>
            </div> 
            {isParam && <FriendsParam Prm={addfriendsPrm} />}
          </>
      )
    }

    const Pending = () => {
      return (
        <>
          <div className="userinfo__isfriends no-select info-position">
            <div className="isfriends__icon-desc" onClick={() => {handleRequestFriend('true')}}>
              <AccessTimeIcon />
              <p> Pending </p>
            </div>
            <div className="isfriends__menu" onClick={handleFriendParam} id='param-click' >
              <ArrowDropDownIcon />
            </div>
          </div>
          {isParam && <FriendsParam Prm={pendingPrm}/>}
        </>
      )
    }

    const Friends = () => {
      return (
        <>
          <div className="userinfo__isfriends no-select info-position">
            <div className="isfriends__icon-desc">
              <HowToRegIcon />
              <p> Friends </p>
            </div>
            <div className="isfriends__menu" onClick={handleFriendParam} id='param-click' >
              <ArrowDropDownIcon />
            </div>
          </div>
          {isParam && <FriendsParam Prm={friendPrm} />}
        </>
      )
    }

    return (
      <>
        {isLoading ? <Looading /> : 
          <>
            {isFriend === 'false' && <AddFriend />}
            {isFriend === 'accept' && <Accept />}
            {isFriend === 'pending' && <Pending />}
            {isFriend === 'true' && <Friends />}
          </>
        }
      </>
    )
  }

export default IsFriends