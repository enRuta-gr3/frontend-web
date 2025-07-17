import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
}from "@/pages";


import SearchResultsPage from "@/components/search_result/SearchResult"


function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registrarse" element={<RegisterPage />} />
      <Route path="/recuperar-contraseña" element={<ForgotPasswordPage />} />
      <Route path="/search-results" element={<SearchResultsPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default PublicRoutes;