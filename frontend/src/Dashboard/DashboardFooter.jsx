import React from 'react'
import ekenaneSvg from "./assets/Group1.svg"
import idabligiSvg from "./assets/Group2.svg"
import AgouzouSvg from "./assets/Group3.svg"
import rennacirSvg from "./assets/Group4.svg"
import mmaqbourSvg from "./assets/Group5.svg"

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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

  const paginationIcons = () => {
    return (
      <div className="expand">
        <ExpandLessIcon className='expand-less'/>
        <ExpandMoreIcon className='expand-more'/>
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
            {paginationIcons()}
        </div>
        <div className="footer__multiplayer-match dash--bkborder">
            <h1 className="footer__titles"> Multiplayer Match </h1>
            {multiplayerMatch()}
            {multiplayerMatch()}
            {multiplayerMatch()}
            {paginationIcons()}
        </div>
        <div className="footer__tournament-match dash--bkborder">
            <h1 className="footer__titles"> Tournament Match </h1>
            {tournamentMatch()}
            {tournamentMatch()}
            {tournamentMatch()}
            {paginationIcons()}
        </div>
    </div>
  )
}

export default DashboardFooter
