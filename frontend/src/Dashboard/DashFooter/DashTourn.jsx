import React from 'react'
import mmaqbourSvg from "../assets/Group5.svg";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const tournamentMatch = () => {
    return (
      <div className="tournament-match__result footer__result">
        <img src={mmaqbourSvg} alt="Player" />
        <p> Semi-Final </p>
        <p> 4th </p>
      </div>
    );
  };

function DashTourn() {
  return (
    <div className="footer__tournament-match purple--glass">
        <h1 className="footer__titles"> Tournament Match </h1>
        {tournamentMatch()}
        {tournamentMatch()}
        {tournamentMatch()}
        <div className="expand expand-despire">
        <ExpandLessIcon className="expand-less" />
        <ExpandMoreIcon className="expand-more" />
        </div>
    </div>
  )
}

export default DashTourn
