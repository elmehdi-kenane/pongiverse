import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const GameCustomizationPreview = ({ setShowPreview, paddleClr, ballClr, tableClr, setIsBlur }) => {
    return (
        <div className="customization-preview-container">
            <div className="customization-preview-bg">
                <div className="game-table" style={{ backgroundColor: tableClr }}>
                    <div className="game-paddle left-paddle" style={{ backgroundColor: paddleClr }}>
                    </div>
                    
                    <div className="game-ball" style={{ backgroundColor: ballClr }}>
                    </div>
                </div>
            </div>

            <div className="preview-close-button" onClick={() => {setShowPreview(false); setIsBlur(false)}}>
                <CloseIcon />
            </div>
        </div>
    );
};

export default GameCustomizationPreview;