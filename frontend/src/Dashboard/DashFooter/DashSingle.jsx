import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from "../../navbar-sidebar/Authcontext";
import DashboardContext from "../DashboardWrapper";
import { Link, useNavigate } from "react-router-dom";

const NoResult = () => {
  return (
    <div className="no-result">
      <h3>You haven't participated in a single match before!</h3>
      <Link to="/mainpage/game/solo/1vs1" className="start-game">
        <p> Play </p>
        <SportsEsportsIcon />
      </Link>
    </div>
  )
}

function DashSingle() {
  const { user, setIsGameStats } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(-1);
  const [matches, setMatches] = useState([]);
  const itemsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const getSingleMatches = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getSingleMatches/${user}/${page}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok) {
          setMatches([...matches, ...res.userMatches]);
          !res.hasMoreMatches && setLimit(index);
        } else if (response.status === 401)
          navigate('/signin')
        else
          console.error("Error : ", res.error);
      } catch (error) {
        console.error("Error: ", error);
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
          <ExpandLessIcon onClick={expandLess} />)}
        {limit != index && (
          <ExpandMoreIcon onClick={expandMore} />)}
      </div>
    )
  }
  const MatchesResults = () => {
    const { setSingleId } = useContext(DashboardContext);
    const showMatchResult = (matchId) => {
      setSingleId(matchId)
      setIsGameStats(true);
    }
    return (
      <>
        {matches.slice((index - 1) * itemsPerPage, index * itemsPerPage)
          .map((match, key) => (
            <div key={key} className="single-match__result footer__result" onClick={() => showMatchResult(match.id)} id="match-click">
              <img src={match.pic1} alt="Player" />
              <p>{match.score}</p>
              <img src={match.pic2} alt="Player" />
            </div>
          ))
        }
        <Pagination />
      </>
    )
  }

  return (
    <div className="footer__single-match purple--glass">
      <h1 className="footer__titles"> Single Match </h1>
      {loading ?
        <CircularProgress color="secondary" style={{ marginTop: "80px" }} />
        :
        <> {matches.length ? <MatchesResults /> : <NoResult />} </>
      }
    </div>
  );
}

export default DashSingle;
