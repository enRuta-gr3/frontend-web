import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import useAuthStore from "@/store/useAuthStore"
import useThemeStore from "@/store/useThemeStore"
import CustomForm from "@/components/Forms/CustomForm"
import { modificarPerfil } from "@/services"


export default function ModifyProfileModal({ isOpen, onClose, userType = "CLIENTE" }) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const usuario = useAuthStore((state) => state.user)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const successTimeout = useRef(null)
  const errorTimeout = useRef(null)

  useEffect(() => {
    return () => {
      clearTimeout(successTimeout.current)
      clearTimeout(errorTimeout.current)
    }
  }, [])

 
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("")
      setErrorMessage("")
    }
  }, [isOpen])

  function convertirFechaAInput(dateStr) {
    if (!dateStr) return ""
    return dateStr.split("T")[0] // "2024-06-14T00:00:00Z" => "2024-06-14"
  }

  const initialValues = {
    nombres: usuario?.nombres || "",
    apellidos: usuario?.apellidos || "",
    ci: usuario?.ci || "",
    email: usuario?.email || "",
    fecha_nacimiento: convertirFechaAInput(usuario?.fecha_nacimiento),
  }

  // Campos base para todos los usuarios
  const baseFields = [
    {
      name: "nombres",
      label: "Nombres",
      type: "text",
      required: true,
      placeholder: "Ingrese sus nombres",
    },
    {
      name: "apellidos",
      label: "Apellidos",
      type: "text",
      required: true,
      placeholder: "Ingrese sus apellidos",
    },
    {
      name: "ci",
      label: "Cédula de Identidad",
      type: "text",
      disabled: true, // Siempre deshabilitado
      placeholder: "Cédula de identidad",
    },
    {
      name: "email",
      label: "Correo electrónico",
      type: "email",
      required: true,
      placeholder: "ejemplo@enruta.com",
    },
    {
      name: "fecha_nacimiento",
      label: "Fecha de nacimiento",
      type: "date",
      required: true,
    },
  ]

  // Campos específicos según el tipo de usuario
  const getFieldsForUserType = () => {
    switch (userType) {
      case "ADMINISTRADOR":
        return [
          ...baseFields,
         
        ]
      case "VENDEDOR":
        return [
          ...baseFields,
        ]
      case "CLIENTE":
      default:
        return baseFields
    }
  }

  const validate = (values) => {
    const errors = {}
    if (!values.nombres?.trim()) errors.nombres = "El nombre es obligatorio"
    if (!values.apellidos?.trim()) errors.apellidos = "Los apellidos son obligatorios"
    if (!values.email?.trim()) errors.email = "El email es obligatorio"
    if (!values.fecha_nacimiento) errors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
    return errors
  }

  const handleSubmit = async (values) => {
    setErrorMessage("")
    setSuccessMessage("")
    setLoading(true)

    const data = {
      tipo_usuario: usuario.tipo_usuario,
      uuidAuth: usuario.uuidAuth,
      ci: usuario.ci,
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      email: values.email.trim(),
      fecha_nacimiento: values.fecha_nacimiento,
    }

    try {
      console.log("🔄 [ModifyProfileModal] Actualizando perfil:", data)
      await modificarPerfil(data)

     
      useAuthStore.getState().login(data, useAuthStore.getState().token, useAuthStore.getState().role)
      setSuccessMessage("Perfil actualizado correctamente ✅")

  
      if (successTimeout.current) clearTimeout(successTimeout.current)
      successTimeout.current = setTimeout(() => {
        setSuccessMessage("")
        onClose()
      }, 2000)
    } catch (error) {
      setErrorMessage("Hubo un problema al actualizar tus datos. Intentá nuevamente.")
      if (errorTimeout.current) clearTimeout(errorTimeout.current)
      errorTimeout.current = setTimeout(() => setErrorMessage(""), 4000)
    } finally {
      setLoading(false)
    }
  }

  const getTitleByUserType = () => {
    switch (userType) {
      case "ADMINISTRADOR":
        return "Modificar Perfil de Administrador"
      case "VENDEDOR":
        return "Modificar Perfil de Vendedor"
      case "CLIENTE":
      default:
        return "Modificar Mi Perfil"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-xl shadow-2xl ${
          isDarkMode ? "bg-neutral-900 border border-neutral-800" : "bg-white border border-neutral-200"
        } max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            {getTitleByUserType()}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Mensajes de estado */}
          {successMessage && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg border text-center ${
                isDarkMode
                  ? "bg-green-900/20 text-green-300 border-green-700"
                  : "bg-green-100 text-green-700 border-green-300"
              }`}
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg border text-center ${
                isDarkMode ? "bg-red-900/20 text-red-300 border-red-700" : "bg-red-100 text-red-700 border-red-300"
              }`}
            >
              {errorMessage}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
              <span className={`ml-3 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Actualizando perfil...</span>
            </div>
          ) : (
            <CustomForm
              initialValues={initialValues}
              fields={getFieldsForUserType()}
              onSubmit={handleSubmit}
              submitText="Guardar cambios"
              validate={validate}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}
