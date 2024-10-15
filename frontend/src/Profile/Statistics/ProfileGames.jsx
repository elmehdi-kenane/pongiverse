import React, { useContext, useEffect, useState } from 'react'
import mavSvg from "../../assets/Profile/Group.svg"
import ProfileContext from "../ProfileWrapper"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from '@mui/material/CircularProgress';

const MatchHeaderStates = () => {
  const matchHeader = ["Matches", "Date", "Score", "Hit", "Accuracy", "Rating"]
  
  return (
    <div className="match__states head--height">
      {matchHeader.map((state, key) => {
          return (
            <h4 key={key} className="match__head"> {state} </h4>
          )
        }
      )}
    </div>
  )
}

function ProfileGames() {
  const {userId} = useContext(ProfileContext);
  const [userGames, setUserGames] = useState([])
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);
  const [limit, setLimit] = useState(-1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);

  
  useEffect(()=> {
    const GetUserMatches = async () => {
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/profile/getUserMatches1vs1/${userId}/${page}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const res = await response.json()
        if (response.ok){
          setUserGames([...userGames, ...res.data])
          !res.hasMoreMatches && setLimit(index);
          // console.log("Data :", res.data);
        }
        else 
        console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }      
      setLoading(false)
    }
    if (userId)
      GetUserMatches()
  }, [userId, page])

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

  const MatchStates = () => {
    return (
      <>
      {loading ? 
        <CircularProgress color="secondary" style={{marginTop:"120px"}}/>
        :
        <>
          {userGames.slice((index-1) * itemsPerPage, index * itemsPerPage)
            .map((match, key)=> {
              return (
                <div className="match__states" key={key}>
                  <div className='match__dtl match--players'> 
                    <img src={match.pic1} alt="playerImg" />
                    <img src={match.pic2} alt="playerImg" />
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

  return (
    <div className='userstate_matches purple--glass'>
        <div className='userstate-header'><h1> Match History </h1> </div>
        <MatchHeaderStates />
        <MatchStates />
      </div>
  )
}

export default ProfileGames