import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import Loading from '../../Game/Loading';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';

function UpdatePwd(props) {

  const oldPRef = useRef(null);
  const newPRef = useRef(null);
  const cfmPRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false)

  const { user } = useContext(AuthContext);

  const notifyErr = (err) => toast.error(err);
  const notifySuc = (suc) => toast.success(suc);

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
          notifySuc(res.case);
          // console.log(res.case);
        }
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
          maxLength={50}
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
    props.cancelPwd(false);
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

  const LoadingPwd = () => {
    return (
      <div className='update__lodaing'>
        <h1 className='loading__title'> Loading... </h1>
        <div className='loading__ctr'>
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <>
      {!isLoading ? <InputsPwd /> : <LoadingPwd />}
    </>
  )
}

export default UpdatePwd
