
import React from "react";
import CloseIcon from "@mui/icons-material/Close";


const BlockPopUp = ({ setShowBlockPopup, blockUser }) => {
    return (
        <div className="blockPopUp">
        <div className="blockPopUp__container">
            <div className="blockPopUp__header">
            <h3>Block User</h3>
            <button onClick={() => setShowBlockPopup(false)}>
                <CloseIcon />
            </button>
            </div>
            <div className="blockPopUp__body">
            <p>Are you sure you want to block this user?</p>
            </div>
            <div className="blockPopUp__footer">
            <button onClick={() => setShowBlockPopup(false)}>Cancel</button>
            <button onClick={blockUser}>Block</button>
            </div>
        </div>
        </div>
    );
    }
export default BlockPopUp;