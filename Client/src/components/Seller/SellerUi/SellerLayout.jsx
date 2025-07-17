import { useState, useEffect } from "react"
import PanelSidebar from "@/components/layouts/PanelSidebar"
import PanelHeader from "@/components/layouts/PanelHeader"
import { Users, Bus, MapPin, Calendar, ShoppingCart, BarChart,RotateCcw } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"

const sellerMenuItems = [
  {
    title: "Usuarios",
    icon: <Users className="h-5 w-5" />,
    path: "/enRuta/vendedor/usuarios",
  },
  {
    title: "Ómnibus",
    icon: <Bus className="h-5 w-5" />,
    path: "/enRuta/vendedor/omnibus",
  },
  {
    title: "Localidades",
    icon: <MapPin className="h-5 w-5" />,
    path: "/enRuta/vendedor/localidades",
  },
  {
    title: "Viajes",
    icon: <Calendar className="h-5 w-5" />,
    path: "/enRuta/vendedor/viajes",
  },
  {
    title: "Vender Pasaje",
    icon: <ShoppingCart className="h-5 w-5" />,
    path: "/enRuta/vendedor/vender-pasaje",
  },
  {
    title: "Devoluciones", 
    icon: <RotateCcw className="h-5 w-5" />,
    path: "/enRuta/vendedor/devoluciones",
  },
  {
    title: "Estadísticas",
    icon: <BarChart className="h-5 w-5" />,
    path: "/enRuta/vendedor/estadistica",
    subMenu: [
      { title: "Viajes", path: "/enRuta/vendedor/estadistica/viajes" },
      { title: "Pajases", path: "/enRuta/vendedor/estadistica/pasajes" },
      { title: "Ómnibus", path: "/enRuta/vendedor/estadistica/omnibus" },
    ],
  },
]

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const usuario = useAuthStore((state) => state.user)

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) 
      }
    }

    // Establecer el estado inicial
    handleResize()

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
        menuItems={sellerMenuItems}
        panelTitle="Panel de Vendedor"
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
