import React, { useState } from 'react'

import UpdateNkName from './Update/UpdateNkName';
import UpdateBio from './Update/UpdateBio';
import UpdateCountry from './Update/UpdateCountry';
import UpdatePic from './Update/UpdatePic';
import AdjustPic from './Update/AdjustPic';

function PersonalInfo() {

  const [isAdjustPic, setIsAdjustPic] = useState(false);

  return (
    <div className="settings__personal-info ">
        <h1 className='personal-info__header'> PERSONAL INFO </h1>
        <div className="personal-info__update">
          {isAdjustPic ? <AdjustPic setAdjust={setIsAdjustPic}/> :
            <>
              <UpdatePic setAdjust={setIsAdjustPic}/>
              <UpdateNkName />
              <UpdateBio />
              <UpdateCountry />
            </>
          }
        </div>
    </div>
  )
}

export default PersonalInfo
