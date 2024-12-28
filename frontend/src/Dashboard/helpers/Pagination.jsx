import React from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../Dashboard.css'

function Pagination() {
    return (
        <div className="expand">
          <ExpandLessIcon className='expand-less'/>
          <ExpandMoreIcon className='expand-more'/>
      </div>
    )
}

export default Pagination
