import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import PermissionDashboard from "../components/AdminDashboard/permission";
import RolePermission from "../components/AdminDashboard/RolePermission";
import RolePermissionIndex from "./AdminDashboard/RolePermission_index";
const Routes1 = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/permission" element={<PermissionDashboard />} />
      <Route path="/roles-permission" element={<RolePermission />} />
      <Route path="/roles-index" element={<RolePermissionIndex />} />
    </Routes>
  );
};

export default Routes1;
