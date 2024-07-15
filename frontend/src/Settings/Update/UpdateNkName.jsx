import React, { useRef, useState ,useEffect, useContext} from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';

function UpdateNkName() {
    const [isUpdate, setIsUpdate] = useState(false);
    const submit = !isUpdate ? "Update" : "Confirm";
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const {nickName} = useContext(AuthContext)
    const {setNickName} = useContext(AuthContext)

  
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
        if (isUpdate)
            if (inputRef.current.value)
                setNickName(inputRef.current.value)
        setIsUpdate(!isUpdate);
    }
    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter'){
            if (inputRef.current.value)
                setNickName(inputRef.current.value)
            setIsUpdate(false);
        }
    }

    return (
      <div className="update"> 
          <p className='title'> NickName </p>
          {!isUpdate && <p className='update__info'> {nickName} </p>}
          {isUpdate && <input type="text" 
                              className="update__input" 
                              placeholder='Enter new Nickname... '
                              maxLength={10}
                              onKeyDown={handleInputKeyDown}
                              ref={inputRef}/>}
          <div className="update__btn" onClick={onUpdate} ref={iconRef}> {submit} </div>
      </div>
    )
  }

export default UpdateNkName

