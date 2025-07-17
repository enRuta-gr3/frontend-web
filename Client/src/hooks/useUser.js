import { useState, useCallback } from "react"
import { getUserByIDcard, getAllUser, deleteUserByAdmin, registerInternalUser, uploadCSVFile, validateUserBySeller } from "@/services"

export default function useUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])

  const searchUserByCedula = useCallback(async (ci, tipo_usuario = "CLIENTE") => {
    try {
      setLoading(true)
      setError(null)
      setUser(null)

      const userData = {
        tipo_usuario: tipo_usuario,
        ci: String(ci),
      }

     

      const response = await getUserByIDcard({ ...userData })
      console.log("Respuesta del backend al buscar usuario por cedula: ",response)
      
      return response
    } catch (err) {
     
      const errorMessage = err.message || "Error al buscar el usuario"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // fecthAllUser es una funcion totalmente flexible que trae todos los usuarios de la bd o
  // todos los usuarios filtrados  por tipo_usuario
  const fetchUser = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await getAllUser()
      //console.log("Response.data: ",JSON.stringify(response.data,null,2))

      const fetchedUsers = response.data || []

      setUsers(fetchedUsers)
      return response
    } catch (err) {
     
      const errorMessage = err.message || "Error al obtener todos los usuarios."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // recive userData = {emial:String} y token: access_token
  const removeUser = useCallback(async (userData, token) => {
    try {
      setLoading(true)
      setError(null)
      const response = await deleteUserByAdmin(userData, token)
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al eliminar usuario"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // 1. cargo archivo, si fue exitoso
  // 1.2 llamo a registerInternalUser
  // 2. si no fue exitoso retorno error.
  const bulkUploadAndRegisterUsers = useCallback(async (file) => {
    try {
      setLoading(true)
      setError(null)

  

      const uploadResponse = await uploadCSVFile(file)
   

      if (uploadResponse?.success) {
        

        const registerResponse = await registerInternalUser()
      
        if (registerResponse?.success) {
          const successMessage = `Carga masiva completada: ${registerResponse.data?.totalLineasOk || 0} usuarios registrados exitosamente.`
          console.log("✅ [useUser] Proceso completado:", successMessage)

          return {
            success: true,
            message: successMessage,
            data: registerResponse.data,
          }
        } else {
          const errorMessage = registerResponse?.message || "Error al registrar usuarios desde archivo."
          console.error("❌ [useUser] Error en registro:", errorMessage)
          throw new Error(errorMessage)
        }
      } else {
        const errorMessage = uploadResponse?.message || "Error al cargar el archivo."
        console.error("❌ [useUser] Error en carga:", errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("❌ [useUser] Error en carga masiva:", err)
      const errorMessage = err.message || "Error en carga masiva."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const validateUserDiscount = async (uuidAuth) => {
    setLoading(true)
    setError(null)
    try {
      const response = await validateUserBySeller(uuidAuth)
      return response
    } catch (error) {
      setError(error.message || "Error al validar descuento")
      return null
    } finally {
      setLoading(false)
    }
  }


  return {
    loading,
    error,
    user,
    users,
    searchUserByCedula,
    fetchUser,
    removeUser,
    clearUser,
    clearError,
    bulkUploadAndRegisterUsers,
    validateUserDiscount,
  }
}
