import React, { useContext, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'

const HomePage = () => {
  let { user } = useContext(AuthContext)
  let { publicCheckAuth } = useContext(AuthContext)

  useEffect(() => {
    publicCheckAuth()
  }, [])

  return (
    <div style={{color:"white"}}>this is the landing page</div>
  )
}

export default HomePage