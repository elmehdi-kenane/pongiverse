import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
baseURL: `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}`,
});

function PrivateRoute({ children }) {
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const token = Cookies.get('access_token')

useEffect(() => {
  const token = Cookies.get('access_token');
  const formData = new FormData();
  formData.append('token', token);

  client.post('/auth/verifytoken/', formData, {
  headers: {
  'Content-Type': 'application/json',
  },
  })
  .then(response => {
    if (response.data.Case === "valid token") {
    setIsAuthenticated(true);
    }
    setIsLoading(false);
  })
  .catch(error => {
    console.error('There was an error!', error);
    setIsLoading(false);
  });
}, []);

if (isLoading) {
return <div>Loading...</div>;
}

if ((token && !isAuthenticated) || !token) {
return <Navigate to="/login" />;
}

return children;
}

export default PrivateRoute;