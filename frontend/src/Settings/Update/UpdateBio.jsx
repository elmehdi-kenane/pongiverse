import React, { useRef, useState ,useEffect, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

function UpdateBio() {
    const [isUpdate, setIsUpdate] = useState(false);
    const submit = !isUpdate ? "Update" : "Confirm";
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const {bio} = useContext(AuthContext)
    const {setBio} = useContext(AuthContext)

  
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
  
  const onUpdate = () => {
    if (isUpdate){
      if (inputRef.current.value)
        setBio(inputRef.current.value)
    }
    setIsUpdate(!isUpdate);
  }
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter'){
      if (inputRef.current.value)
        setBio(inputRef.current.value)
      setIsUpdate(false);
    }
  }
    return (
      <div className={isUpdate ? "update update-text_area" : "update"}> 
          <p className='title'> Bio </p>
          {!isUpdate && <p className='update__info'> {bio} </p>}
          {isUpdate && <textarea type="text" 
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

