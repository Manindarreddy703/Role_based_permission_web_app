// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Set user state and isAuthenticated flag
        setUser(decodedToken);
        setIsAuthenticated(true);

        // Log user details to the console
        console.log("Authenticated user details:", decodedToken);
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("token"); // Clear invalid token
      }
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null); // Clear user state on logout
    localStorage.removeItem("token"); // Clear token on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
