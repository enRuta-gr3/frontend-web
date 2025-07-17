import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { validateStep1, validateStep2 } from "@/lib/validations"
import { Step1, Step2, FormStepsIndicator, SubmitButton } from "@/components"
import logo from "@/assets/logo.webp"
import useRegister from "@/hooks/useRegister"
import useThemeStore from "@/store/useThemeStore"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ThemeSwitcher } from "@/components"
import { ArrowLeft } from "lucide-react"
import { AUTH_NOTIFICATION_CONFIG } from "@/lib/authUtils"
import { notify, notifyEmailConfirmation } from "@/lib/notify"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    ci: "",
    contraseña: "",
    confirmarContraseña: "",
    tipo_usuario: "CLIENTE",
    fecha_nacimiento: "",
    tipo_descuento: "Ninguno",
    esJubilado: false,
    esEstudiante: false,
    terms: false,
  })

  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)

  const { handleRegister, loading, error } = useRegister()

  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleDiscountChange = (tipo_descuento) => {
    setFormData((prev) => ({
      ...prev,
      tipo_descuento,
      esJubilado: tipo_descuento === "jubilado",
      esEstudiante: tipo_descuento === "estudiante",
    }))
  }

  // Hook de React Router para redireccionar
  const navigate = useNavigate()

  // Configuración de la notificación de registro exitoso
  const registerNotificationConfig = {
    ...AUTH_NOTIFICATION_CONFIG,
    type: "success",
    onClose: () => navigate("/login"),
  }

  // Función para volver al paso anterior
  const handleBackStep = () => {
    if (step === 2) {
      setStep(1)
      setErrors({}) // Limpiar errores al volver
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({}) // limpiamos los errores

    if (step === 1) {
      try {
        const step1Errors = validateStep1(formData)
        setErrors(step1Errors)
        if (Object.keys(step1Errors).length === 0) setStep(2)
      } catch (err) {
        setErrors({ general: "Error inesperado en la validación" })
      }
      return
    }

    if (step === 2) {
      const step2Errors = validateStep2(formData)
      setErrors(step2Errors)

      if (Object.keys(step2Errors).length === 0 && !loading) {
        try {
          const userData = {
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            email: formData.email,
            fecha_nacimiento: formData.fecha_nacimiento,
            ci: formData.ci,
            esJubilado: formData.esJubilado,
            esEstudiante: formData.esEstudiante,
            contraseña: formData.contraseña,
            tipo_usuario: formData.tipo_usuario,
          }

         
          const registeredUser = await handleRegister(userData)

          notifyEmailConfirmation(registeredUser, registerNotificationConfig.autoClose, () => navigate("/login"))
        } catch (err) {
          console.error("❌ Error en el registro:", err)
          // El error ya está siendo manejado por el hook useRegister
          // No necesitamos hacer nada más aquí, el error se mostrará automáticamente
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ToastContainer />

      {/* Barra de navegación  */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className={`flex items-center ${
              isDarkMode ? "text-white" : "text-neutral-800"
            } hover:text-orange-500 transition-colors`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {/* Fondo con gradiente  */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isDarkMode ? "from-black/90 via-black/80 to-black/90" : "from-white/80 via-white/70 to-white/80"
          } z-10`}
        />
        <img
          src="/bus2.jpg?height=800&width=1200"
          alt="Background"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-60" : "opacity-40"}`}
        />
        <div
          className={`absolute top-20 left-20 w-40 h-40 rounded-full ${
            isDarkMode ? "bg-orange-500/20" : "bg-orange-500/10"
          } filter blur-3xl`}
        />
        <div
          className={`absolute bottom-20 right-20 w-60 h-60 rounded-full ${
            isDarkMode ? "bg-orange-500/10" : "bg-orange-500/5"
          } filter blur-3xl`}
        />
      </div>

      <div className="max-w-md w-full relative z-10 mt-16">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Link to="/">
              <img
                src={logo || "/placeholder.svg"}
                className="h-full rounded-full text-white cursor-pointer"
                alt="Logo En Ruta"
              />
            </Link>
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>En Ruta</h1>
          <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>uniendo caminos</p>
        </div>

        <div
          className={`${
            isDarkMode ? "bg-white/10 border-white/10" : "bg-white/80 border-white/20"
          } backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border`}
        >
          <div className="p-8">
            {/* Header con flecha de retroceso para paso 2 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className={`mr-3 p-1 rounded-full transition-colors ${
                      isDarkMode
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-700"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200"
                    }`}
                    title="Volver al paso anterior"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>Crear cuenta</h2>
              </div>
            </div>

            <p className={`${isDarkMode ? "text-neutral-300" : "text-neutral-600"} mb-6`}>
              {step === 1 ? "Ingresa tus datos personales para comenzar" : "Configura tu contraseña para continuar"}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Pasar el estado del tema a los componentes de formulario */}
              {step === 1 ? (
                <Step1
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  handleDiscountChange={handleDiscountChange}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <Step2
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                  showConfirmPassword={showConfirmPassword}
                  toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
                  isDarkMode={isDarkMode}
                />
              )}

              <SubmitButton
                isLoading={loading}
                step={step}
                labels={{
                  continue: "Continuar",
                  submit: "Crear",
                }}
              />
            </form>

            <FormStepsIndicator
              currentStep={step}
              totalSteps={2}
              className="mt-6 justify-center"
              isDarkMode={isDarkMode}
            />

            {error && (
              <div
                className={`mt-4 text-center px-4 py-2 rounded-md border ${
                  isDarkMode ? "bg-red-900/20 text-red-300 border-red-700" : "bg-red-100 text-red-700 border-red-400"
                }`}
              >
                {error}
              </div>
            )}
          </div>

          <div
            className={`p-6 ${
              isDarkMode ? "bg-black/30 border-white/10" : "bg-neutral-100/80 border-neutral-200"
            } border-t text-center`}
          >
            <p className={isDarkMode ? "text-neutral-300" : "text-neutral-600"}>
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className={`${
                  isDarkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-500 hover:text-orange-600"
                } font-medium cursor-pointer`}
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
