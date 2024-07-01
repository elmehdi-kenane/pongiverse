import React, { useState, useEffect, useRef, useContext } from 'react'

import ReportIcon from '@mui/icons-material/Report';
import AuthContext from '../../navbar-sidebar/Authcontext';

function Report() {

  const {isReport} = useContext(AuthContext);
  const {setIsReport} = useContext(AuthContext);
  const {setReportValue} = useContext(AuthContext);

  const reportRef = useRef(null);
  const {reportContentRef} = useContext(AuthContext);

  const handleReportClick = () => {
    setIsReport(!isReport)
  }

  useEffect (() => {

    // Handle CLick Outside Report -----------------------------
    const handleOutsideClick = (event)=>{
      if (!event.composedPath().includes(reportRef.current)
      && !event.composedPath().includes(reportContentRef.current) ) {
        setIsReport(false);
        setReportValue(null);
        // console.log("Click Outside the Report");
      }
    }
    document.body.addEventListener('click', handleOutsideClick)
    // Handle ESC -----------------------------
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsReport(false);
        setReportValue(null);
      }
    };
    document.body.addEventListener('keydown', handleEsc);
    return () => {
      document.body.removeEventListener('click', handleOutsideClick)
      document.body.removeEventListener('keydown', handleEsc);
    };
  }, [])

  return (
    <div className="userinfo__report" onClick={handleReportClick} ref={reportRef}>
      <ReportIcon />
    </div>
  )
}

export default Report