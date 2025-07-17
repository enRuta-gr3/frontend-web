
import { useState } from "react"
import { Button, Input, ThemeSwitcher } from "@/components"
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, User } from "lucide-react"
import { Link } from "react-router-dom"
import logo from "@/assets/logo.webp"
import useLogin from "@/hooks/useLogin"
import useThemeStore from "@/store/useThemeStore"
import { validateLoginForm } from "@/lib/validations"
import "react-toastify/dist/ReactToastify.css"


export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    contraseña: "",
  })
  const [errors, setErrors] = useState({})

  const { handleLogin, loading, error } = useLogin()
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()


 
    setErrors({})

    if (validateLoginForm(formData, setErrors)) {
      try {
          await handleLogin({
          email: formData.email,
          contraseña: formData.contraseña,
        })
      
      } catch (error) {
        console.error("❌[Login - handleSubmit] Error:", error)
      }
    }

    return false
  }

  return (
    <section className={`min-h-screen flex flex-col items-center justify-center p-4`}>
       
      {/* Barra de navegación  */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"} hover:text-orange-500 transition-colors`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {/* la imagen de fondo con opacidad y gradiente según el tema */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isDarkMode ? "from-black/90 via-black/80 to-black/90" : "from-white/80 via-white/70 to-white/80"
          } z-10`}
        ></div>
        <img
          src="/bus2.webp"
          alt="Background"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-60" : "opacity-40"}`}
        />

        {/* elementos decorativos */}
        <div
          className={`absolute top-20 left-20 w-40 h-40 rounded-full ${isDarkMode ? "bg-orange-500/20" : "bg-orange-500/10"} filter blur-3xl`}
        ></div>
        <div
          className={`absolute bottom-20 right-20 w-60 h-60 rounded-full ${isDarkMode ? "bg-orange-500/10" : "bg-orange-500/5"} filter blur-3xl`}
        ></div>
      </div>

      <div className="max-w-md w-full relative z-10 mt-16">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Link to="/">
              <img src={logo || "/placeholder.svg"} className="h-full rounded-full text-white" alt="Logo En Ruta" />
            </Link>
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>En Ruta</h1>
          <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>uniendo caminos</p>
        </div>

        {/* Login card */}
        <div
          className={`${
            isDarkMode ? "bg-white/10 border-white/10" : "bg-white/80 border-white/20"
          } backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border`}
        >
          <div className="p-8">
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"} mb-2`}>
              Iniciar sesión
            </h2>
            <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} mb-6`}>
              Bienvenido de nuevo, ingresa tus credenciales
            </p>

            {/* Mostramos errores del backend ANTES del formulario */}
            {error && (
              <div
                className={`mb-4 text-center px-4 py-3 rounded-md border flex items-center ${
                  isDarkMode ? "bg-red-900/20 text-red-300 border-red-700" : "bg-red-100 text-red-700 border-red-400"
                }`}
              >
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* campo del email */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"} mb-1`}
                  >
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User className={`h-5 w-5 ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`} />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="email"
                      placeholder="tu@correo.com o tu cédula 12345678"
                      className={`pl-10 h-12 ${
                        isDarkMode
                          ? "bg-neutral-800 border-neutral-700 text-white"
                          : "bg-white/70 border-neutral-300 text-neutral-800"
                      } focus:border-orange-500 focus:ring-orange-500 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* campo password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                    >
                      Contraseña
                    </label>
                    <Link to="/recuperar-contraseña" className="text-xs text-orange-500 hover:text-orange-600">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className={`h-5 w-5 ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`} />
                    </div>
                    <Input
                      id="password"
                      name="contraseña"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`pl-10 h-12 ${
                        isDarkMode
                          ? "bg-neutral-800 border-neutral-700 text-white"
                          : "bg-white/70 border-neutral-300 text-neutral-800"
                      } focus:border-orange-500 focus:ring-orange-500 ${errors.contraseña ? "border-red-500" : ""}`}
                      value={formData.contraseña}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? "text-neutral-500 hover:text-white" : "text-neutral-600 hover:text-neutral-800"
                      }`}
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.contraseña && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contraseña}
                    </div>
                  )}
                </div>

               

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Login</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div
            className={`p-6 ${
              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100/80 border-neutral-200"
            } border-t text-center`}
          >
            <p className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>
              ¿No tienes una cuenta?{" "}
              <Link to="/registrarse" className="text-orange-500 hover:text-orange-600 font-medium">
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
