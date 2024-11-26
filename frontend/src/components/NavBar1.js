// src/components/NavBar1.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const NavBar1 = () => {
  const { isAuthenticated, logout } = useAuth(); // Access authentication state

  return (
    <header className="w-full lg:px-16 bg-blue-500 flex flex-wrap items-center shadow-md fixed top-0 left-0">
      <div className="flex-1 flex justify-between items-center">
        <a href="#home"><img src="" alt="logo" className="h-10 w-16"/></a>
      </div>
      <div>
        <div className="hidden md:flex md:items-center md:w-auto w-full" id="menu">
          <nav>
            <ul className="md:flex items-center justify-between text-base text-gray-700 pt-4 md:pt-0">
              {!isAuthenticated ? (
                <>
                  <li><Link className="md:p-4 py-3 px-0 block" to="/register">Register</Link></li>
                  <li><Link className="md:p-4 py-3 px-0 block md:mb-0 mb-2" to="/login">Login</Link></li>
                </>
              ) : (
                <>
                  <li><Link className="md:p-4 py-3 px-0 block" to="/dashboard">Dashboard</Link></li>
                  <li>
                    <button className="md:p-4 py-3 px-0 block" onClick={logout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar1;
