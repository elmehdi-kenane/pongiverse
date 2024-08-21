import React, { useContext, useEffect, useState } from "react";
import idabligiSvg from "../assets/Group2.svg";
import AgouzouSvg from "../assets/Group3.svg";
import Pagination from "../helpers/Pagination";

import AuthContext from "../../navbar-sidebar/Authcontext";

function DashSingle() {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const getSingleMatches = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/profile/getSingleMatches/${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok)
            setMatches(res.userMatches);
        else
            console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    // if (user)
    //     getSingleMatches();
  }, [user]);

  return (
    <div className="footer__single-match dash--bkborder">
      <h1 className="footer__titles"> Single Match </h1>
      <div className="single-match__result footer__result">
        <img src={idabligiSvg} alt="Player" />
        <p> 5 - 3 </p>
        <img src={AgouzouSvg} alt="Player" />
      </div>
      <div className="single-match__result footer__result">
        <img src={idabligiSvg} alt="Player" />
        <p> 5 - 3 </p>
        <img src={AgouzouSvg} alt="Player" />
      </div>
      <div className="single-match__result footer__result">
        <img src={idabligiSvg} alt="Player" />
        <p> 5 - 3 </p>
        <img src={AgouzouSvg} alt="Player" />
      </div>
      <Pagination />
    </div>
  );
}

export default DashSingle;
