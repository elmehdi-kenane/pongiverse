import { React, useState } from 'react'
import { rankData } from "../helpers/Data"

const RankClassment = (position, player) => {
    let trophyClass = ""; // pos-pic
    let championsClass = ""; // name-level
    if (position <= 3) {
      trophyClass = `winners winner--${position}`;
      championsClass = `player__name_level--champions`;
    }
    return (
      <>
        <div className='player__pos_pic'>
          <p className={trophyClass}> #{position}</p>
          <img src={player.img} alt="Player" />
        </div>
        <div className="player__name_level">
          <p className={championsClass}> {player.name} </p>
          <p className={championsClass}> {player.level} </p>
        </div>
      </>
    );
  };

function DashRanking() {
    return (
        <div className="dashpage__body__rank dash--bkborder">
            <h1> Rank </h1>
            <div className='dashpage__body__rank__title'>
                <div className='title'> Level </div>
                <div className='title'> Win </div>
                <div className='title'> Goal </div>
            </div>
            <div className="dashpage__body__rank__classment">
                {rankData.map((player, key) => {
                    return (
                        <div className='player__classment' key={key}>
                            {RankClassment(key+1, player)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DashRanking
