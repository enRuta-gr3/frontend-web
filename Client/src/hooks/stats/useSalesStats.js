import { useState, useEffect } from "react"
import { getReturnedTicketsByMonth, getSoldTicketsByMonth } from "@/services"

export const useReturnedTicketsByMonth = () => {
  const [ticketsByMonth, setTicketsByMonth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadReturnedTicketsByMonth = async (force = false) => {
    if (!force && ticketsByMonth?.length > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await getReturnedTicketsByMonth()
      setTicketsByMonth(response?.data || [])
    } catch (err) {
        console.log(err?.response?.status);
        if (err?.response?.status === 400) {
            setTicketsByMonth([]) // lista vacía → sin datos
        } else {
            console.error("❌ Error al cargar pasajes devueltos:", err)
            setError("No se pudieron cargar los pasajes devueltos.")
        }
    } finally {
      setLoading(false)
    }
  }

  const clearReturnedTicketsByMonth = () => setTicketsByMonth([])

  useEffect(() => {
    loadReturnedTicketsByMonth()
  }, [])

  return {
    ticketsByMonth,
    loading,
    error,
    loadReturnedTicketsByMonth,
    clearReturnedTicketsByMonth,
  }
}

export const useSoldTicketsByMonth = () => {
  const [soldTicketsByMonth, setSoldTicketsByMonth] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSoldTicketsByMonth = async (force = false) => {
    if (!force && soldTicketsByMonth?.length > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await getSoldTicketsByMonth()
      setSoldTicketsByMonth(response?.data || [])
    } catch (err) {
      if (err?.response?.status === 400) {
        setSoldTicketsByMonth([])          // array vacío si 400
      } else {
        console.error("❌ Error al cargar pasajes vendidos:", err)
        setError("No se pudieron cargar los pasajes vendidos.")
      }
    } finally {
      setLoading(false)
    }
  }

  const clearSoldTicketsByMonth = () => setSoldTicketsByMonth([])

  useEffect(() => {
    loadSoldTicketsByMonth()
  }, [])

  return {
    soldTicketsByMonth,
    loading,
    error,
    loadSoldTicketsByMonth,
    clearSoldTicketsByMonth,
  }
}
