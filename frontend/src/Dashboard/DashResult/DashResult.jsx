import React, { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import DashboardContext from "../DashboardWrapper";
import CloseIcon from "@mui/icons-material/Close";

function DashResult() {
  const {isGameStats, setIsGameStats } = useContext(AuthContext);
  const {singleId, setSingleId, multyId, setMultyId} = useContext(DashboardContext);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#match-click') && isGameStats){  
      setIsGameStats(!isGameStats);
      singleId && setSingleId(null);
      multyId && setMultyId(null);
    }
  });
  
  const closeGameStats = () => {
    setIsGameStats(false);
    singleId && setSingleId(null);
    multyId && setMultyId(null);
  };

  return (
    <div className="match-result-ctr">
      <div className="match-result" id="match-click">
        <CloseIcon onClick={closeGameStats} className="report-close-stats" />
        {/* <h1> ID:{singleId && singleId} </h1>
        <h1> ID:{multyId && multyId} </h1> */}
      </div>
    </div>
  );
}

export default DashResult;
