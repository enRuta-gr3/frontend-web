import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  SellerHomePage,
  SellerUserPage,
  SellerBusPage,
  SellerLocalitiesPage,
  SellerTravelPage,
  SellTrip,
  SellerStatsTrips,
  SellerStatsBuses,
  SellerStatsSale,
  SellerReturnsPage
} from "@/pages"


function SellerRoutes() {
  return (
    <Routes>
      <Route path="enRuta/vendedor" element={<Navigate to="/enRuta/" />} />
      <Route path="dashboard" element={<SellerHomePage />} />
      <Route path="usuarios" element={<SellerUserPage />} />
      <Route path="omnibus" element={<SellerBusPage />} />
      <Route path="localidades" element={<SellerLocalitiesPage />} />
      <Route path="viajes" element={<SellerTravelPage />} />

      

      <Route path="devoluciones" element={<SellerReturnsPage/>}/>
      
      <Route path="vender-pasaje" element={<SellTrip />} />
      <Route path="estadistica/viajes" element={<SellerStatsTrips />} />
      <Route path="estadistica/omnibus" element={<SellerStatsBuses />} />
      <Route path="estadistica/pasajes" element={<SellerStatsSale />} />
      <Route path="*" element={<Navigate to="/enRuta/vendedor/dashboard" replace />} />
    </Routes>
  );
}

export default SellerRoutes;