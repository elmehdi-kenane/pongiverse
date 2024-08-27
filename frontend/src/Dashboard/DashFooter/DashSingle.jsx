import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

import AuthContext from "../../navbar-sidebar/Authcontext";
import { Link } from "react-router-dom";

function DashSingle() {
  const { user } = useContext(AuthContext);

  const [page, setPage] = useState(1)
  const [index, setIndex] = useState(1)
  const [limit, setLimit] = useState(-1)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const getSingleMatches = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/profile/getSingleMatches/${user}/${page}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok){
          setMatches([...matches, ...res.userMatches]);
          !res.hasMoreMatches && setLimit(index)
        }
        else
            console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    if (user)
        getSingleMatches();
  }, [user, page]);

  const ExpandMore = () => {
    setIndex(index+1);
    index + 1 > page && setPage(page+1)
    console.log("Index is:", index+1)
  }
  const ExpandLess = () => {
    index-1 && setIndex(index-1);
    console.log(index);
  }

  const itemsPerPage = 3;
  return (
    <div className="footer__single-match dash--bkborder">
      <h1 className="footer__titles"> Single Match </h1>
      {matches.length ? matches
      .slice((index - 1) * itemsPerPage, (index) * itemsPerPage)
      .map((match, key) => (
        <div key={key} className="single-match__result footer__result">
          <img src={match.pic1} alt="Player" />
          <p>{match.score}</p>
          <img src={match.pic2} alt="Player" />
        </div>
      )): <div className="no-result"> 
            <h3>You haven't participate in a Single Match before!</h3>
            <Link to="/mainpage/game/solo/1vs1" className="start-game"> 
              <p> Play </p>
              <SportsEsportsIcon />
             </Link>
          </div> }
      <div className="expand">
        {index != 1 &&
          <ExpandLessIcon className="expand-less" onClick={ExpandLess}/>}
        {limit != index &&
          <ExpandMoreIcon className="expand-more" onClick={ExpandMore}/>}
      </div>
    </div>
  );
}

export default DashSingle;
