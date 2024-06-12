import React, { useState, useEffect, useRef } from 'react'

import ReportContent from './ReportContent';

import ReportIcon from '@mui/icons-material/Report';
import FlagIcon from '@mui/icons-material/Flag';

function Report() {

  const [isReport, setIsReport] = useState(false);
  const reportRef = useRef(null);
  const insideReportRef = useRef(null);
  const handleReportClick = () => {
    setIsReport(!isReport)
  }

  useEffect (() => {
    // Handle CLick Outside Report
    document.body.addEventListener('click', (event)=>{
      if (!event.composedPath().includes(reportRef.current)
      && !event.composedPath().includes(insideReportRef.current) ) {
        setIsReport(false);
        console.log("Click Outside the Report");
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
    <>
    <div className="userinfo__report" onClick={handleReportClick} ref={reportRef}>
      <ReportIcon />
    </div>
      {isReport && <ReportContent ReportRef={insideReportRef} handleClick={setIsReport} /> }
    </>
  )
}

export default Report

// window.addEventListener('click', (e) => {
//   console.log(reportRef.current)
//   if (!e.target.closest(".parameter__report") && props.isReport){
//       console.log("CLICK HERE")
//       // if (isReport) {
//         props.setIsReport(false)
//       // }
//     }
// })