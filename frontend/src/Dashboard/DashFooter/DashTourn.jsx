import React, { useContext, useEffect, useState } from "react";
import AvatarSvg from "../../assets/Profile/Group.svg";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AuthContext from "../../navbar-sidebar/Authcontext";
import DashboardContext from "../DashboardWrapper";

const tournamentMatch = () => {
  return (
    <div className="tournament-match__result footer__result">
      <img src={AvatarSvg} alt="Player" />
      <p> Semi-Final </p>
      <p> 4th </p>
    </div>
  );
};

function DashTourn() {
  const { user, setIsGameStats } = useContext(AuthContext);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getTournMatches = async () => {
      try {
        const response = await fetch(
          `htttp://${import.meta.env.VITE_IPADDRESS}:8000/profile/getTournMatches/${user}/${page}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok) {
          console.log("Tournament Data: ", res.data);
        }
        else
          console.error("Tournament Error: ", res.error);
      } catch (error) {
        console.error("Tournament Error: ", error);
      }
    }

    if (user){
      // getTournMatches()
    }
  }, [user])

  return (
    <div className="footer__tournament-match purple--glass">
      <h1 className="footer__titles"> Tournament Match </h1>
      {tournamentMatch()}
      {tournamentMatch()}
      {tournamentMatch()}
    </div>
  );
}

export default DashTourn;












{/* <div className="expand expand-despire">
  <ExpandLessIcon className="expand-less" />
  <ExpandMoreIcon className="expand-more" />
</div> */}