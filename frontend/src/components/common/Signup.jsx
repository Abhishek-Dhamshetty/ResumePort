import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Signup = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login since Google OAuth handles both login and signup
  return <Navigate to="/signin" replace />;
};

export default Signup;