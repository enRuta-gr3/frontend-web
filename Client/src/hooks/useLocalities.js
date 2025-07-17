import { useState, useEffect,useCallback } from "react"
import { getLocalities, createNewLocality, uploadCSVFile,massiveLocalities } from "@/services"

const useLocalities = () => {
  const [localities, setLocalities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Siempre carga las localidades desde el backend.
   */
  const loadLocalities = async () => {

    setLoading(true)
    setError(null)

    try {
      const response = await getLocalities()
    
      setLocalities(response)
    } catch (err) {
      console.error("❌ Error al cargar localidades:", err)
      setError("No se pudieron cargar las localidades.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crea una nueva localidad y luego recarga la lista desde el backend.
   */
  const handleCreateLocality = async (formValues) => {
    setLoading(true)
    setError(null)

    try {
      if (!formValues.id_departamento || !formValues.nombreLocalidad || !formValues.nombreDepartamento) {
        throw new Error("Datos incompletos para crear la localidad")
      }

      const localityData = {
        nombreLocalidad: formValues.nombreLocalidad.trim(),
        departamento: {
          id_departamento: parseInt(formValues.id_departamento),
          nombreDepartamento: formValues.nombreDepartamento,
        },
      }

      const response = await createNewLocality(localityData)

      // Ajustá esto según la estructura real de tu backend
      if (response?.id_localidad || response?.data?.id_localidad) {
        
        await loadLocalities()
      }

      return response
    } catch (err) {
      const msg = err.message || "No se pudo crear la localidad."
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carga masiva de localidades y luego refresca la lista.
   */
  const bulkUploadAndRegisterLocalities = useCallback(
    async (file) => {
      try {
        setLoading(true)
        setError(null)

       

        const uploadResponse = await uploadCSVFile(file)
       

        if (uploadResponse?.success) {
          

          const registerResponse = await massiveLocalities()
          

          if (registerResponse?.success) {
            const successMessage = `Carga masiva completada: ${registerResponse.data?.totalLineasOk || 0} localidades registradas exitosamente.`
            

            // Recargar localidades
            await loadLocalities()

            return {
              success: true,
              message: successMessage,
              data: registerResponse.data,
            }
          } else {
            const errorMessage = registerResponse?.message || "Error al registrar localidades desde archivo."
            console.error("❌ [useLocalities] Error en registro:", errorMessage)
            throw new Error(errorMessage)
          }
        } else {
          const errorMessage = uploadResponse?.message || "Error al cargar el archivo."
          console.error("❌ [useLocalities] Error en carga:", errorMessage)
          throw new Error(errorMessage)
        }
      } catch (err) {
        console.error("❌ [useLocalities] Error en carga masiva:", err)
        const errorMessage = err.message || "Error en carga masiva."
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [loadLocalities],
  )

  useEffect(() => {
    loadLocalities() 
  }, [])

  return {
    localities,
    loading,
    error,
    loadLocalities,
    handleCreateLocality,
    bulkUploadAndRegisterLocalities,
  }
}

export default useLocalities


