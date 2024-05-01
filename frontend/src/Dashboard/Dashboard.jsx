import React from 'react'
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  // const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return () => {
      alert(location.pathname)
    };
  }, [location]);
  return (
    <div style={{color:"white"}}>Dashboard</div>
  )
}

export default Dashboard