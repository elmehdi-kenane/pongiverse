import React, { useState, useContext, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function UpdateAvatar(props) {
  const { user, setUserImg } = useContext(AuthContext);
  const { userPic, setUserPic, notifySuc, notifyErr } = useContext(SettingsContext);

  const [avatar, setAvatar] = useState(null);
  const [widthTab, setWidthTab] = useState(false);
  const [isClicked, setIsClicked] = useState(false)
  const [scale, setScale] = useState(1.2); // Initial zoom level
  const editorRef = useRef(null);

  const UpdatePic = async () => {
    const canvas = editorRef.current.getImage();
    const updatedPic = canvas.toDataURL(); // Get the cropped image data URL
    
    setIsClicked(true);
    try {
      const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/updateUserPic`, {
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
    props.setAdjust(false);
  };

  const handleCancelClick = () => {
    props.setAdjust(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      if (file.size > 5 * 1024 * 1024) { // Check file size (5MB = 5 * 1024 * 1024 bytes)
        notifyErr('File size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    } else
        notifyErr('Please select a JPEG or PNG file.');
  };

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768)
      setWidthTab(true)
    else
      setWidthTab(false)
  });

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
          {!widthTab ?
            <AvatarEditor
              ref={editorRef}
              image={avatar}
              width={150}
              height={150}
              border={50}
              color={[0, 0, 0, 0.6]} // RGBA
              scale={scale} // Use state for scale
              rotate={0}
            /> :
            <AvatarEditor
              ref={editorRef}
              image={avatar}
              width={75}
              height={75}
              border={50}
              color={[0, 0, 0, 0.6]} // RGBA
              scale={scale} // Use state for scale
              rotate={0}
            />
          }
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
        {(avatar && !isClicked) ? <button onClick={UpdatePic}>Confirm</button> :
          <button className="submit__not-allowed">Confirm</button>
        }
      </div>
    </div>
  );
}

export default UpdateAvatar;