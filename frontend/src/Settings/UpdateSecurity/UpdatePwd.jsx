import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import SettingsContext from '../SettingsWrapper';
import SettingsLoading from '../SettingsLoading';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import { use } from 'react';

function UpdatePwd(props) {

  const oldPRef = useRef(null);
  const newPRef = useRef(null);
  const cfmPRef = useRef(null);


  const { user } = useContext(AuthContext);
  const { notifySuc, notifyErr, isLoading, setIsLoading } = useContext(SettingsContext);
  const navigate = useNavigate();
  const checkPwd = (oldPwd, newPwd, cfmPwd) => {
    if (!oldPwd || !newPwd || !cfmPwd)
      return (notifyErr('You need to fill all the password!'), false);
    if (oldPwd.length < 8)
      return (notifyErr('Wrong Current Password!'), false);
    if (newPwd !== cfmPwd)
      return (notifyErr('New Passwords Do Not Match!'), false);
    if (newPwd.length < 8 || cfmPwd.length < 8)
      return (notifyErr('New Passwords Needs To Be At Least 8 Characters Long!'), false);
    if (newPwd === oldPwd)
      return (notifyErr('Old Password And New Passwords Are Identical!'), false);
    return true;
  };

  const updatePassword = async () => {
    const oldPwd = oldPRef.current.value;
    const newPwd = newPRef.current.value;
    const cfmPwd = cfmPRef.current.value;

    if (checkPwd(oldPwd, newPwd, cfmPwd)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/updatePassword`, {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            old_pwd: oldPwd,
            new_pwd: newPwd,
          })
        });
        const res = await response.json()
        if (response.ok) {
          notifySuc(res.case);
        } else if (response.status === 401)
          navigate('/signin');
        else
          notifyErr(res.error);
      } catch (error) {
        notifyErr(error);
        console.error(error);
      }
    }
    setIsLoading(false);
  }


  const PwdInput = (props) => {
    const [showEye, setShowEye] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const inputRef = props.refr;
    const handleEnterClick = (event) => {
      if (event.key === 'Enter')
        updatePassword()
      setShowEye(true);
      if (!inputRef.current.value)
        setShowEye(false);
    }
    const handleShowPwd = () => {
      setShowPwd(!showPwd);
    };
    return (
      <div className="input__ctr">
        <input
          type={showPwd ? 'text' : 'password'}
          className="pwd__input"
          onKeyDown={handleEnterClick}
          maxLength={100}
          ref={inputRef}
        />
        {showEye &&
          <div className="pwd__eye" onClick={handleShowPwd}>
            {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </div>
        }
      </div>
    )
  }
  const cancelPwd = () => {
    props.cancelPwd('security');
  }
  const InputsPwd = () => {
    return (
      <div className='update__pwd'>

        <div className="pwd__title__input">
          <h3 className='pwd__title'> CURRENT PASSWORD </h3>
          <PwdInput refr={oldPRef} />
        </div>
        <div className="pwd__title__input">
          <h3 className='pwd__title'> NEW PASSWORD </h3>
          <PwdInput refr={newPRef} />
        </div>
        <div className="pwd__title__input">
          <h3 className='pwd__title'> CONFIRM NEW PASSWORD </h3>
          <PwdInput refr={cfmPRef} />
          <div className="pwd__submit">
            <button className='submit-button submit__cancel' onClick={cancelPwd}> Cancel </button>
            <button className='submit-button' onClick={updatePassword}> Update </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isLoading ? <InputsPwd /> : <SettingsLoading />}
    </>
  )
}

export default UpdatePwd
