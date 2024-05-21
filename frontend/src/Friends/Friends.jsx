import React from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'

const Friends = () => {
  const { user, notifSocket } = useContext(AuthContext)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const getUsers = async () => {
        const response = await fetch(`http://localhost:8000/users/friends/${user}`, {
          method: 'GET'
        })
        const res = await response.json()
        // set
        console.log(res)
        setUsers(res)
        // document.write(res)
    }
    if (user)
      getUsers()
  }, [user])

  return (
    <div style={{color:"white"}}>Friends</div>
  )
}

export default Friends