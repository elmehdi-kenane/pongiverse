import React, { useRef, useState, useEffect, useContext } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import EditIcon from '@mui/icons-material/Edit';
import SettingsContext from '../SettingsWrapper';

function UpdateBio() {
  const [isUpdate, setIsUpdate] = useState(false);
  const submit = !isUpdate ? "Update" : "Confirm";
  const inputRef = useRef(null);
  const iconRef = useRef(null);

  const { user } = useContext(AuthContext)
  const { userBio, setUserBio } = useContext(SettingsContext)


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
      const response = await fetch('http://localhost:8000/profile/updateUserBio', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          bio: bio,
        })
      });
      const res = await response.json()
      if (response.ok) {
        // console.log(res.case)
        setUserBio(bio)
      }
      else
        console.log(res.error)
    } catch (error) {
      console.log(error);
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
          maxLength={100}
          onKeyDown={handleInputKeyDown}
          ref={inputRef} />}
      <div className="update__btn" onClick={onUpdate} ref={iconRef}>  <p> {submit} </p>
        <EditIcon /> 
      </div>
    </div>
  )
}

export default UpdateBio
