import AdminLayout from "../AdminUi/AdminLayout";

import useThemeStore from "@/store/useThemeStore";

export default function AdminDashboard() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

 
  return (
    <AdminLayout>
      
      <div className="mb-6 text-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Dashboard</h1>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Bienvenido al panel de administración de En Ruta</p>
      </div>

    
      
    </AdminLayout>
    

  );
}