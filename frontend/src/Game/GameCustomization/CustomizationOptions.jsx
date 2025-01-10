import React from 'react';
import './GameCustomization.css';


const CustomizationOptions = ({ activeTab, customizations, updateCustomization }) => {
  const options = {
    table: { color: ['green', 'blue', 'black'] },
    paddle: { color: ['red', 'yellow', 'purple'], size: [50, 70, 90] },
    ball: { color: ['white', 'orange', 'pink'], size: [10, 20, 30] },
  };

  const handleChange = (key, value) => {
    updateCustomization(activeTab, key, value);
  };

  return (
    <div className="customization-options">
      {Object.keys(options[activeTab]).map((key) => (
        <div key={key} className="option">
          <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
          <div className="choices">
            {options[activeTab][key].map((choice, index) => (
              <button
                key={index}
                className={`choice ${customizations[activeTab][key] === choice ? 'selected' : ''}`}
                onClick={() => handleChange(key, choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomizationOptions;
