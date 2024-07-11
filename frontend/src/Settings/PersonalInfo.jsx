import React, { useRef, useState ,useEffect} from 'react'
import mavSvg from './assets/Group.svg'
import bg1 from "./assets/bg1.jpg"

const UpdateInfo = (props) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const submit = !isUpdate ? "Update" : "Confirm";
  const inputRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() =>{
    if (inputRef.current)
      inputRef.current.focus();
  }, [isUpdate])
  useEffect (()=> {
  const handleOutsideClick = (event) => {
    if ((iconRef.current && !event.composedPath().includes(iconRef.current))
      && (inputRef.current && !event.composedPath().includes(inputRef.current))){
    setIsUpdate(false);
  }
}
const handleEsc = (event) => {
  if (event.key === 'Escape') {
      setIsUpdate(false);
    }
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
      props.onEdit(inputRef.current.value)
  }
  setIsUpdate(!isUpdate);
}
const handleInputKeyDown = (event) => {
  if (event.key === 'Enter'){
    if (inputRef.current.value)
      props.onEdit(inputRef.current.value)
    setIsUpdate(false);
    }
  }
  return (
    <div className="update"> 
        <p className='title'> {props.title} </p>
        {!isUpdate && <p className='update__info'> {props.value} </p>}
        {isUpdate && <input type="text" 
                            className="update__input" 
                            placeholder='Enter new Nickname... '
                            onKeyDown={handleInputKeyDown}
                            ref={inputRef}/>}
        <div className="update__btn" onClick={onUpdate} ref={iconRef}> {submit} </div>
    </div>
  )
}

function PersonalInfo() {

  const [nickName, setNickName] = useState("Maverick");
  const [bio, setBio] = useState("Lorem ipsum dolor ...");
  const [country, setCountry] = useState("Morocco");

  return (
    <div className="settings__personal-info ">
        <h1 className='personal-info__header'> PERSONAL INFO </h1>
        <div className="personal-info__update">
          <div className="update"> 
            <img  src={mavSvg} alt="UserPic"/>
            <p className='title-pic'> Upload a new picture </p>
            <div className="update__btn"> Update </div>
          </div>
          <div className="update"> 
            <img  src={bg1} alt="UserPic"/>
            <p className='title-pic'> Upload a new walppaper </p>
            <div className="update__btn"> Update </div>
          </div>
          <UpdateInfo title="Nickname" value={nickName} onEdit={setNickName}/>
          <UpdateInfo title="Bio" value={bio} onEdit={setBio}/>
          <UpdateInfo title="Country" value={country} onEdit={setCountry}/>
        </div>
    </div>
  )
}

export default PersonalInfo
