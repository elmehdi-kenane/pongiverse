import React, { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import DashboardContext from "../DashboardWrapper";
import CloseIcon from "@mui/icons-material/Close";
import DashRsltSingle from "./DashRsltSingle";
import DashRsltMulty from "./DashRsltMulty";

function DashResult() {
  const {isGameStats, setIsGameStats } = useContext(AuthContext);
  const {singleId, setSingleId, multyId, setMultyId} = useContext(DashboardContext);

  const closeGameStats = () => {
    setIsGameStats(false);
    singleId && setSingleId(null);
    multyId && setMultyId(null);
  };
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#match-click') && isGameStats)
      closeGameStats();
  });

  return (
    <div className="match-result-ctr">
      <div className="match-result" id="match-click">
        <CloseIcon onClick={closeGameStats} className="match-result__close" />
        { singleId && <DashRsltSingle /> }
        { multyId && <DashRsltMulty /> }
      </div>
    </div>
  );
}

export default DashResult;
