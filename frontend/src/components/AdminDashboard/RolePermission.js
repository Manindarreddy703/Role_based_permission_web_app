import React, { useState, useEffect } from "react";
import axios from "axios";

const RolePermission = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    role: "",
    permissions: [], // Use `permissions` consistently in state
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/permission-list",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPermissions(response.data); // Set the permissions if the request is successful
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setError("Failed to load permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Handle multiple selections for the 'permissions' field
    if (id === "permissions") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prevData) => ({
        ...prevData,
        permissions: selectedOptions, // Update the permissions array
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("No token found. Please log in.");
      return;
    }
    console.error(formData, "ssssssssssssssssssssssss");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-permission",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Permissions assigned successfully!");
      setFormData({
        role: "",
        permissions: [], // Clear the permissions array
      });
      setErrorMessage(""); // Clear any error messages
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage(error.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assign Permissions</h1>

      {loading && <p>Loading permissions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-bold">
            Role
          </label>
          <select
            id="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="permissions" className="block text-sm font-bold">
            Permissions
          </label>
          <select
            id="permissions"
            value={formData.permissions} // Set the value to the permissions array
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            multiple // Enable multiple selection
            required
          >
            <option value="" disabled>
              Select permissions
            </option>
            {permissions.length > 0 ? (
              permissions.map((permission) => (
                <option key={permission.id} value={permission.title}>
                  {permission.title}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No permissions available
              </option>
            )}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default RolePermission;
