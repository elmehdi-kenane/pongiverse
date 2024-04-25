import { createContext, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom'

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    let [user, setUser] = useState('');
    let navigate = useNavigate()


    async function publicCheckAuth() {
        try {
            let response = await fetch('http://localhost:8000/api/get', {  // 10.12.7.3  localhost
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            response = await response.json()
            if (response.detail !== "Unauthenticated") {
                setUser(response.name)
                navigate('/mainpage')
            } else {
                setUser('')
            }
        } catch (e) {
            console.log("something wrong with fetch")
        }
    }

    async function privateCheckAuth() {
        try {
            let response = await fetch('http://localhost:8000/api/get', {  // 10.12.7.3  localhost
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            response = await response.json()
            if (response.detail !== "Unauthenticated")
                setUser(response.name)
            else {
                setUser('')
                navigate('/signin')
            }
        } catch (e) {
            console.log("something wrong with fetch")
        }
    }

    let contextData = {
        user: user,
        publicCheckAuth: publicCheckAuth,
        privateCheckAuth: privateCheckAuth,
        setUser: setUser
    }

    return (
        <AuthContext.Provider value={contextData} >
            {children}
        </AuthContext.Provider>
    )
}