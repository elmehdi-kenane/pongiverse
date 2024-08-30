import React, { useContext } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import CloseIcon from "@mui/icons-material/Close";

function DashResult() {
  const {isGameStats, setIsGameStats } = useContext(AuthContext);

  const closeGameStats = () => {
    setIsGameStats(false);
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#match-click') && isGameStats)
        setIsGameStats(!isGameStats);
  });
  
  return (
    <div className="match-result-ctr">
      <div className="match-result">
        <CloseIcon onClick={closeGameStats} className="report-close-stats" />
      </div>
    </div>
  );
}

export default DashResult;
