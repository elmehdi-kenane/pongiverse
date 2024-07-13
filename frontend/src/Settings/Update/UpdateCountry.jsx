import React, { useRef, useState ,useEffect, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

function UpdateCountry() {
    const [isUpdate, setIsUpdate] = useState(false);
    const submit = !isUpdate ? "Update" : "Confirm";
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const {country} = useContext(AuthContext)
    const {setCountry} = useContext(AuthContext)

  
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
        setCountry(inputRef.current.value)
    }
    setIsUpdate(!isUpdate);
  }
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter'){
      if (inputRef.current.value)
        setCountry(inputRef.current.value)
      setIsUpdate(false);
    }
  }
    return (
      <div className="update"> 
          <p className='title'> Country </p>
          {!isUpdate && <p className='update__info'> {country} </p>}
          {isUpdate && <input type="text" 
                              className="update__input" 
                              placeholder='Enter new Country... '
                              onKeyDown={handleInputKeyDown}
                              ref={inputRef}/>}
          <div className="update__btn" onClick={onUpdate} ref={iconRef}> {submit} </div>
      </div>
    )
  }

export default UpdateCountry
