import { useState, useEffect } from "react"
import { getAssignedOmnibusPercentage, getBusStatusByMonth } from "@/services/statsService"

export default function useBusStats() {
  const [stats, setStats] = useState({
    current: null,
    monthly: [],
  })

  const [loading, setLoading] = useState({
    current: false,
    monthly: false,
  })

  const [error, setError] = useState({
    current: null,
    monthly: null,
  })

  const loadCurrent = async (force = false) => {
    if (!force && stats.current !== null) return
    setLoading(true)
    setError(null)

    try {
      const resp = await getAssignedOmnibusPercentage()
      setStats(prev => ({
        ...prev,
        current: resp?.data ?? null,
      }))
    } catch (err) {
      console.error("Error al cargar estado actual:", err)
      setError("No se pudo cargar el estado actual")
    } finally {
      setLoading(false)
    }
  }

  const loadMonthly = async (force = false) => {
    if (!force && stats.monthly.length) return
    setLoading(true)
    setError(null)

    try {
      const resp = await getBusStatusByMonth()
      setStats(prev => ({
        ...prev,
        monthly: resp?.data ?? [],
      }))
    } catch (err) {
      console.error("Error al cargar estado mensual:", err)
      setError("No se pudo cargar el estado mensual")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCurrent()
    loadMonthly()
  }, [])

  return {
    currentStats: stats.current,
    monthlyStats: stats.monthly,
    loading,
    error,
    loadCurrent,
    loadMonthly,
  }
}

