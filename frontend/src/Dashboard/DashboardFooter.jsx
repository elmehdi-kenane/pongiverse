import React from "react";
import mmaqbourSvg from "./assets/Group5.svg";

import DashSingle from "./DashFooter/DashSingle";
import DashMulty from "./DashFooter/DashMulty";
import DashTourn from "./DashFooter/DashTourn";
const tournamentMatch = () => {
  return (
    <div className="tournament-match__result footer__result">
      <img src={mmaqbourSvg} alt="Player" />
      <p> Semi-Final </p>
      <p> 4th </p>
    </div>
  );
};

function DashboardFooter() {
  return (
    <div className="dashpage__footer dash--space">
      <DashSingle />
      <DashMulty />
      <DashTourn />
    </div>
  );
}

export default DashboardFooter;
