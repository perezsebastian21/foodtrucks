import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

function ProtectedRoute() {
  const token = localStorage.getItem('token');

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  if (!isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/" />;
  }

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return (
    <Outlet />
  );
}

export default ProtectedRoute;