import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CircularProgress from '@mui/material/CircularProgress';
import DashboardContext from "../DashboardWrapper";
import { Link, useNavigate } from "react-router-dom";
import { use } from "react";

const NoResult = () => {
  return (
    <div className="no-result">
      <h3>You haven't participated in a tournament match before!</h3>
      <Link to="/mainpage/game/jointournament" className="start-game">
        <p> Play </p>
        <SportsEsportsIcon />
      </Link>
    </div>
  )
}

function DashTourn(props) {
  const { user, setIsGameStats } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(-1);
  const [matches, setMatches] = useState([]);
  const itemsPerPage = props.items;
  const navigate = useNavigate();

  useEffect(() => {
    const getTournMatches = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getTournMatches/${page}/${itemsPerPage}`,
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
          setMatches([...matches, ...res.data]);
          !res.hasMoreMatches && setLimit(index);
          //console.log("Tournament Data: ", res.data);
        } else if (response.status === 401)
          navigate('/signin')
        else
          console.error("Tournament Error: ", res.error);
      } catch (error) {
        console.error("Tournament Error:  ", error);
      }
    }

    if (user) {
      getTournMatches()
    }
  }, [user, page])


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

    const { setTournId } = useContext(DashboardContext);
    const showMatchResult = (matchId) => {
      setTournId(matchId);
      setIsGameStats(true);
    }

    return (
      <>
        {matches.slice((index - 1) * itemsPerPage, index * itemsPerPage)
          .map((match, key) => {
            return (
              <div className="tournament-match__result footer__result" key={key} onClick={() => showMatchResult(match.tourId)} id="match-click">
                <img src={match.pic} alt="Player" />
                <p> {match.type} </p>
              </div>
            )
          })}
        <Pagination />
      </>
    )
  }

  return (
    <div className={`${props.class} purple--glass`}>
      <h1 className="footer__titles"> Tournament Match </h1>
      {loading ?
        <CircularProgress color="secondary" style={{ marginTop: "80px" }} />
        :
        <> {matches.length ? <MatchesResults /> : <NoResult />} </>
      }
    </div>
  );
}

export default DashTourn;











