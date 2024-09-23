// import React, { useState, useContext } from 'react'
// import AuthContext from '../../navbar-sidebar/Authcontext';
// import EditIcon from '@mui/icons-material/Edit';
// import SettingsContext from '../SettingsWrapper';

// function UpdatePic(props) {

//   const { user } = useContext(AuthContext)
//   const { userPic, userBg, setUserBg, notifySuc, notifyErr } = useContext(SettingsContext)

//   const convertToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const fileReader = new FileReader();
//       fileReader.readAsDataURL(file);
//       fileReader.onload = () => {
//         resolve(fileReader.result);
//       };
//       fileReader.onerror = (error) => {
//         reject(error);
//       };
//     });
//   };

//   const UpdateBgPic = async (event) => {
//     if (event.target.files && event.target.files[0]) {
//       const newBg = event.target.files[0];
//       const base64Bg = await convertToBase64(newBg);
//       try {
//         const response = await fetch('http://localhost:8000/profile/updateUserBg', {
//           method: "POST",
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user: user,
//             image: base64Bg,
//           })
//         });
//         const res = await response.json()
//         if (response.ok){
//           notifySuc(res.case);
//           setUserBg(base64Bg);
//         }
//         else
//           notifyErr(res.error);
//       } catch (error) {
//         notifyErr(error);
//         console.error(error);
//       }
//     }
//   }

//   return (
//     <div>
//       <div className="update">
//         <img src={userPic} alt="userImg" />
//         <p className='title-pic'> Upload a new picture </p>
//         <div className="update__btn" onClick={() => props.setAdjust(true)}> <p> Update </p>
//           <EditIcon /> 
//         </div>
//       </div>
//       <div className="update">
//         <img src={userBg} alt="userBg" />
//         <p className='title-pic'> Upload a new walppaper </p>
//         <div className="update__btn" onClick={() => document.getElementById('fileInput').click()}> <p> Update </p>
//           <EditIcon />
//           <input
//             id="fileInput"
//             type="file"
//             accept="image/*"
//             onChange={UpdateBgPic}
//             style={{ display: 'none' }}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UpdatePic


import React, { useState, useContext } from 'react';
import AuthContext from '../../navbar-sidebar/Authcontext';
import EditIcon from '@mui/icons-material/Edit';
import SettingsContext from '../SettingsWrapper';
import AvatarEditor from 'react-avatar-editor';

function UpdatePic(props) {
  const { user } = useContext(AuthContext);
  const { userPic, userBg, setUserBg, notifySuc, notifyErr } = useContext(SettingsContext);

  const [file, setFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setShowEditor(true);
    }
  };

  const handleCrop = async () => {
    if (editor) {
      const canvas = editor.getImage();
      const base64Bg = canvas.toDataURL();
      
      try {
        const response = await fetch('http://localhost:8000/profile/updateUserBg', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user,
            image: base64Bg,
          })
        });
        const res = await response.json();
        if (response.ok) {
          notifySuc(res.case);
          setUserBg(base64Bg);
        } else {
          notifyErr(res.error);
        }
      } catch (error) {
        notifyErr(error);
        console.error(error);
      }

      setShowEditor(false);
      setFile(null);
    }
  };

  return (
    <div>
      <div className="update">
        <img src={userPic} alt="userImg" />
        <p className='title-pic'>Upload a new picture</p>
        <div className="update__btn" onClick={() => props.setAdjust(true)}>
          <p>Update</p>
          <EditIcon />
        </div>
      </div>
      <div className="update">
        <img src={userBg} alt="userBg" />
        <p className='title-pic'>Upload a new wallpaper</p>
        <div className="update__btn" onClick={() => document.getElementById('fileInput').click()}>
          <p>Update</p>
          <EditIcon />
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      {showEditor && (
        <div>
          <AvatarEditor
            ref={setEditor}
            image={URL.createObjectURL(file)}
            width={250}
            height={250}
            border={50}
            borderRadius={125}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={1.2}
            rotate={0}
          />
          <button onClick={handleCrop}>Crop & Upload</button>
        </div>
      )}
    </div>
  );
}

export default UpdatePic;