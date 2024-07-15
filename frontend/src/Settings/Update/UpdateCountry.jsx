import React, { useRef, useState ,useEffect, useContext} from 'react'
import CountrySelector from './CountrySelector';

function UpdateCountry() {
   
    return (
      <div className="update country-space">
          <p className='title'> Country </p>
          <CountrySelector />
      </div>
    )
  }

export default UpdateCountry
