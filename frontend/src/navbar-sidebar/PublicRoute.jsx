import React from 'react'
import { Navigate } from 'react-router-dom'

const PublicRoute = ({ Component }) => {
  return (
    (!authenticated &&
        (<Component />)) ||
        <Navigate to='/mainpage' />
  )
}

export default PublicRoute