import React from 'react'

import CloseIcon from '@mui/icons-material/Close';

function ReportContent(props) {

    const handleClick = () => {
        props.handleClick(false);
    }

  return (
    <div className="parameter__report" ref={props.ReportRef}>
        <div className='report__close' onClick={handleClick}>
            <CloseIcon />
        </div>
    </div>
  )
}

export default ReportContent
