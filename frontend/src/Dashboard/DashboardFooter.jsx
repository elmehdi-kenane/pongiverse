import React from "react";

import DashSingle from "./DashFooter/DashSingle";
import DashMulty from "./DashFooter/DashMulty";
import DashTourn from "./DashFooter/DashTourn";

function DashboardFooter() {
  return (
    <div className="dashpage__footer dash--space">
      <DashSingle />
      <DashMulty />
      <DashTourn items={3} class={"footer__tournament-match"}/>
    </div>
  );
}

export default DashboardFooter;
