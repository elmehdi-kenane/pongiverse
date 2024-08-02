import React, { useContext, useRef, useState } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

function UpdatePwd() {

  const [oldPwd, setOldPwd] = useState(null);
  const [newPwd, setNewPwd] = useState(null);
  const [cfmPwd, setCfmPwd] = useState(null);

  const oldPRef = useRef(null);
  const newPRef = useRef(null);
  const cfmPRef = useRef(null);

  const { user } = useContext(AuthContext);

  const updatePassword = async () => {
    setOldPwd(oldPRef.current.value)
    setNewPwd(newPRef.current.value)
    setCfmPwd(cfmPRef.current.value)
    if (oldPwd && newPwd && cfmPwd) {
      try {
        const response = await fetch('http://localhost:8000/profile/updatePassword', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user,
            old_pwd: oldPwd,
            new_pwd: newPwd,
          })
        });
        const res = await response.json()
        if (response.ok) {
          console.log(res.case);
        }
        else
          console.log(res.error);
      } catch (error) {
        console.log(error);
      }
    }
    else
      console.log("error : da5al ga3 lpasswords");
  }

  return (
    <div className='update__pwd'>
      <div className="pwd__title__input">
        <h3 className='pwd__title'> CURRENT PASSWORD </h3>
        <input type="text"
          className="update__input"
          maxLength={50}
          ref={oldPRef}
        />
      </div>
      <div className="pwd__title__input">
        <h3 className='pwd__title'> NEW PASSWORD </h3>
        <input type="text"
          className="update__input"
          maxLength={50}
          ref={newPRef}
        />
      </div>
      <div className="pwd__title__input">
        <h3 className='pwd__title'> CONFIRM NEW PASSWORD </h3>
        <input type="text"
          className="update__input"
          maxLength={50}
          ref={cfmPRef}
        />
        <div className="pwd__submit">
          <button className='submit-button submit__cancel'> Cancel </button>
          <button className='submit-button' onClick={updatePassword}> Update </button>
        </div>
      </div>
    </div>
  )
}

export default UpdatePwd
