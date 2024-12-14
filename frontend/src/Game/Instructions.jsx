import React, { useEffect, useState } from "react";
import styles from '../assets/Game/gamemodes.module.css'
import { GrValidate } from "react-icons/gr";
import { BsQuestionSquareFill } from "react-icons/bs";
import { AiFillCloseSquare } from "react-icons/ai";



const loadingStates = [
  "Buying a condo",
  "Travelling in a flight",
  "Meeting Tyler Durden",
  "He makes soap",
  "We goto a bar",
  "Start a fight",
  "We like it",
  "Welcome to F**** C***",
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
                  <GrValidate size={25} color={index <= counter ? '#913dce' : 'white'} />
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
