import React, { useContext, useEffect, useState } from 'react'
import AvatarSvg from "../../assets/Profile/avatar.png"
import ProfileContext from "../ProfileWrapper"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

function ProfileUserGames1vs1() {
  const { userId } = useContext(ProfileContext);
  const [userGames, setUserGames] = useState([])
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);
  const [limit, setLimit] = useState(-1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getUserMatches = async (page, index) => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUserMatches1vs1/${userId}/${page}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const res = await response.json()
      if (response.ok) {
        (page === 1) ? setUserGames(res.data) : setUserGames([...userGames, ...res.data])
        !res.hasMoreMatches && setLimit(index);
        //console.log("Data :", res.data);
      }
      else if (response.status === 401) {
        navigate("/signin");
      }
    } catch (error) {
     console.log("Error: ", error);
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      setPage(1);
      setIndex(1);
      setLimit(-1);
      getUserMatches(1, 1)
    }
  }, [userId])

  const Pagination = () => {
    const expandMore = () => {
      setIndex(index + 1);
      if (index + 1 > page) {
        getUserMatches(page + 1, index + 1)
        setPage(page + 1);
      }
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


  return (
    <>
      {loading ?
        <CircularProgress color="secondary" style={{ marginTop: "120px" }} />
        :
        <>
          {userGames.slice((index - 1) * itemsPerPage, index * itemsPerPage)
            .map((match, key) => {
              return (
                <div className="match__states" key={key}>
                  <div className='match__dtl match--players'>
                    <img src={match.pic1} alt="playerImg" onClick={() => navigate(`/mainpage/profile/${match.user1}`)} />
                    <img src={match.pic2} alt="playerImg" onClick={() => navigate(`/mainpage/profile/${match.user2}`)} />
                  </div>
                  <div className='match__dtl match--date'>
                    <p> {match.time} </p>
                    <p> {match.date} </p>
                  </div>
                  <p className='match__dtl'> {match.score} </p>
                  <p className='match__dtl'> {match.hit1} - {match.hit2} </p>
                  <p className='match__dtl'> {match.acc1} - {match.acc2} </p>
                  <p className='match__dtl'> {match.exp1} - {match.exp2} </p>
                </div>
              )
            })}
        </>
      }
      <Pagination />
    </>
  )
}

export default ProfileUserGames1vs1
