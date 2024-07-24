import React from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'

const Friends = () => {
  const { user, notifSocket } = useContext(AuthContext)
  const [users, setUsers] = useState([])

  let a = 0
  
  useEffect(() => {
    const getUsers = async () => {
        const response = await fetch(`http://localhost:8000/users/profile/${user}`, {
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

  const addFriend = async (myuser) => {
    const response = await fetch(`http://localhost:8000/users/add/${user}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user : myuser,
      })
    })
    const res = await response.json()
  }

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
    <div style={{color:"white", backgroundColor:"purple"}}>Friends
      <ul>
        {users.map((myuser) => (
          <li onClick={() => {
            addFriend(myuser)
          }} key={a++}>{myuser}</li>
        ))}
      </ul>
    </div>
  )
}

export default Friends