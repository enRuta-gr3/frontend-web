import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock,  Eye, EyeOff, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import { ThemeSwitcher } from "@/components"
import useInternalLogin from "@/hooks/useInternalLogin"
import { validateInternalLoginForm } from "@/lib/validations"
import logo from "@/assets/logo.webp"

export default function AdminSellerLogin() {
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: "",
    contraseña: "",
  })
  const [showPassword, setShowPassword] = useState(false)


  const [statusMessage, setStatusMessage] = useState("")
  const [messageType, setMessageType] = useState("error") // "error" | "success" | "info"

  const { handleLogin, loading, error } = useInternalLogin()
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  // Función para mostrar mensajes con tipo y duración específica
  const showMessage = useCallback((message, type = "error") => {
    setStatusMessage(message)
    setMessageType(type)

    // Duración según el tipo de mensaje
    const duration = type === "error" ? 8000 : type === "success" ? 4000 : 6000

    setTimeout(() => {
      setStatusMessage("")
    }, duration)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
    })

 
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

   
    if (statusMessage) {
      setStatusMessage("")
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()


    setStatusMessage("")
    setErrors({})

    console.log("[AdminSellerLogin] Iniciando sesion...")

    if (validateInternalLoginForm(formData, setErrors)) {
      
      try {
        const response = await handleLogin({
          email: formData.email,
          contraseña: formData.contraseña,
      })
        if (!response) {
          showMessage("Credenciales incorrectas. Verifica tu usuario y contraseña.", "error")
          return
        }
        // Si llegamos aquí, el login fue exitoso
        showMessage("Acceso autorizado. Redirigiendo...", "success")
      } catch (err) {
        // Manejo específico de diferentes tipos de errores
        let errorMessage = "Error al iniciar sesión. Por favor, inténtalo de nuevo."

        if (err.response?.status === 401) {
          errorMessage = "Usuario o contraseña incorrectos."
        } else if (err.response?.status === 403) {
          errorMessage = "No tienes permisos para acceder al sistema."
        } else if (err.response?.status === 429) {
          errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar nuevamente."
        } else if (err.code === "NETWORK_ERROR") {
          errorMessage = "Error de conexión. Verifica tu conexión a internet."
        } else if (err.message) {
          errorMessage = err.message
        }

        showMessage(errorMessage, "error")
      }
    } else {
      // Si hay errores de validación, mostrar mensaje general
      showMessage("Por favor, corrige los errores en el formulario.", "error")
    }
  }

  // Función para obtener los estilos del mensaje según el tipo
  const getMessageStyles = () => {
    switch (messageType) {
      case "error":
        return {
          container: isDarkMode ? "bg-red-900/30 text-red-300 border-red-800" : "bg-red-50 text-red-800 border-red-200",
          icon: "text-red-500",
          IconComponent: XCircle,
        }
      case "success":
        return {
          container: isDarkMode
            ? "bg-green-900/30 text-green-300 border-green-800"
            : "bg-green-50 text-green-800 border-green-200",
          icon: "text-green-500",
          IconComponent: CheckCircle,
        }
      case "info":
        return {
          container: isDarkMode
            ? "bg-blue-900/30 text-blue-300 border-blue-800"
            : "bg-blue-50 text-blue-800 border-blue-200",
          icon: "text-blue-500",
          IconComponent: AlertCircle,
        }
      default:
        return {
          container: isDarkMode ? "bg-red-900/30 text-red-300 border-red-800" : "bg-red-50 text-red-800 border-red-200",
          icon: "text-red-500",
          IconComponent: AlertCircle,
        }
    }
  }

  const messageStyles = getMessageStyles()

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 
      ${
        isDarkMode
          ? "bg-gradient-to-b from-black/90 via-black/80 to-black/90"
          : "bg-gradient-to-b from-white/80 via-white/70 to-white/80"
      }`}
    >
       <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-end items-center">
          <ThemeSwitcher />
        </div>
      </div>


      <div className="max-w-md w-full">
        {/* Logo y encabezado */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center mb-4">
              <img src={logo || "/placeholder.svg"} className="h-full rounded-full text-white" alt="En Ruta" />
            </div>
          </Link>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Panel Interno</h1>
          <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} text-sm`}>En Ruta</p>
        </div>

        {/* Card de login */}
        <div
          className={`${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white/90 border border-neutral-300 "} 
          rounded-xl shadow-xl overflow-hidden border`}
        >
          <div className="p-8">
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"} mb-6`}>
              Acceso Empresa
            </h2>

            {/* Mensaje de estado*/}
            {(statusMessage || error) && (
              <div className={`px-4 py-3 rounded-lg mb-6 border flex items-center gap-3 ${messageStyles.container}`}>
                <messageStyles.IconComponent className={`h-5 w-5 ${messageStyles.icon} flex-shrink-0`} />
                <span className="font-medium text-sm">{statusMessage || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Campo email */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-900"} mb-1`}
                  >
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="email"
                      type="text"
                      name="email"
                      placeholder="Correo electrónico"
                      className={`pl-10 w-full h-12 rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        ${
                          isDarkMode
                            ? "bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
                            : "bg-neutral-100 border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
                        } ${errors.email ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Campo contraseña */}
                <div>
                  <label
                    htmlFor="contraseña"
                    className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-900"} mb-1`}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="contraseña"
                      type={showPassword ? "text" : "password"}
                      name="contraseña"
                      placeholder="••••••••"
                      className={`pl-10 pr-12 w-full h-12 rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        ${
                          isDarkMode
                            ? "bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
                            : "bg-neutral-100 border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
                        } ${errors.contraseña ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                      value={formData.contraseña}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        isDarkMode ? "text-neutral-500 hover:text-white" : "text-neutral-600 hover:text-neutral-800"
                      }`}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.contraseña && (
                    <div className="flex items-center mt-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{errors.contraseña}</span>
                    </div>
                  )}
                  <div className="flex justify-end mt-1">
                    {/* <Link
                      to="/recuperar-contraseña"
                      className={`text-xs mt-2 font-medium underline ${
                        isDarkMode ? "text-orange-300 hover:text-white" : "text-orange-600 hover:text-orange-800"
                      } transition-colors`}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link> */}
                  </div>
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white h-12 rounded-lg font-medium transition-colors flex items-center justify-center mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Verificando...</span>
                    </div>
                  ) : (
                    <span>Ingresar al sistema</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
