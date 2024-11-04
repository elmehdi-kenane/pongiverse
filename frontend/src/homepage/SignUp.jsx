import React, { useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'

const SignUp = () => {
  let { user } = useContext(AuthContext)
  let { publicCheckAuth } = useContext(AuthContext)
  let [name, setName] = useState('')
  let [email, setEmail] = useState('')
  let [password, setPassword] = useState('')
  let [redirect, setRedirect] = useState(false)

  useEffect(() => {
    publicCheckAuth()
  }, [])
  
  let submit = async e => {
    e.preventDefault();

    await fetch(`https://${import.meta.env.VITE_IPADDRESS}:8000/api/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    })
    setRedirect(true);
  }

  if (redirect) {
      return (
          <Navigate to="/signin" />
      )
  }

  return (
    <div>
        <h1 style={{color:"white"}}>SignUp</h1>
        <hr />
        <hr />
        <form onSubmit={submit}>
            <input type="text" name='name' placeholder='Enter your username' onChange={e => {
                setName(e.target.value)
            }} />
            <input type="email" name='email' placeholder='Enter your email' onChange={e => {
                setEmail(e.target.value)
            }}/>
            <input type="password" name='password' placeholder='Enter your password' onChange={e => {
                setPassword(e.target.value)
            }}/>
            <input type="submit" />
        </form>
    </div>
  )
}

export default SignUp