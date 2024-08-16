import React, { useContext, useEffect, useState } from 'react'

import racketSvg from "./assets/racket.svg"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AuthContext from "../navbar-sidebar/Authcontext";

function DashboardHead() {

  const {user} = useContext(AuthContext);
  const [userGames, setUserGames] = useState({});

  const [wins, setWins] = useState(0);
  const [losts, setLosts] = useState(0);
  const [games, setGames] = useState(0);
  const [winPcnt, setWinPcnt] = useState(50);
  const [lostPcnt, setLostPcnt] = useState(50);


  useEffect(()=>{
    if (userGames){
      const userWins = userGames.wins
      const userLosts = userGames.losts
      const userGame = userWins + userLosts
      const winPct = ((userWins * 100)/userGame).toFixed(0)
      setWins(userWins)
      setLosts(userLosts)
      setGames(userWins + userLosts)

      // setTimeout(() => {
        setWinPcnt(winPct)
        setLostPcnt(100 - winPct)
      // }, 1000);

    }
  },[userGames])

  useEffect(()=>{
    const fetchUserGames = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/profile/getUserGames/${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok)
          setUserGames(res.userGames);
        else
          console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    }
    if (user)
      fetchUserGames()
  },[user])

  return (
    <div className="dashpage__head dash--space"> 
        <div className="head__game-stats dash--bkborder">
          <p className='game'> Games </p>
          <div className="head__games-value-pic">
            <img alt='racket' src={racketSvg} />
            <p> {games} </p> 
          </div>
          
          <div className="head__game-stats__percentage">
            <div className='pic-percentage dash--win-color'>
              <AddCircleIcon />
              <p> {winPcnt} %</p>
            </div>
            <div className='pic-percentage dash--lost-color'>
              <RemoveCircleIcon />
              <p> {lostPcnt} %</p>
            </div>
          </div>

          <div className='head__game-stats__line'>
            <div className="left-side" style={{width:`${winPcnt}%`}} ></div>
            <div className="right-side" style={{width:`${lostPcnt}%`}}></div>
          </div>

          <div className='head__game-stats__statistics'>
            <p className='dash--win-color'> {wins} Won </p>
            <p className='dash--lost-color'> {losts} Lost</p>
          </div>

        </div>
      </div>
  )
}

export default DashboardHead
