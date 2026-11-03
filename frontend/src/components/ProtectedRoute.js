import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserInfo } from '../auth';

const ProtectedRoute = ({ allowedRoles }) => {
  const userInfo = getUserInfo();

  if (!userInfo || !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
 
export default ProtectedRoute;
