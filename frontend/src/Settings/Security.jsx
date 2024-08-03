import React, { useState } from 'react'
import UpdatePwd from './UpdateSecurity/UpdatePwd';
import TwoFaq from './UpdateSecurity/TwoFaq';

function Security() {

  const [isPwd, setIsPwd] = useState(false);
  const [isTF, setIsTF] = useState(false);

  const setUpdate = (option) => {
    if (option === 'pwd')
      setIsPwd(!isPwd);
    else
      setIsTF(!isTF);
  }

  return (
    <div className="settings__security">
      <h1 className='settings__header'> SECURITY </h1>
      <div className="security__update linear-purple-bg">
        {!isPwd && !isTF &&
          <>
            <div className="update">
              <p className='title more-width'> Change Password </p>
              <div className="update__btn" onClick={() => setUpdate('pwd')}> Update </div>
            </div>
            <div className="update no-bottom">
              <p className='title more-width'> Authenticator App </p>
              <div className="update__btn" onClick={() => setUpdate('tf')}> Enable </div>
            </div>
          </>
        }
        {isPwd && <UpdatePwd cancelPwd={setIsPwd}/>}
        {isTF && <TwoFaq />}
      </div>
    </div>
  )
}

export default Security
