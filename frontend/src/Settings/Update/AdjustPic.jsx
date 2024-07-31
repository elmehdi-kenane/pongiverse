import React, { useState, useContext, useEffect } from 'react'
import Avatar from 'react-avatar-edit'
import AuthContext from '../../navbar-sidebar/Authcontext'
import ProfileContext from '../../Profile/ProfileWrapper'

function AdjustPic(props) {

  const { user } = useContext(AuthContext)
  const { userPic, setUserPic } = useContext(ProfileContext);

  const [src, setSrc] = useState(null)
  const [preview, setPreview] = useState(userPic)
  const [check, setCheck] = useState(userPic)

  const UpdatePic = async (updatedPic) => {
    try {
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
      if (response.ok){
        // console.log(res.case);
        setUserPic(preview);
      }
      else
        console.log(res.error);
    } catch (error) {
      console.log(error);
    }
  }

  const handleConfirmClick = () => {
    if (preview != check)
      UpdatePic(preview);
    props.setAdjust(false);
  }
  const onCrop = view => {
    setPreview(view);
  }
  const handleCancelClick = () => {
    props.setAdjust(false);
  }
  const onClose = () => {
    props.setAdjust(false);
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
          fontSize: "15px", cursor: "pointer", padding: "5px", fontWeight: "500",
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