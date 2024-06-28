import React, { useState, useEffect, useRef, useContext } from 'react'

import ReportIcon from '@mui/icons-material/Report';
import AuthContext from '../../navbar-sidebar/Authcontext';

function Report() {

  const {isReport} = useContext(AuthContext);
  const {setIsReport} = useContext(AuthContext);
  
  const reportRef = useRef(null);
  const {reportContentRef} = useContext(AuthContext);

  const handleReportClick = () => {
    setIsReport(!isReport)
  }

  useEffect (() => {
    // Handle CLick Outside Report
    document.body.addEventListener('click', (event)=>{
      if (!event.composedPath().includes(reportRef.current)
      && !event.composedPath().includes(reportContentRef.current) ) {
        setIsReport(false);
        // console.log("Click Outside the Report");
      }
    })
    // Handle ESC
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsReport(false);
      }
    };
    document.body.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, [])

  return (
    <div className="userinfo__report" onClick={handleReportClick} ref={reportRef}>
      <ReportIcon />
    </div>
  )
}

export default Report