import React, { useEffect, useState } from "react";
import styles from '../assets/Game/gamemodes.module.css'
import { GrValidate } from "react-icons/gr";
import { BsQuestionSquareFill } from "react-icons/bs";
import { AiFillCloseSquare } from "react-icons/ai";



const loadingStates = [
  "Choose Solo Mode to play 1 vs. 1, 2 vs. 2, or against an AI.",
  "Play Solo Mode by matchmaking, inviting friends, or creating a room.",
  "Score points by hitting the ball and making your opponent miss.",
  "Use Friend Invite to challenge your friends in Solo Mode.",
  "Practice against the AI to improve your skills.",
  "Win matches by earning the most points!",
  "In Tournament Mode, create or join a tournament to compete.",
  "Join tournaments to meet skilled players and challenge yourself.",
];


const Instructions = ({hideInst, setHideInst}) => {
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    if (counter < loadingStates.length) {
      const timer = setTimeout(() => {
        setCounter(prevCounter => prevCounter + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [counter]);
  return (
    <>
    {
      !hideInst && 
      <div className={styles['instructions-div']}>
        <div className={styles['instructions-div-content']}>
          <button className={styles['instructions-div-button']} onClick={() => { setHideInst(true) }}><AiFillCloseSquare size={40} color="white" /></button>
          <div className={styles['instructions-div-content-div']}>
            {
              loadingStates.map((state, index) => (
                <div className={styles['p-and-icon']} key={index} >
                  <GrValidate className={styles['p-icons']} color={index <= counter ? '#913dce' : 'white'} />
                  <p style={{ color: index <= counter ? '#913dce' : 'white', fontWeight: index <= counter ? 'bold' : 'normal' }} className={styles['instructions-div-p']}> {state} </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    }
    </>
  );
};

export default Instructions;
