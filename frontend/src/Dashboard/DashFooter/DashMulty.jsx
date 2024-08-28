import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from "../../navbar-sidebar/Authcontext";
import { Link } from "react-router-dom";

const NoResult = () => {
  return (
    <div className="no-result">
        <h3>You haven't participated in a multiplayer match before!</h3>
        <Link to="/mainpage/game/solo/1vs1" className="start-game">
        <p> Play </p>
        <SportsEsportsIcon />
      </Link>
    </div>
  )
}

function DashMulty() {
    const { user } = useContext(AuthContext);
    const [page, setPage] = useState(1);
    const [index, setIndex] = useState(1);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(-1);
    const [matches, setMatches] = useState([]);
    const itemsPerPage = 3;
  
    useEffect(() => {
      const getSingleMatches = async () => {
        setLoading(true)
        try {
          const response = await fetch(
            `http://localhost:8000/profile/getMultiplayerMatches/${user}/${page}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const res = await response.json();
          if (response.ok) {
            setMatches([...matches, ...res.userMatches]);
            !res.hasMoreMatches && setLimit(index);
          } else 
              console.log("Error : ", res.error);
        } catch (error) {
          console.log("Error: ", error);
        }
        setLoading(false)
      };
      if (user)
        getSingleMatches();
    }, [user, page]);


    const Pagination = () => {
      const expandMore = () => {
        setIndex(index + 1);
        index + 1 > page && setPage(page + 1);
      };
      const expandLess = () => {
        index - 1 && setIndex(index - 1);
      };
      return (
        <div className="expand">
          {index != 1 && (
            <ExpandLessIcon className="expand-less" onClick={expandLess} />)}
          {limit != index && (
            <ExpandMoreIcon className="expand-more" onClick={expandMore} />)}
        </div>
      )
    }
    const MatchesResults = () => {
      return (
        <>
            {matches.slice((index - 1) * itemsPerPage, index * itemsPerPage)
              .map((match, key) => (
                  <div key={key} className="multiplayer-match__result footer__result">
                      <div className="multiplayer-pics">
                          <img src={match.p1Pic1} alt="Player" />
                          <img src={match.p1Pic2} alt="Player" />
                      </div>
                      <div className="middle-side">
                          <p> {match.score} </p>
                      </div>
                      <div className="multiplayer-pics">
                          <img src={match.p2Pic1} alt="Player" />
                          <img src={match.p2Pic2} alt="Player" />
                      </div>
                  </div>
              ))
            }
            <Pagination />
          </>
      )
    }

    return (
      <div className="footer__multiplayer-match dash--bkborder">
        <h1 className="footer__titles"> Multiplayer Match </h1>
        {loading ? 
          <CircularProgress color="secondary" style={{marginTop:"80px"}}/>
        :
          <> {matches.length ? <MatchesResults/> : <NoResult />} </>
        }
      </div>
    );
  }

export default DashMulty



