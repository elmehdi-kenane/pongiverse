import React, {useContext } from 'react'

import AuthContext from '../../navbar-sidebar/Authcontext';
import CloseIcon from '@mui/icons-material/Close';

function ReportContent() {

  const {setIsReport} = useContext(AuthContext);
  
  const {reportContentRef} = useContext(AuthContext);

    const handleClose = () => {
      setIsReport(false);
    }

  return (
    <div className='profile__report'>
      <div className="report__content" ref={reportContentRef}>
        <div className='report__close' onClick={handleClose}>
            <CloseIcon />
        </div>
      </div>
    </div>
  )
}

export default ReportContent
