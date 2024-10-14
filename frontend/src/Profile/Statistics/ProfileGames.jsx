import React, { useContext, useEffect, useState } from 'react'
import mavSvg from "../../assets/Profile/Group.svg"
import ProfileContext from "../ProfileWrapper"


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

  const MatchStates = () => {
    return (
      <>
        {userGames.map((match, key)=> {
          return (
            <div className="match__states" key={key}>
              <div className='match__dtl match--players'> 
                <img src={match.pic1} alt="playerImg" />
                <img src={match.pic2} alt="playerImg" />
              </div>
              <div className='match__dtl match--date'> 
                <p> 15:01 </p>
                <p> 11/09/2001 </p>
              </div>
              <p className='match__dtl'> {match.score} </p>
              <p className='match__dtl'> {match.hit1} - {match.hit2} </p>
              <p className='match__dtl'> {match.acc1} - {match.acc2} </p>
              <p className='match__dtl'> {match.exp1} - {match.exp2} </p>
            </div>
          )
        })}
      </>
    )
  }

  useEffect(()=> {
    const GetUserMatches = async () => {
      try {
        const response = await fetch(`http://localhost:8000/profile/getUserMatches1vs1/${userId}/${1}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const res = await response.json()
        if (response.ok){
          setUserGames(res.data)
          console.log("Data :", res.data);
        }
        else 
          console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }      
    }
    if (userId)
      GetUserMatches()
  }, [userId])

  return (
    <div className='userstate_matches purple--glass'>
        <div className='userstate-header'><h1> Match History </h1> </div>
        <MatchHeaderStates />
        <MatchStates />
      </div>
  )
}

export default ProfileGames