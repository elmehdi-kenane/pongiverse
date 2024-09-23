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
      if (response.ok) {
        notifySuc(res.case);
        setUserPic(preview); // SettingsContext
        setUserImg(preview); // AuthContext
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




// import React, { useState, useContext, useRef } from 'react';
// import AvatarEditor from 'react-avatar-editor';
// import AuthContext from '../../navbar-sidebar/Authcontext';
// import SettingsContext from '../SettingsWrapper';

// function AdjustPic(props) {
//   const { user, setUserImg } = useContext(AuthContext);
//   const { userPic, setUserPic, notifySuc, notifyErr } = useContext(SettingsContext);

//   const [src, setSrc] = useState(null);
//   const [preview, setPreview] = useState(userPic);
//   const [check, setCheck] = useState(userPic);
//   const editorRef = useRef(null);

//   const UpdatePic = async (updatedPic) => {
//     try {
//       const response = await fetch('http://localhost:8000/profile/updateUserPic', {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           user: user,
//           image: updatedPic,
//         })
//       });
//       const res = await response.json();
//       if (response.ok) {
//         notifySuc(res.case);
//         setUserPic(preview); // SettingsContext
//         setUserImg(preview); // AuthContext
//       } else {
//         notifyErr(res.error);
//       }
//     } catch (error) {
//       notifyErr(error);
//       console.log(error);
//     }
//   };

//   const handleCrop = () => {
//     if (editorRef.current) {
//       const canvas = editorRef.current.getImage();
//       const croppedImage = canvas.toDataURL(); // Get the cropped image data URL
//       setPreview(croppedImage);
//     }
//   };

//   const onClose = () => {
//     props.setAdjust(false);
//   };

//   const handleConfirmClick = () => {
//     if (preview !== check) {
//       UpdatePic(preview);
//     }
//     props.setAdjust(false);
//   };

//   const handleCancelClick = () => {
//     props.setAdjust(false);
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setSrc(reader.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       alert('Please select a JPEG or PNG file.');
//     }
//   };

//   return (
//     <div className='adjustpic'>
//       <div className='adjustpic__img-name'>
//         <img src={preview} alt="UserPic" />
//         <h1>{user}</h1>
//       </div>
//       <input type="file" accept="image/*" onChange={handleFileChange} />
//       {src && (
//         <AvatarEditor
//           ref={editorRef}
//           image={src}
//           width={300}
//           height={300}
//           border={50}
//           borderRadius={150}
//           color={[255, 255, 255, 0.6]} // RGBA
//           scale={1.2}
//           rotate={0}
//         />
//       )}
//       <div className='adjustpic__submit'>
//         <button onClick={handleCancelClick}>Cancel</button>
//         <button onClick={handleCrop} onClick={handleConfirmClick}>Confirm</button>
//       </div>
//     </div>
//   );
// }

// export default AdjustPic;