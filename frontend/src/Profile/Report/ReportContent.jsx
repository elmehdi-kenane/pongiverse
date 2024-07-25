import React, {useContext } from 'react'

import AuthContext from '../../navbar-sidebar/Authcontext';
import CloseIcon from '@mui/icons-material/Close';
import ReportOptions from './ReportOptions';
import ReportFooter from './ReportFooter';

function ReportContent() {

  const {setIsReport} = useContext(AuthContext);
  const {reportContentRef} = useContext(AuthContext);

  const handleClose = () => {
    setIsReport(false);
  }

  return (
    <div className='profile__report'>
      <div className="report__content" ref={reportContentRef}>
        <CloseIcon onClick={handleClose} className='report-close'/>
        <h1 className='report__title'> Report Maverick </h1>
        <ReportOptions />
        <ReportFooter />
      </div>
    </div>
  )
}

export default ReportContent
