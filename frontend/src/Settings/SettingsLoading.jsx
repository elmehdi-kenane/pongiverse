import React from 'react'
import Loading from '../Game/Loading';

function SettingsLoading() {
  return (
    <div className='update__lodaing'>
        <h1 className='loading__title'> Loading... </h1>
        <div className='loading__ctr'>
          <Loading />
        </div>
      </div>
  )
}

export default SettingsLoading
