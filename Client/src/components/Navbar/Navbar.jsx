import { useState, useEffect } from "react"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.webp"
import useAuthStore from "@/store/useAuthStore"
import { ThemeSwitcher } from "@/components"
import useThemeStore from "@/store/useThemeStore"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoggingOut(false)
    }
  }


  const shouldHaveBackground = scrolled || !isDarkMode

  // Colores dinámicos
  const navBg = shouldHaveBackground ? (isDarkMode ? "bg-neutral-900" : "bg-white") : "bg-transparent"

  const textPrimary = shouldHaveBackground ? (isDarkMode ? "text-white" : "text-black") : "text-white"

  const textSecondary = isDarkMode ? "text-neutral-300" : "text-neutral-700"
  const textMuted = isDarkMode ? "text-neutral-400" : "text-neutral-500"
  const textMutedAlt = isDarkMode ? "text-neutral-400" : "text-neutral-400"
  const hoverLink = isDarkMode ? "hover:text-white" : "hover:text-orange-500"
  const navShadow = shouldHaveBackground ? "shadow-md" : ""
  const mobileMenuBg = isDarkMode ? "bg-neutral-900" : "bg-white"

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", navBg, navShadow)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shadow-orange-500">
              <img src={logo || "/placeholder.svg"} className="h-9 rounded-full" alt="Logo" />
            </div>
            <div>
              <span className={`text-xl font-bold ${textPrimary}`}>En Ruta</span>
              <p className={`text-xs ${shouldHaveBackground ? textMuted : textMutedAlt} -mt-1`}>uniendo caminos</p>
            </div>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8"></nav>

          {/* Botones extras (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <User className="h-4 w-4 mr-2" />
                    Mi cuenta
                  </Button>
                </Link>

                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <User className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>

          {/* Botón mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" className={textPrimary} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú Mobile */}
      {isMenuOpen && (
        <div className={`${mobileMenuBg} md:hidden py-4 shadow-lg`}>
          <div className="container mx-auto px-4 space-y-4">
            <div className="pt-2 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2">
                    <Link to="/profile">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        <User className="h-4 w-4 mr-2" />
                        Mi cuenta
                      </Button>
                    </Link>

                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                    </Button>
                  </div>

                  <span className={`text-sm font-medium ${textSecondary} mt-2`}>{user?.nombres}👋</span>
                </>
              ) : (
                <Link to="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <User className="h-4 w-4 mr-2" />
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
