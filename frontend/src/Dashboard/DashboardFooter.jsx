import React from 'react'
import ekenaneSvg from "./assets/Group1.svg"
import idabligiSvg from "./assets/Group2.svg"
import AgouzouSvg from "./assets/Group3.svg"
import rennacirSvg from "./assets/Group4.svg"
import mmaqbourSvg from "./assets/Group5.svg"

import Pagination from './helpers/Pagination'

const singleMatch = () => {
    return (
      <div className="single-match__result footer__result">
        <img src={idabligiSvg} alt="Player" />
        <p> 5 - 3 </p>
        <img src={AgouzouSvg} alt="Player" />
      </div>
    )
  }
  
  const multiplayerMatch = () => {
    return (
      <div className="multiplayer-match__result footer__result">
        <div className="multiplayer-pics">
        <img src={idabligiSvg} alt="Player" />
        <img src={rennacirSvg} alt="Player" />
        </div>
        <div className="middle-side">
          <p> 5 - 3 </p>
        </div>
        <div className="multiplayer-pics">
          <img src={ekenaneSvg} alt="Player" />
          <img src={mmaqbourSvg} alt="Player" />
        </div>
      </div>
    )
  }
  
  const tournamentMatch = () => {
    return (
      <div className="tournament-match__result footer__result">
        <img src={mmaqbourSvg} alt="Player" />
        <p> Semi-Final </p>
        <p> 4th </p>
      </div>
    )
  }

function DashboardFooter() {
  return (
    <div className="dashpage__footer dash--space">
        <div className="footer__single-match dash--bkborder">
            <h1 className="footer__titles"> Single Match </h1>
            {singleMatch()}
            {singleMatch()}
            {singleMatch()}
            <Pagination />
        </div>
        <div className="footer__multiplayer-match dash--bkborder">
            <h1 className="footer__titles"> Multiplayer Match </h1>
            {multiplayerMatch()}
            {multiplayerMatch()}
            {multiplayerMatch()}
            <Pagination />
        </div>
        <div className="footer__tournament-match dash--bkborder">
            <h1 className="footer__titles"> Tournament Match </h1>
            {tournamentMatch()}
            {tournamentMatch()}
            {tournamentMatch()}
            <Pagination />
        </div>
    </div>
  )
}

export default DashboardFooter
