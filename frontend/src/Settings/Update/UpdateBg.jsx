import React, { useState, useContext, useRef } from 'react'
import AvatarEditor from "react-avatar-editor";
import AuthContext from '../../navbar-sidebar/Authcontext';
import SettingsContext from '../SettingsWrapper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';


function UpdateBg(props) {
  const { user } = useContext(AuthContext);
  const { setUserBg, notifySuc, notifyErr } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [bgrd, setBg] = useState(null);
  const [scale, setScale] = useState(1.2);
  const editorRef = useRef(null);
  const [isClicked, setIsClicked] = useState(false)
  const width = window.innerWidth <= 768 ? true : false;
  const [widthTab, setWidthTab] = useState(width);

  const UpdateBg = async () => {
    const canvas = editorRef.current.getImage();
    const updatedPic = canvas.toDataURL(); // Get the cropped image data URL

    setIsClicked(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/updateUserBg`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: updatedPic,
        }),
      });
      const res = await response.json();
      if (response.ok) {
        notifySuc(res.case);
        setUserBg(updatedPic);
      } else if (response.status === 401) {
        navigate('/signin');
      }
       else {
        notifyErr(res.error);
      }
    } catch (error) {
      notifyErr(error);
      console.error(error);
    }
    props.setAdjust(false);
  };

  const handleCancelClick = () => {
    props.setAdjust(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      if (file.size > 5 * 1024 * 1024) {
        notifyErr('File size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBg(reader.result);
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
      <h2> Update Wallpaper </h2>
      {!bgrd && 
        <label className="custom-file-upload">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <CloudUploadIcon />
          Choose File
        </label>
      }
      {bgrd && (
        <div className="avatarEditor">
          {!widthTab ?
            <AvatarEditor
            ref={editorRef}
            image={bgrd}
            width={400}
            height={200}
            border={30}
            color={[0, 0, 0, 0.6]} // RGBA
            scale={scale} // Use state for scale
            rotate={0}
            />
        :
            <AvatarEditor
            ref={editorRef}
            image={bgrd}
            width={200}
            height={100}
            border={10}
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
        {(bgrd && !isClicked) ? <button onClick={UpdateBg}>Confirm</button> :
          <button className="submit__not-allowed">Confirm</button>
        }
      </div>
    </div>
  );
}

export default UpdateBg