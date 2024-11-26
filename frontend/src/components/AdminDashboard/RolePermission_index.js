import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RolePermissionIndex = () => {
  const [rolesPermissions, setRolesPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRolesPermissions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://role-based-permission-web-app-backend.vercel.app/api/all-permissions", // Replace with actual API endpoint
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRolesPermissions(response.data); // Set the roles and permissions data
      } catch (error) {
        console.error("Error fetching roles and permissions:", error);
        setError("Failed to load roles and permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchRolesPermissions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Roles and Permissions</h1>

      {loading && <p>Loading roles and permissions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <Link to="/roles-permission">
          <button className="bg-blue-600 text-white py-2 px-4 rounded">
            Assign Permissions
          </button>
        </Link>
      </div>

      {rolesPermissions.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Permissions</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rolesPermissions.map((rolePermission) => (
              <tr key={rolePermission.id}>
                <td className="border p-2">{rolePermission.role}</td>
                <td className="border p-2">
                  {rolePermission.permissions.join(", ")}
                </td>
                <td className="border p-2">
                  <Link to={`/edit-role/${rolePermission.id}`}>
                    <button className="bg-yellow-500 text-white py-1 px-4 rounded">
                      Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No roles and permissions available</p>
      )}
    </div>
  );
};

export default RolePermissionIndex;
