import { useState, useEffect, useCallback } from "react"
import { getBuses, getAvailableBuses, createNewBus, massiveBusUpload, changeStatusBus, uploadCSVFile,availableBusForTrip } from "@/services"
import useBusStore from "@/store/useBusStore" 

const useBuses = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { buses, setBuses, clearBuses } = useBusStore()

  // Carga los ómnibus desde el backend (solo si no están cargados o se fuerza)
  const loadBuses = useCallback( async (force = false) => {
    if (!force && buses.length > 0) return
    if (force) clearBuses()

    setLoading(true)
    setError(null)

    try {
      const response = await getBuses()
      const sorted = [...(response?.data || [])].sort((a, b) => a.id_omnibus - b.id_omnibus)
      setBuses(sorted)
    } catch (err) {
      console.error("❌ Error al cargar ómnibus:", err)
      setError("No se pudieron cargar los ómnibus.")
    } finally {
      setLoading(false)
    }
  },[buses.length, clearBuses, setBuses])

  const handleCreateBus = async (formValues) => {
    setLoading(true)
    setError(null)

    try {
    
      const response = await createNewBus(formValues)
      if (response?.data?.id_omnibus) {
        await loadBuses(true) // Recarga después del alta
      }
      return response
    } catch (err) {
      setError(err.message || "No se pudo crear el ómnibus.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkUploadAndRegisterBuses = useCallback(
    async (file) => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 [useBuses] Iniciando carga masiva con archivo:", file.name)

        const uploadResponse = await uploadCSVFile(file)
        console.log("📋 [useBuses] Respuesta de carga de archivo:", uploadResponse)

        if (uploadResponse?.success) {
          console.log("✅ [useBuses] Archivo cargado exitosamente, registrando buses...")

          const registerResponse = await massiveBusUpload()
          console.log("📋 [useBuses] Respuesta de registro:", registerResponse)

          if (registerResponse?.success) {
            const successMessage = `Carga masiva completada: ${registerResponse.data?.totalLineasOk || 0} buses registrados exitosamente.`
            console.log("✅ [useBuses] Proceso completado:", successMessage)

            // Recargar buses
            await loadBuses()

            return {
              success: true,
              message: successMessage,
              data: registerResponse.data,
            }
          } else {
            const errorMessage = registerResponse?.message || "Error al registrar buses desde archivo."
            
            throw new Error(errorMessage)
          }
        } else {
          const errorMessage = uploadResponse?.message || "Error al cargar el archivo."
        
          throw new Error(errorMessage)
        }
      } catch (err) {
        const errorMessage = err.message || "Error en carga masiva."
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [loadBuses],
  )

  const handleChangeStatusBus = async (formValues) => {
    setLoading(true)
    setError(null)

    try {
      const response = await changeStatusBus(formValues)
      if (response?.success){
        await loadBuses(true) //Recarga después del alta
      }
   
      return response
    } catch (err) {
      setError(err.message || "No se pudo cambiar de estado el omnibus")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // listar omnibus disponibles para viaje a reasignar
  const loadAvailableBus = useCallback(async (id_viaje) => {
    setLoading(true)
    setError(null)

    try {
      const response = await availableBusForTrip(id_viaje)
      if (response?.success) {
        return response.data || []
      } else {
        setError(response?.message || "Error al obtener ómnibus disponibles.")
        return []
      }
    } catch (err) {
     
      setError(err.message || "Error al obtener ómnibus disponibles.")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAvailableBusForNewTrip = useCallback(async (tripData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await getAvailableBuses(tripData)
      if (response?.success) {
        return (response.data || []).filter((bus) => bus.activo)
      } else {
        setError(response?.message || "No se pudieron obtener ómnibus disponibles.")
        return []
      }
    } catch (err) {
      console.error("❌ [useBuses] Error al listar buses disponibles para nuevo viaje:", err)
      setError(err.message || "Error inesperado al obtener ómnibus.")
      return []
    } finally {
      setLoading(false)
    }
  }, [])



  useEffect(() => {
    loadBuses()
  }, [])

  return {
    buses,
    loading,
    error,
    loadBuses,
    handleCreateBus,
    bulkUploadAndRegisterBuses,
    clearBuses,
    handleChangeStatusBus,
    loadAvailableBus, 
    loadAvailableBusForNewTrip,
  }
}

export default useBuses
