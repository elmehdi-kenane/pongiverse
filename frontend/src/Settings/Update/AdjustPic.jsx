import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext'
import Avatar from 'react-avatar-edit'

function AdjustPic(props) {

  const { dfltPic , setDfltPic} = useContext(AuthContext)

  const { user , userImg, setUserImg} = useContext(AuthContext)
  const [src, setSrc] = useState(null)
  const [preview, setPreview] = useState(dfltPic)

  const UpdatePic = async (updatedPic) => {
    if (updatedPic != dfltPic) {
      console.log('updatedPic ::: ', updatedPic)
      const response = await fetch('http://localhost:8000/profile/updateUserPic', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          image: updatedPic,
        })
      });
      const res = await response.json()
      console.log("response : ", res);
    }
  }


  const handleConfirmClick = () => {
    props.setAdjust(false);
    setDfltPic(preview);
    UpdatePic(preview);
    setUserImg(preview);
  }
  const handleCancelClick = () => {
    props.setAdjust(false);
  }
  const onClose = () => {
    props.setAdjust(false);
  }
  const onCrop = view => {
    setPreview(view);
  }



  return (
    <div className='adjustpic'>
      <div className='adjustpic__img-name'>
        <img src={preview} alt="UserPic" />
        <h1> {user} </h1>
      </div>
      <Avatar
        width={300}
        height={300}
        backgroundColor='#4a258b00'
        closeIconColor='white'
        label="Choose a file"
        labelStyle={{
          fontSize: "18px", cursor: "pointer", padding: "5px", fontWeight: "500",
          color: "white", border: "1px solid white"
        }}
        onClose={onClose}
        onCrop={onCrop}
        src={src}
      />
      <div className='adjustpic__submit'>
        <button onClick={handleCancelClick}> Cancel </button>
        <button onClick={handleConfirmClick}> Confirm </button>
      </div>
    </div>
  )
}

export default AdjustPic
