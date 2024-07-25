import React, { useContext, useState } from 'react'
import DoneIcon from '@mui/icons-material/Done';
import AuthContext from '../../navbar-sidebar/Authcontext';

function ReportFooter() {

  const {reportValue} = useContext(AuthContext);
  const {setIsReport} = useContext(AuthContext);
  const [isBlock, setIsBlock] = useState(false);

  const handleBlockClick = () => {
    setIsBlock(!isBlock);
  }
  const  HandleCancelReport = () => {
    setIsReport(false);
  }
  const  handleReportSubmit = () => {
      console.log("Report :", `${reportValue}`, isBlock ? "+ Blocking" : '');
      setIsReport(false);
  }

  return (
    <div className='report__footer'>
      <button className="block-user" onClick={handleBlockClick}>
        <DoneIcon className={!isBlock ? 'block-icon' : 'block-icon valid-bg'}/>
        <p> Block Maverick ? </p>
      </button>
      <div className="report-submit">
        <button className='submit-button submit__cancel' onClick={HandleCancelReport}> Cancel </button>
        <button 
          className={(reportValue != null) ?'submit-button submit__report' : 'submit-button need-report'}
          onClick={reportValue && handleReportSubmit} 
        > Report </button>
      </div>
    </div>
  )
}

export default ReportFooter
