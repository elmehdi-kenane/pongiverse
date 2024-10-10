import React, { useState, useContext, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function UpdateAvatar(props) {
  const { user, setUserImg } = useContext(AuthContext);
  const { userPic, setUserPic, notifySuc, notifyErr } = useContext(SettingsContext);

  const [avatar, setAvatar] = useState(null);
  const [scale, setScale] = useState(1.2); // Initial zoom level
  const editorRef = useRef(null);

  const UpdatePic = async (updatedPic) => {
    try {
      const response = await fetch("http://localhost:8000/profile/updateUserPic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          image: updatedPic,
        }),
      });
      const res = await response.json();
      if (response.ok) {
        notifySuc(res.case);
        setUserPic(updatedPic);
        setUserImg(updatedPic);
      } else {
        notifyErr(res.error);
      }
    } catch (error) {
      notifyErr(error);
      console.log(error);
    }
  };

  const handleConfirmClick = () => {
    const canvas = editorRef.current.getImage();
    const croppedImage = canvas.toDataURL(); // Get the cropped image data URL
    
    UpdatePic(croppedImage);
    props.setAdjust(false);
  };

  const handleCancelClick = () => {
    props.setAdjust(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      notifyErr('Please select a JPEG or PNG file.');
    }
  };

  return (
    <div className="adjustpic">
      <h2> Update Avatar </h2>
      {!avatar && 
        <label className="custom-file-upload">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <CloudUploadIcon />
          Choose File
        </label>
      }
      {avatar && (
        <div className="avatarEditor">
          <AvatarEditor
            ref={editorRef}
            image={avatar}
            width={250}
            height={250}
            border={50}
            color={[0, 0, 0, 0.6]} // RGBA
            scale={scale} // Use state for scale
            rotate={0}
          />
          <div className="zoomscale">
            <label htmlFor="zoom">Zoom:</label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={2}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))} // Update scale on change
            />
          </div>
        </div>
      )}
      <div className="adjustpic__submit">
        <button onClick={handleCancelClick}>Cancel</button>
        {avatar ? <button onClick={handleConfirmClick}>Confirm</button> :
          <button className="submit__not-allowed">Confirm</button>
        }
      </div>
    </div>
  );
}

export default UpdateAvatar;