import { useState } from "react"
import { authAdapter } from "@/adapters"
import { useNavigate } from "react-router-dom"
import useAuthStore from "@/store/useAuthStore"
import usePendingTripStore from "@/store/usePendingTripStore"
import { notify } from "@/lib/notify"

const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login: storeLogin } = useAuthStore()

  // cargamos si tiene pendiente un viaje y si el viaje pendiente es valido osea no muy antiguo
  const { hasPendingTrip, isPendingTripValid, pendingTripData } = usePendingTripStore()

  const navigate = useNavigate()

  const handleLogin = async ({ email, contraseña }) => {
   

    setLoading(true)
    setError(null)

    try {
      
      const { data: responseData, success, message } = await authAdapter.login({ email, contraseña })


      if (!success) {
        setError(message || "Error de autenticación")
        navigate("/login")
        return null 
      }

      // 🚨 VALIDACIÓN: Solo usuarios CLIENTE pueden acceder
      if (responseData.usuario?.tipo_usuario === "CLIENTE") {

        storeLogin(responseData.usuario, responseData.access_token, "CLIENTE")

        // verificamos que si tiene viaje pendiente, redireccionamos automaticamente hacia el proceso de seleccion de viajes.
        if (hasPendingTrip && isPendingTripValid()) {
          navigate("/search-results" + (pendingTripData?.searchParams || ""), { replace: true })
          setTimeout(() => window.location.reload(), 100)
        }
        //si no tiene viaje pendiente o esta expirado entonces va al home
        if (!hasPendingTrip || !isPendingTripValid()) {
          navigate("/")
        }

        // 🔥 Devolver el usuario para confirmación
        return responseData.usuario
      } else {
        // 🚨 ACCESO DENEGADO - Usuario no es CLIENTE
        

        // 🔥 NOTIFICACIÓN DE ACCESO DENEGADO en top-right
        let mensaje = "Acceso denegado"
        const tipoUsuario = responseData.usuario?.tipo_usuario || "desconocido"

        switch (tipoUsuario) {
          case "VENDEDOR":
            mensaje = `Hola ${responseData.usuario?.nombres || ""}! Los vendedores deben acceder por el panel administrativo.`
            break
          case "ADMINISTRADOR":
            mensaje = `Hola ${responseData.usuario?.nombres || ""}! Los administradores deben acceder por el panel administrativo.`
            break
          default:
            mensaje = "Solo usuarios clientes pueden acceder a esta plataforma."
            break
        }

        // 🔔 Mostrar notificación en top-right
        notify(mensaje, {
          type: "error",
          position: "top-right", // 🎯 Posición solicitada
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        // 🧹 Limpiar datos de autenticación
        localStorage.clear()
        sessionStorage.clear()

        // 🔥 Establecer error para que el componente lo maneje
        setError("Acceso denegado: Solo usuarios clientes pueden iniciar sesión.")

        // 🔥 Devolver null para indicar fallo
        return null
      }
    } catch (err) {
  
      // 🔔 Notificación de error general
      notify("Error inesperado durante el login. Inténtalo de nuevo.", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      setError(err.response?.data?.data || err.message || "Error de conexión")
      return null // 🔥 Devolver null si hay error
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading, error }
}

export default useLogin
