import { useState, useEffect } from "react"
import PanelSidebar from "@/components/layouts/PanelSidebar"
import PanelHeader from "@/components/layouts/PanelHeader"
import { User, Ticket, Key, Home } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"

const profileMenuItems = [
  {
    title: "Volver al home",
    icon: <Home className="h-5 w-5" />,
    path: "/",
  },
  {
    title: "Mi cuenta",
    icon: <User className="h-5 w-5" />,
    path: "/profile/account",
  },
  {
    title: "Mis pasajes",
    icon: <Ticket className="h-5 w-5" />,
    path: "/profile/historial-pasajes",
  },
  {
    title: "Cambiar contraseña",
    icon: <Key className="h-5 w-5" />,
    path: "/profile/cambiar-contraseña",
  }
]

export default function ProfileLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const usuario = useAuthStore(state => state.user)

  const userData = {
    name: `${usuario.nombres} ${usuario.apellidos}`,
    role: usuario.role,
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-neutral-800" : "bg-neutral-50"}`}>
      <PanelSidebar
        isMobile={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={profileMenuItems}
        panelTitle="Mi Cuenta"
        logo={
          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        }
        user={userData}
      />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <PanelHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={userData}
          logout_redirectTo="/login"
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}