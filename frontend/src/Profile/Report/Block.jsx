import React, { useContext, useEffect, useRef } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

function Block() {
    const {setIsBlock} = useContext(AuthContext);
    const blockContentRef = useRef(null);

  return (
    <div className='profile__block'>
      <div className="block-content" ref={blockContentRef}>
        
      </div>
    </div>
  )
}

export default Block
