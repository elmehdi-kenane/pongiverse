import React from 'react'
import mmaqbourSvg from "../assets/Group5.svg"

const tournamentMatch = () => {
    return (
      <div className="tournament-match__result footer__result">
        <img src={mmaqbourSvg} alt="Player" />
        <p> Semi-Final </p>
        <p> 4th </p>
      </div>
    )
  }

function DashTournament() {
  return (
    <div className="footer__tournament-match2 purple--glass">
      <h1 className="footer__titles"> Tournament Match </h1>
      {tournamentMatch()}
      {tournamentMatch()}
      {tournamentMatch()}
      {tournamentMatch()}
      {tournamentMatch()}
      {tournamentMatch()}
    </div>
  )
}

export default DashTournament
