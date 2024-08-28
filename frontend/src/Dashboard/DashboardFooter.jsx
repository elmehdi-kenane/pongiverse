import React from "react";
import mmaqbourSvg from "./assets/Group5.svg";

import Pagination from "./helpers/Pagination";
import DashSingle from "./DashFooter/DashSingle";
import DashMulty from "./DashFooter/DashMulty";


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
      <div className="footer__tournament-match dash--bkborder">
        <h1 className="footer__titles"> Tournament Match </h1>
        {tournamentMatch()}
        {tournamentMatch()}
        {tournamentMatch()}
        <Pagination />
      </div>
    </div>
  );
}

export default DashboardFooter;
