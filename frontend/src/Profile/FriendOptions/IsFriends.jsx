import {React, useState, useEffect, useRef, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../ProfileWrapper';
import { handleAddFriendReq, cancelFriendRequest, confirmFriendRequest } from "../../Friends/utils";

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Loading from '../../Game/Loading';
import FriendsParam from './FriendsParam';

const addfriendsPrm = ["chat", "challenge"];
const acceptPrm = ["chat", "challenge", "remove"];
const pendingPrm = ["chat", "challenge", "cancel"];
const friendPrm = ["chat", "challenge", "delete", "block"];

function IsFriends(){
    const [isParam, setIsParam] = useState(false);
    const { user } = useContext(AuthContext);
    const {userId, isFriend, setIsFriend, isLoading, setIsLoading} = useContext(ProfileContext);
    const [gjw9, setgjw9] = useState(false);
      
    const handleFriendParam = () => {
        setIsParam(!isParam);
    }
    const HandleAddFriend = () => {
      setIsLoading(true);
      setTimeout(() => {
        handleAddFriendReq(user, userId, setgjw9)
        setIsLoading(false);
        setIsFriend('pending');
      }, 1200);
    }
    const HandleConfirmRequest = () => {
      setIsLoading(true);
      setTimeout(() => {
          confirmFriendRequest(user, userId)
          setIsLoading(false);
          setIsFriend('true');
      }, 1200);
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
              <div className="isfriends__icon-desc adjust-addfriend" onClick={HandleAddFriend}>
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

    const AcceptFriend = () => {
      return (
        <>
            <div className="userinfo__isfriends no-select info-position">
              <div className="isfriends__icon-desc accept-friend" onClick={HandleConfirmRequest}>
                <HowToRegIcon />
                <p> Accept </p>
              </div>
              <div className="isfriends__menu" onClick={handleFriendParam} id='param-click' >
                <ArrowDropDownIcon />
              </div>
            </div> 
            {isParam && <FriendsParam Prm={acceptPrm} />}
          </>
      )
    }

    const Pending = () => {
      return (
        <>
          <div className="userinfo__isfriends no-select info-position">
            <div className="isfriends__icon-desc">
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
            {isFriend === 'accept' && <AcceptFriend />}
            {isFriend === 'pending' && <Pending />}
            {isFriend === 'true' && <Friends />}
          </>
        }
      </>
    )
  }

export default IsFriends

