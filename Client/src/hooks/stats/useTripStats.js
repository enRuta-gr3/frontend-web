import { useEffect, useState } from "react"
import { getTripsByLocation } from "@/services/statsService"
import useStatsStore from "@/store/useStatsStore"

const useTripsByLocation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { tripsByLocation, setTripsByLocation, clearTripsByLocation } = useStatsStore()

  const loadTripsByLocation = async (force = false) => {
    if (!force && tripsByLocation.length > 0) return
    if (force) clearTripsByLocation()

    setLoading(true)
    setError(null)

    try {
      const data = await getTripsByLocation()
      const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad)
      setTripsByLocation(sorted)
    } catch (err) {
      console.error("❌ Error al cargar viajes por localidad:", err)
      setError("No se pudieron cargar los datos de viajes por localidad.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTripsByLocation()
  }, [])

  return {
    tripsByLocation,
    loading,
    error,
    loadTripsByLocation,
    clearTripsByLocation,
  }
}

export default useTripsByLocation
