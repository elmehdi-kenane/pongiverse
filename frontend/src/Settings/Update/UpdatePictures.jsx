import React, { useContext } from 'react'
import SettingsContext from '../SettingsWrapper'

import EditIcon from '@mui/icons-material/Edit';

function UpdatePictures(props) {

    const { userPic, userBg } = useContext(SettingsContext)

  return (
    <>
      <div className="update">
        <img src={userPic} alt="userImg" />
        <p className='title-pic'> Upload a new picture </p>
        <div className="update__btn" onClick={() => props.setIsUpdate('avatar')}> <p> Update </p>
          <EditIcon /> 
        </div>
      </div>
      <div className="update">
        <img src={userBg} alt="userBg" />
        <p className='title-pic'> Upload a new wallpaper </p>
        <div className="update__btn" onClick={() => props.setIsUpdate('background')}> <p> Update </p>
          <EditIcon />
        </div>
      </div>
    </>
  )
}

export default UpdatePictures