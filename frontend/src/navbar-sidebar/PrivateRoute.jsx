import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ Component }) => {
  return (
    (authenticated &&
      (<Component />)) ||
      <Navigate to='/' />
  )
}

export default PrivateRoute