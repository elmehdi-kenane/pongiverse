import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from "../../navbar-sidebar/Authcontext";
import { Link, useNavigate } from "react-router-dom";
import DashboardContext from "../DashboardWrapper";

const NoResult = () => {
  return (
    <div className="no-result">
      <h3>You haven't participated in a multiplayer match before!</h3>
      <Link to="/mainpage/game/solo/2vs2" className="start-game">
        <p> Play </p>
        <SportsEsportsIcon />
      </Link>
    </div>
  )
}

function DashMulty() {
  const { user, setIsGameStats } = useContext(AuthContext);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(-1);
  const [matches, setMatches] = useState([]);
  const itemsPerPage = 3;

  useEffect(() => {
    const getMultyMatches = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getMultiplayerMatches/${page}`,
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
      getMultyMatches();
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
    const { setMultyId } = useContext(DashboardContext);
    const showMatchResult = (matchId) => {
      setMultyId(matchId)
      setIsGameStats(true);
    }
    return (
      <>
        {matches.slice((index - 1) * itemsPerPage, index * itemsPerPage)
          .map((match, key) => (
            <div key={key} className="multiplayer-match__result footer__result" id="match-click" onClick={() => showMatchResult(match.id)}>
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
    <div className="footer__multiplayer-match purple--glass">
      <h1 className="footer__titles"> Multiplayer Match </h1>
      {loading ?
        <CircularProgress color="secondary" style={{ marginTop: "80px" }} />
        :
        <> {matches.length ? <MatchesResults /> : <NoResult />} </>
      }
    </div>
  );
}

export default DashMulty



