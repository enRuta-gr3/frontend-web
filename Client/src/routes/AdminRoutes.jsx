import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminStatsUsers,
}from "@/pages";


function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/enRuta/" />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="usuarios" element={<AdminUsersPage />} />
      <Route path="estadistica/usuarios" element={<AdminStatsUsers />} />
      <Route path="*" element={<Navigate to="/enRuta/admin/dashboard" replace />} />
    </Routes>
  );
}

export default AdminRoutes;