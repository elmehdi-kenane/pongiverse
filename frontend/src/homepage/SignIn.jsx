import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'

const SignIn = () => {
  let { user } = useContext(AuthContext)
  let { setUser } = useContext(AuthContext)
  let { publicCheckAuth } = useContext(AuthContext)
  let navigate = useNavigate()
  let [email, setEmail] = useState('')
  let [password, setPassword] = useState('')

  useEffect(() => {
    publicCheckAuth()
  }, [])

  let submit = async e => {
    e.preventDefault();

    try {
      let response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/signin`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
              email,
              password
          })
      })
      let content = await response.json()
      console.log(content)
      if (content.name) {
        setUser(content.name)
        navigate('/mainpage')
      }
    } catch (e) {
      console.log("Error in network or URL")
    }
  }

  return (
    <div>
      <h1 style={{color:"white"}}>SignIn</h1>
      <hr />
      <hr />
      <form onSubmit={submit}>
        <input type="text" name='email' placeholder='Enter your username' onChange={e => setEmail(e.target.value)}/>
        <input type="password" name='password' placeholder='Enter your password' onChange={e => setPassword(e.target.value)}/>
        <input type="submit" />
      </form>
    </div>
  )
}

export default SignIn