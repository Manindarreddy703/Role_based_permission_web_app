import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Modal from "react-modal";

const ItemType = {
  PERMISSION: "permission",
};

const PermissionItem = ({
  permission,
  index,
  movePermission,
  onEdit,
  onDelete,
}) => {
  const [, ref] = useDrag({
    type: ItemType.PERMISSION,
    item: { id: permission.id, index },
  });

  const [, drop] = useDrop({
    accept: ItemType.PERMISSION,
    hover(item) {
      if (item.index !== index) {
        movePermission(item.index, index);
        item.index = index; // Update the index for the dragged item
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="p-4 bg-white border rounded shadow-md flex justify-between items-center"
    >
      <span>{permission.title}</span>
      <div>
        <button
          onClick={() => onEdit(permission)}
          className="bg-yellow-500 text-white p-1 rounded mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(permission.id)}
          className="bg-red-500 text-white p-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const PermissionDashboard = () => {
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth(); // Get authentication status from context
  const navigate = useNavigate(); // For navigation

  // Check if user is authenticated, otherwise redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, please log in");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/permissions",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPermissions(response.data);
      } catch (error) {
        console.error("Error fetching permission:", error);
      }
    };

    if (isAuthenticated) {
      fetchPermissions();
    }
  }, [isAuthenticated]);

  const handleAddPermission = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/permissions",
        { title: newPermission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPermissions([...permissions, response.data]);
      setNewPermission("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const movePermission = (fromIndex, toIndex) => {
    const updatedPermissions = Array.from(permissions);
    const [movedPermission] = updatedPermissions.splice(fromIndex, 1);
    updatedPermissions.splice(toIndex, 0, movedPermission);
    setPermissions(updatedPermissions);
  };

  const handleEditPermission = async (updatedPermission) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5000/api/permissions/${updatedPermission.id}`,
        { title: updatedPermission.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedPermissions = permissions.map((permission) =>
        permission.id === updatedPermission.id ? response.data : permission
      );
      setPermissions(updatedPermissions);
      setModalIsOpen(false);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeletePermission = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/permission/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(permissions.filter((permission) => permission.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const openEditModal = (permission) => {
    setEditingPermission(permission);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingPermission(null);
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Your Permissions:</h2>

        {/* Search Input Field */}
        <input
          type="text"
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 mb-4 rounded"
        />

        {/* Add Todo Form */}
        <form onSubmit={handleAddPermission} className="mb-4">
          <input
            type="text"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            placeholder="Add a new todo"
            className="border p-2 mr-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Add Permission
          </button>
        </form>

        {/* Draggable Todo List */}
        <div className="space-y-2">
          {filteredPermissions.map((permission, index) => (
            <PermissionItem
              key={permission.id}
              permission={permission}
              index={index}
              movePermission={movePermission}
              onEdit={openEditModal}
              onDelete={handleDeletePermission}
            />
          ))}
        </div>

        {/* Edit Todo Modal */}
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Edit Todo</h2>
          {editingPermission && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditPermission(editingPermission);
              }}
            >
              <input
                type="text"
                value={editingPermission.title}
                onChange={(e) =>
                  setEditingPermission({
                    ...editingPermission,
                    title: e.target.value,
                  })
                }
                className="border p-2 rounded mb-4"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save
              </button>
            </form>
          )}
          <button onClick={closeModal} className="mt-2 text-red-500">
            Cancel
          </button>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default PermissionDashboard;
