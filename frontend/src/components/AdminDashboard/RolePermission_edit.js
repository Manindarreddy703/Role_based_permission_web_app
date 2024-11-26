import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams

const EditUserDetails = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [getuser, setGetUser] = useState(null);
  const [permissionslist, setPermissionsList] = useState([]);
  const [errorMessage, setError] = useState("");
  const [updatedUser, setUpdatedUser] = useState({ name: "", role: "" });
  const [updatedPermissions, setUpdatedPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        // Fetch user details by id
        const userResponse = await axios.get(
          `http://localhost:5000/api/getuserdetails/${id}`, // Fetch by id from the URL
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const user = userResponse.data;
        setGetUser(user);
        setUpdatedUser({ name: user.name, role: user.role });

        // Fetch permissions if the user is not an admin
        if (user.role !== "admin") {
          const permissionsResponse = await axios.get(
            `http://localhost:5000/api/list/${user.role}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPermissionsList(permissionsResponse.data);
        }
      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Fetch data on component mount
  }, [id]); // Depend on `id` so the effect runs when the user ID changes

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle permissions change
  const handlePermissionsChange = (e) => {
    const { value, checked } = e.target;
    setUpdatedPermissions((prevState) =>
      checked
        ? [...prevState, value]
        : prevState.filter((perm) => perm !== value)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/updatepermission/${getuser.id}`,
        {
          ...updatedUser,
          permissions: updatedPermissions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGetUser(response.data);
      setIsSubmitting(false);
      setError(""); // Clear error message if success
    } catch (error) {
      setError("Failed to update user details.");
      setIsSubmitting(false);
      console.error("Error updating user details:", error);
    }
  };

  return (
    <div>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <h1>Edit User Details</h1>

      {getuser ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={updatedUser.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Role:</label>
            <select
              name="role"
              value={updatedUser.role}
              onChange={handleInputChange}
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {getuser.role !== "admin" && (
            <div>
              <h3>Permissions</h3>
              {permissionslist.length > 0 ? (
                <div>
                  {permissionslist.map((permission) => (
                    <div key={permission}>
                      <input
                        type="checkbox"
                        value={permission}
                        checked={updatedPermissions.includes(permission)}
                        onChange={handlePermissionsChange}
                      />
                      {permission}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No permissions available for this role.</p>
              )}
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update User"}
          </button>
        </form>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};

export default EditUserDetails;
