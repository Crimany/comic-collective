import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserInfo } from '../auth';

const RedirectIfLoggedIn = ({ children }) => {
  const userInfo = getUserInfo();

  if (userInfo) {
    if (userInfo.role === 'employee') {
      return <Navigate to="/dashempl" replace />;
    } else if (userInfo.role === 'customer') {
      return <Navigate to="/dashcust" replace />;
    }
  }

  return children;
};

export default RedirectIfLoggedIn;
