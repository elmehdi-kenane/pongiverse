import React, { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import DashboardContext from "../DashboardWrapper";
import CloseIcon from "@mui/icons-material/Close";
import DashRsltSingle from "./DashRsltSingle";
import DashRsltMulty from "./DashRsltMulty";
import DashRsltTourn from "./DashRsltTourn";

function DashResult() {
  const {isGameStats, setIsGameStats } = useContext(AuthContext);
  const {singleId, setSingleId, multyId, setMultyId, tournId, setTournId} = useContext(DashboardContext);

  const closeGameStats = () => {
    setIsGameStats(false);
    singleId && setSingleId(null);
    multyId && setMultyId(null);
    tournId && setTournId(null);
  };
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#match-click') && isGameStats)
      closeGameStats();
  });

  return (
    <div className="match-result-ctr">
      <div className={!tournId ? `match-result` : `match-result tourn-result`} id="match-click">
        <CloseIcon onClick={closeGameStats} className="match-result__close" />
        { singleId && <DashRsltSingle /> }
        { multyId && <DashRsltMulty /> }
        { tournId && <DashRsltTourn /> }
      </div>
    </div>
  );
}

export default DashResult;
