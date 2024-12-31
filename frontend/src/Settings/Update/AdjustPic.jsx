import React, { useState, useContext, useEffect } from 'react'
import Avatar from 'react-avatar-edit'
import AuthContext from '../../navbar-sidebar/Authcontext'
import SettingsContext from '../SettingsWrapper'

function AdjustPic(props) {

  const { user, setUserImg } = useContext(AuthContext)
  const { userPic, setUserPic, notifySuc, notifyErr} = useContext(SettingsContext);

  const [src, setSrc] = useState(null)
  const [preview, setPreview] = useState(userPic)
  const [check, setCheck] = useState(userPic)

  const UpdatePic = async (updatedPic) => {
    try {
      const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/updateUserPic`, {
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
      if (response.ok) {
        notifySuc(res.case);
        setUserPic(preview); // SettingsContext
        setUserImg(preview); // AuthContext
      } else if (response.status === 401) {
        navigate("/signin");
      }
      else
        notifyErr(res.error);
    } catch (error) {
      notifyErr(error);
      console.log(error);
    }
  }

  const onCrop = view => {
    setPreview(view);
  }
  const onClose = () => {
    props.setAdjust(false);
  }
  const handleConfirmClick = () => {
    if (preview != check)
      UpdatePic(preview);
    props.setAdjust(false);
  }
  const handleCancelClick = () => {
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
          color: "white", border: "1px solid white", borderRadius: "5px"
        }}
        onClose={onClose}
        onCrop={onCrop}
        src={src}
      // cropRadius={50}
      />
      <div className='adjustpic__submit'>
        <button onClick={handleCancelClick}> Cancel </button>
        <button onClick={handleConfirmClick}> Confirm </button>
      </div>
    </div>
  )
}

export default AdjustPic
