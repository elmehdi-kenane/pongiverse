import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";

const ProtectedRoute = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { user } = useContext(AuthContext);
	const location = useLocation();
	useEffect(() => {
		async function CheckAuth() {
			try {
				let response = await fetch(
					`http://${import.meta.env.VITE_IPADDRESS}:8000/auth/verifytoken/`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
						body: JSON.stringify({
							user: user,
						}),
					}
				);
				response = await response.json();
				console.log(response.Case);
				if (response.Case !== "Invalid token") {
					setIsAuthenticated(true)
				} else {
					setIsAuthenticated(false)
				}
			} catch (e) {
				console.log("something wrong with fetch");
			}
		}
		CheckAuth();
	}, [])
	if (isAuthenticated) {
		return <Navigate to={location.state?.from?.pathname || "/"} replace />;
	}
	return children;
};

export default ProtectedRoute;
