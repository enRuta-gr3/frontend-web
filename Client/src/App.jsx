import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  AdminSellerLoginPage,
  ComprobantePasajePage 
} from '@/pages'
import {
  PublicRoutes,
  ClientRoutes,
  AdminRoutes,
  SellerRoutes
 } from "@/routes";

import {ProtectedRoute} from "@/components";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={<PublicRoutes />} />
        {/* Client Routes (Protected) */}
        <Route element={<ProtectedRoute requiredRole="CLIENTE" />}>
          <Route path="/profile/*" element={<ClientRoutes />} />
        </Route>

        {/* URL redireccion por parte de paypal */}
        <Route path="/comprobante-pasaje" element={<ComprobantePasajePage />} />


       { /* Admin - Seller login route (NO PROTEGIDA) */}
        <Route path="enRuta/" element={<AdminSellerLoginPage />} />

        {/* Admin Routes (Protected) */}
        <Route element={<ProtectedRoute requiredRole="ADMINISTRADOR" />}>
          <Route path="/enRuta/admin/*" element={<AdminRoutes />} />
        </Route>

        {/* Seller Routes (Protected) */}
        <Route element={<ProtectedRoute requiredRole="VENDEDOR" />}>
          <Route path="/enRuta/vendedor/*" element={<SellerRoutes />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;