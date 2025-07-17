import { useState, useEffect } from "react"
import PanelSidebar from "@/components/layouts/PanelSidebar"
import PanelHeader from "@/components/layouts/PanelHeader"
import { Users, Bus, BarChart } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"

const adminMenuItems = [
  {
    title: "Usuarios",
    icon: <Users className="h-5 w-5" />,
    path: "/enRuta/admin/usuarios",
  },
  {
    title: "Estadísticas",
    icon: <BarChart className="h-5 w-5" />,
    path: "/enRuta/admin/estadistica",
    subMenu: [{ title: "Usuarios", path: "/enRuta/admin/estadistica/usuarios" }],
  },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const usuario = useAuthStore((state) => state.user)

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) 
      }
    }


    handleResize()        // Aca reseteamos el estado inicial

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const userData = {
    name: usuario.nombres + " " + usuario.apellidos,
    role: usuario.role,
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-neutral-800" : "bg-neutral-50"}`}>
      <PanelSidebar
        isMobile={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={adminMenuItems}
        panelTitle="Panel Administrativo"
        logo={
          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Bus className="h-5 w-5 text-white" />
          </div>
        }
        user={userData}
      />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <PanelHeader toggleSidebar={toggleSidebar} user={userData} logout_redirectTo="/enruta/" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
