import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const GameCustomizationPreview = ({ setShowPreview, paddleClr, ballClr, tableClr, setIsBlur , isChecked}) => {
    return (
        <div className="customization-preview-container">
            <div className="customization-preview-bg">
                <div className="game-table" style={{ backgroundColor: tableClr }}>
                    <div className="game-paddle left-paddle" style={{ backgroundColor: paddleClr }}>
                    </div>
                    
                    <div className="game-ball" style={{ backgroundColor: ballClr }}>
                        {isChecked && (
                            <div className="game-ball-effect">
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                                <div className="ball"></div>
                            </div>
                        )}
                    </div>
                </div>
            <div className="preview-close-button" onClick={() => {setShowPreview(false); setIsBlur(false)}}>
                <CloseIcon />
            </div>
            </div>

        </div>
    );
};

export default GameCustomizationPreview;