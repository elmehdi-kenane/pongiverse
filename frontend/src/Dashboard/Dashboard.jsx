import React, { useState } from 'react'
import './Dashboard.css'
import chart from "./chart.png"
import statics from "./ss.png"
import img from "../assets/SignUp/42_logo.svg"
import img2 from "./Group2.svg"
import img3 from "./Group3.svg"


const Dashboard = () => {

  let i = 0;
  const headElements = ["Matches : 15", "Wins: 9", "Loses: 6",
    "Win ratio: 2.4"]
  const rankData = [
    {
      name: "rennacir",
      level: "15.4 XP"
    },
    {
      name: "idabligi",
      level: "13.4 XP"
    },
    {
      name: "mmaqbour",
      level: "12.7 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    },
    {
      name: "aagouzou",
      level: "9.3 XP"
    }
  ]

  const RankClassment = (position, player) => {
    let trophyClass = "";
    let nameClass = "";
    if (position <= 3){
      trophyClass = `rank--winners rank--${position}`;
      nameClass = `rank__champion`;
    }
    
  
    return (
      <>
        <div className='rank__pic_trp'>
          <p className={trophyClass}> #{position}</p>
          <img src={img3} alt="Player" />
        </div>
        <div className="classment__level">
          <p className={nameClass}> {player.name} </p>
          <p className={nameClass}> {player.level} </p>
        </div>
      </>
    );
  };

  return (
    <div className='dashpage'>
      <div className="dashpage__head dash--space"> 
        {headElements.map((item) => {
          return (
            <div className='dashpage__head__element dash--bkborder'> 
              <p> {item} </p>
              <img src={chart} />
            </div>
          )
        })}
      </div>
      <div className="dashpage__body dash--space">
        <div className="dashpage__body__statistics dash--bkborder">
          <h1> Level Historics </h1>
          <img src={statics} />
        </div>
        <div className="dashpage__body__rank dash--bkborder">
          <h1> Rank </h1>
          <div className='dashpage__body__rank__title'>
            <div className='title'> Level </div>
            <div className='title'> Win </div>
            <div className='title'> Goal </div>
          </div>
          <div className="dashpage__body__rank__classment">
            {rankData.map((player) => {
              return (
                <div className='classment'>
                  {RankClassment(i = i + 1, player)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="dashpage__footer"> </div>
    </div>
  )
}

export default Dashboard