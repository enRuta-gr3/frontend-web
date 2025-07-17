import { useState } from "react"
import { authAdapter } from "@/adapters"
import { useNavigate } from "react-router-dom"
import { AUTH_NOTIFICATION_CONFIG } from "../lib/authUtils"

/**
 * Hook personalizado para gestionar el registro de usuarios.
 *
 * Este hook maneja el proceso de registro, incluyendo el envío de datos al backend,
 * la gestión de estados de carga y error, y la notificación al usuario.
 *
 * @returns {Object} - Un objeto con la función handleRegister, el estado loading y el error.
 * @property {function} handleRegister - Función asíncrona que envía los datos al backend y gestiona el registro.
 * @property {boolean} loading - Indica si la petición de registro está en curso.
 * @property {string|null} error - Mensaje de error si ocurre alguno durante el registro.
 *
 * @example
 * const { handleRegister, loading, error } = useRegister();
 * handleRegister({ nombres: "Juan", apellidos: "Pérez", email: "test@test.com", ... });
 */
const useRegister = () => {
  // Estado para indicar si la petición está en curso
  const [loading, setLoading] = useState(false)
  // Estado para almacenar mensajes de error
  const [error, setError] = useState("")

  // Hook de React Router para redireccionar
  const navigate = useNavigate()

  // Configuración de la notificación de registro exitoso
  const registerNotificationConfig = {
    ...AUTH_NOTIFICATION_CONFIG,
    type: "success",
    onClose: () => navigate("/login"),
  }

  /**
   * Envía los datos del formulario de registro al backend y gestiona la respuesta.
   *
   * @param {Object} formData - Objeto con los datos del formulario de registro.
   * @property {string} formData.nombres - Nombres del usuario.
   * @property {string} formData.apellidos - Apellidos del usuario.
   * @property {string} formData.email - Correo electrónico del usuario.
   * @property {string} formData.contraseña - Contraseña elegida.
   * @property {string} formData.ci - Cédula de identidad.
   * @property {string} formData.fecha_nacimiento - Fecha de nacimiento.
   * @property {string} formData.tipo_usuario - Tipo de usuario (por defecto "CLIENTE").
   * @property {string} formData.tipo_descuento - Tipo de descuento seleccionado.
   * @property {boolean} formData.esJubilado - Si el usuario es jubilado.
   * @property {boolean} formData.esEstudiante - Si el usuario es estudiante.
   * @property {boolean} formData.terms - Si aceptó los términos y condiciones.
   *
   * @returns {Promise<void>}
   *
   * @example
   * await handleRegister({ nombres: "Juan", apellidos: "Pérez", email: "test@test.com", ... });
   */
  const handleRegister = async ({ ...userData }) => {
    setLoading(true)
    setError("")

    try {
      // Mostrar en consola los datos enviados y respuesta en grupo
      console.group("🛂 Proceso de Registro")
      console.log("[useRegister - handleRegister] Datos enviados al backend:", userData)

      // Llamada al adaptador de autenticación para registrar el usuario
      const responseData = await authAdapter.register(userData)

      // Mostrar en consola la respuesta del backend
      console.log("[useRegister - handleRegister] Respuesta del backend:", responseData)
      console.groupEnd()

      // Verificar si la respuesta indica éxito
      if (responseData && responseData.success) {
        return responseData.data // Retornar los datos del usuario registrado
      } else {
        const errorMessage = responseData.message || responseData.data || "Error en el registro"  // mejorar la captura de errores
        throw new Error(errorMessage)
      }
    } catch (error) {
      // Manejo de errores de autenticación
      setError(error.response?.data.data)
      throw error // Re-lanzar el error para que el componente pueda manejarlo
    } finally {
      setLoading(false)
    }
  }

  // Retorna la función de registro, el estado de carga y el error
  return { handleRegister, loading, error }
}

export default useRegister
