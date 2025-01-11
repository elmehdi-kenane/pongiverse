import React, { useRef, useState, useEffect, useContext } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import EditIcon from '@mui/icons-material/Edit';
import SettingsContext from '../SettingsWrapper';
import { useNavigate } from 'react-router-dom';

function UpdateBio() {
  const [isUpdate, setIsUpdate] = useState(false);
  const submit = !isUpdate ? "Update" : "Confirm";
  const inputRef = useRef(null);
  const iconRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)
  const { userBio, setUserBio, notifySuc, notifyErr } = useContext(SettingsContext)

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus();
  }, [isUpdate])
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if ((iconRef.current && !event.composedPath().includes(iconRef.current))
        && (inputRef.current && !event.composedPath().includes(inputRef.current))) { setIsUpdate(false); }
    }
    const handleEsc = (event) => {
      (event.key === 'Escape') && setIsUpdate(false);
    };
    document.body.addEventListener("click", handleOutsideClick)
    document.body.addEventListener('keydown', handleEsc);
    return () => {
      document.body.removeEventListener("click", handleOutsideClick)
      document.body.removeEventListener('keydown', handleEsc);
    }
  }, [])


  const UpdateUserBio = async (bio) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/updateUserBio`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: bio,
        })
      });
      const res = await response.json()
      if (response.ok) {
        notifySuc(res.case)
        setUserBio(bio)
      } else if (response.status === 401) {
        navigate('/signin')
      }
      else
        notifyErr(res.error)
    } catch (error) {
      notifyErr(error);
    }
  }

  const truncateString = (str) => {
    if (str && str.length > 20)
      return str.slice(0, 20) + "...";
    else
      return str;
  }
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (inputRef.current.value)
        UpdateUserBio(inputRef.current.value)
      setIsUpdate(false);
    }
  }
  const onUpdate = () => {
    if (isUpdate) {
      if (inputRef.current.value)
        UpdateUserBio(inputRef.current.value)
    }
    setIsUpdate(!isUpdate);
  }
  return (
    <div className={isUpdate ? "update update-height" : "update"}>
      <p className='title'> Bio </p>
      {!isUpdate &&
        <div className='update__bio'>
          <p className='update__info'> {truncateString(userBio)} </p>
          <p className='update__info-hover shadow-bg'> {userBio} </p>
        </div>
      }
      {isUpdate &&
        <textarea type="text"
          className="update__input input-bio"
          placeholder='Enter new Bio... '
          maxLength={30}
          onKeyDown={handleInputKeyDown}
          ref={inputRef} />}
      <div className="update__btn" onClick={onUpdate} ref={iconRef}>  <p> {submit} </p>
        <EditIcon />
      </div>
    </div>
  )
}

export default UpdateBio
