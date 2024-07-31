import React, { useRef, useState ,useEffect, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../../Profile/ProfileWrapper';

function UpdateBio() {
    const [isUpdate, setIsUpdate] = useState(false);
    const submit = !isUpdate ? "Update" : "Confirm";
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const {userBio, setUserBio} = useContext(ProfileContext)


    useEffect(() =>{
        if (inputRef.current)
            inputRef.current.focus();
    }, [isUpdate])
    useEffect (()=> {
        const handleOutsideClick = (event) => {
            if ((iconRef.current && !event.composedPath().includes(iconRef.current))
                && (inputRef.current && !event.composedPath().includes(inputRef.current)))
            {setIsUpdate(false);}
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
    },[])
  
  const truncateString = (str) => {
    if (str.length > 20)
      return str.slice(0, 20) + "...";
    else
      return str;
  }
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter'){
      if (inputRef.current.value)
        setUserBio(inputRef.current.value)
      setIsUpdate(false);
    }
  }
  const onUpdate = () => {
    if (isUpdate){
      if (inputRef.current.value)
        setUserBio(inputRef.current.value)
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
                      placeholder='Enter new bio... '
                      maxLength={100}
                      onKeyDown={handleInputKeyDown}
                      ref={inputRef}/>}
          <div className="update__btn" onClick={onUpdate} ref={iconRef}> {submit} </div>
      </div>
    )
  }

export default UpdateBio
