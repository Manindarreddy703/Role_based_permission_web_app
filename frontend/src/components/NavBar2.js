// src/components/NavBar2.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const NavBar2 = () => {
  const { logout, user } = useAuth(); // Destructure user from context
  const [getuser, setGetUser] = useState(null); // Start with null to handle loading states better
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionslist, setPermissionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user details
        const userResponse = await axios.get(
          `http://localhost:5000/api/getuserdetails/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const AuthUser = userResponse.data;
        setGetUser(AuthUser); // Set the user details in state

        // Fetch permissions if the role is not admin
        if (AuthUser[0].role !== "admin") {
          const permissionsResponse = await axios.get(
            `http://localhost:5000/api/list/${AuthUser[0].role}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setPermissionsList(permissionsResponse.data); // Set permissions in state
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          "Failed to fetch data. Please try again.";
        setErrorMessage(errorMsg);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData(); // Call the combined fetch function
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    logout(); // Call the logout function from context
  };

  const user_role = getuser ? getuser[0]?.role ?? "" : "admin";
  const permissions = permissionslist[0]?.permissions ?? [];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <header className="w-full bg-green-500 flex flex-wrap items-center shadow-md fixed top-0 left-0">
      <div className="flex-1 flex justify-between items-center">
        <a href="#home">
          <img src="" alt="logo" className="h-10 w-16" />
        </a>
        {/* Show the user’s name if logged in */}
        {user && (
          <span className="text-white p-4">Welcome, {user.firstname}</span>
        )}
      </div>
      <div>
        <nav>
          <ul className="flex items-center justify-between text-base text-white">
            {(permissions.includes("todo_access") || user_role === "admin") && (
              <li>
                <Link to="/admin-dashboard" className="p-4">
                  TodoList
                </Link>
              </li>
            )}
            {user_role === "admin" && (
              <>
                <li>
                  <Link to="/permission" className="p-4">
                    Permissions
                  </Link>
                </li>
                <li>
                  <Link to="/roles-index" className="p-4">
                    Roles
                  </Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout} className="p-4">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar2;
