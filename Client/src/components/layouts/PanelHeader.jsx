import { useState, useRef, useEffect } from "react"
import { User, Settings, LogOut, Menu } from "lucide-react"
import { ThemeSwitcher, NotificationPanel } from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"
import { useNavigate } from "react-router-dom"
import { ModifyProfileModal } from "@/components/"

export default function PanelHeader({
  toggleSidebar,
  user = { name: "Usuario", role: "rol" },
  rightActions = null,
  showMenuButton = false,
  logout_redirectTo = "/",
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const currentUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout) 
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false) 
  const userMenuRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  
  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    setIsLoggingOut(true)

    try {
      if(currentUser?.tipo_usuario === "ADMINISTRADOR" || currentUser?.tipo_usuario === "VENDEDOR") logout_redirectTo = '/enRuta/'
      else logout_redirectTo = '/' // si no es usuario interno redirige al home
      await logout()
      navigate(logout_redirectTo)
    } catch (error) {
      // Aunque haya error, redirigir igual ya que el estado local se limpió
      navigate(logout_redirectTo)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleModifyProfile = () => {
    setIsUserMenuOpen(false)


    if (currentUser?.tipo_usuario === "CLIENTE") {
      navigate("/profile/account")
    } else {
      // Para admin y vendedor, abrir modal
      setIsProfileModalOpen(true)
    }
  }

  const handleCancelConfirm = () => {
    setIsDeleteModalOpen(false)
  }

  const getUserTypeForModal = () => {
    return currentUser?.tipo_usuario || "CLIENTE"
  }

  return (
    <>
      <header
        className={`h-16 flex items-center justify-between px-4 lg:px-6 border-b
          ${isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}
      >
        <div className="flex items-center">
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className={`mr-4 p-2 rounded-md ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"} lg:hidden`}
            >
              <Menu className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-neutral-700"}`} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <ThemeSwitcher />
          {rightActions}

          {/* Panel de notificaciones */}
          <NotificationPanel uuidAuth={currentUser?.uuidAuth} isDarkMode={isDarkMode} />

          <div className="relative cursor-pointer" ref={userMenuRef}>
            <button className="flex items-center space-x-2" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center 
                  ${isDarkMode ? "bg-neutral-700" : "bg-neutral-200"}`}
              >
                <User className={`h-5 w-5 cursor-pointer ${isDarkMode ? "text-white" : "text-neutral-500"}`} />
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{user.name}</p>
                <p className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>{user.role}</p>
              </div>
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50
                  ${isDarkMode ? "bg-neutral-800 border border-neutral-700" : "bg-white border border-neutral-200"}`}
              >
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{user.name}</p>
                  <p className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>{user.role}</p>
                </div>

                {/* Modificar Perfil - según tipo de usuario */}
                <button
                  onClick={handleModifyProfile}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    isDarkMode ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-100"
                  } flex items-center`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Modificar Perfil
                </button>

                {/* Botón de logout */}
                <button
                  className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
                    isDarkMode ? "text-neutral-300 hover:bg-neutral-700" : "text-neutral-700 hover:bg-neutral-100"
                  } flex items-center ${isLoggingOut ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? "animate-spin" : ""}`} />
                  {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de modificar perfil para Admin y Vendedor */}
      <ModifyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userType={getUserTypeForModal()}
      />
    </>
  )
}

// ultimo cambio ahora 20:03