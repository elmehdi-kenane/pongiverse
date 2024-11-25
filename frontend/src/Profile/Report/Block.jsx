import React, { useContext, useEffect, useRef } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import { Link } from 'react-router-dom';
import { handleBlockFriend } from "../../Friends/utils";
import ProfileContext from '../ProfileWrapper';


function Block() {
    const {user, isBlock, setIsBlock} = useContext(AuthContext);
    const {userId} = useContext(ProfileContext);

    const handleCancel = () => {
      setIsBlock(false);
    }
    const handleBlock = () => {
      setIsBlock(false);
      handleBlockFriend(user, userId)
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#block-click') && isBlock){  
        setIsBlock(false);
      }
    });

  return (
    <div className='profile__block'>
      <div className="block-content" id='block-click'>
        <h1 className='block-content__title'>
          Block
        </h1>
        <h2 className='block-content__title2'>
          You’re about to block Maverick !
        </h2>
        <p className='block-content__desc'>
          You’ll no longer be friends, and will lose any endorsements 
          or recommendations from this person.
        </p>
        <div className="block__submit">
          <Link className="block-cancel" onClick={handleCancel}> Cancel </Link>
          <Link to={"/mainpage/dashboard"} className="block-confirm" onClick={handleBlock}> Confirm </Link>
        </div>
      </div>
    </div>
  )
}

export default Block
