import { Routes, Route } from "react-router-dom";
import {
  ProfilePage,
  ProfileAccountPage,
  ProfileChangePasswordPage,
  TicketHistoryPage,
} from "@/pages";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route index element={<ProfilePage />} />
      <Route path="account" element={<ProfileAccountPage />} />
      <Route path="cambiar-contraseña" element={<ProfileChangePasswordPage />} />
      <Route path="historial-pasajes" element={<TicketHistoryPage/>}/>
    </Routes>
  );
}
