import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './Authcontext';
const AuthMiddleware = ({ children }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext)
  useEffect(() => {
    async function publicCheckAuth() {
		try {
			let response = await fetch('http://localhost:8000/auth/verifytoken/', {
				method : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					user : user
				}),
			})
			response = await response.json()
			if (response.Case === "Invalid token") {
				setUser('')
				navigate('/signin')
			}
		} catch (e) {
			console.log("something wrong with fetch")
		}
	}
    publicCheckAuth();
  }, [navigate]);

  return <>{children}</>;
};

export default AuthMiddleware;