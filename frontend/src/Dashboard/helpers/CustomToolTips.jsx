import React from 'react';
import './CustomTooltip.css';

const CustomToolTips = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Day: ${label}`}</p>
        <p className="wins-label">Wins: {payload[0].value}</p>
        <p className="lost-label">Lost: {payload[1].value}</p>
      </div>
    );
  }

  return null;
};

export default CustomToolTips;