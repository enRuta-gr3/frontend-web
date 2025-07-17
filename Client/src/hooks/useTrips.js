import { useState, useEffect, useCallback } from "react"
import { getTravels,reasignTrip,getTripsByBus } from "@/services"

export default function useTrips(initialParams=null) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Función para cargar todos los viajes una sola vez
  const loadTrips = useCallback(async () => {
    if (hasSearched) return // Evitar múltiples peticiones

    setLoading(true)
    setError(null)

    try {

      const response = await getTravels()
      

      // Verificar que la respuesta tenga la estructura esperada
      if (!response || !response.success || !Array.isArray(response.data)) {
        throw new Error("Formato de respuesta inválido")
      }

     
      // Transformar los datos de la API al formato del frontend
      const transformedTrips = response.data.map((trip) => {
        const transformed = {
          id: trip.id_viaje,
          origin: trip.localidadOrigen.nombreLocalidad,
          destination: trip.localidadDestino.nombreLocalidad,
          departureDate: trip.fecha_partida,
          departureTime: trip.hora_partida,
          arrivalDate: trip.fecha_llegada,
          arrivalTime: trip.hora_llegada,
          price: trip.precio_viaje,
          status: trip.estado,
          bus: {
            id: trip.omnibus.id_omnibus,
            capacity: trip.omnibus.capacidad,
            number: trip.omnibus.nro_coche,
            currentLocation: trip.omnibus.localidad_actual?.nombre,
          },
          availableSeats: trip.asientosDisponibles,
          // Calcular duración del viaje
          duration: calculateTripDuration(trip.fecha_partida, trip.hora_partida, trip.fecha_llegada, trip.hora_llegada),
        }
        return transformed
      })

      setTrips(transformedTrips)
      setHasSearched(true)
    } catch (err) {
      setError(err.message || "Error al cargar los viajes")
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [hasSearched])

  // Función para filtrar viajes (solo filtrado local, sin peticiones)
  const searchTrips = useCallback(
    (searchParams) => {
      const { origin, destination, date, tripType, returnDate, passengers } = searchParams;
      if (!trips.length) {
        return [];
      }
      console.log("Filtros de busuqeda por parametros => ",JSON.stringify(searchParams,null,2))

      const filterLogic = (trip, searchOrigin, searchDestination, searchDate) => {
        if (trip.status !== "ABIERTO") return false;
        if (searchOrigin && trip.origin.toLowerCase().trim() !== searchOrigin.toLowerCase().trim()) return false;
        if (searchDestination && trip.destination.toLowerCase().trim() !== searchDestination.toLowerCase().trim()) return false;

        if (searchDate) {
          const tripDate = convertDateFormat(trip.departureDate);
          if (tripDate !== searchDate) return false;
        }

        if (passengers && trip.availableSeats < Number.parseInt(passengers)) return false;

        return true;
      };

      const filteredTrips = trips.filter((trip) =>
        filterLogic(trip, origin, destination, date)
      );

      let returnTrips = [];

      if (tripType === "roundTrip" && returnDate) {
        returnTrips = trips.filter((trip) =>
          filterLogic(trip, destination, origin, returnDate)
        );
      }

      const allTrips = [...filteredTrips, ...returnTrips];

      

      return allTrips;
    },
    [trips],
  )

  // Funcion para reasignar viaje 
  // id_viaje 
  // id_omnibus para reasignar
  // Función para reasignar viaje
  const reasignTravel = async (id_viaje, id_omnibus) => {
    setLoading(true)
    setError(null)

    try {
      // Validar parámetros antes de enviar
      if (!id_viaje || !id_omnibus) {
        throw new Error("ID de viaje e ID de ómnibus son requeridos")
      }

      const response = await reasignTrip(id_viaje, id_omnibus)
      // Recargar viajes después de reasignar exitosamente
      if (response.success) {
        await loadTrips()
      }

      return {
        success: response.success || false,
        message: response.message || "Reasignación completada",
        errorCode: response.errorCode || null,
        data: response.data || null,
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al reasignar viaje")

      return {
        success: false,
        message: err.response?.data.message || "Error al reasignar viaje",
        errorCode: "REASSIGN_TRIP_FAILED",
        data: null,
      }
    } finally {
      setLoading(false)
    }
  }



  // Listar viajes asociados a un omnibus
  const loadTripsByBus = useCallback(async (id_omnibus) => {
    if (!id_omnibus) {
      throw new Error("ID de ómnibus es requerido")
    }
    try {
      const response = await getTripsByBus(id_omnibus)
     
      // Verificar que la respuesta tenga la estructura esperada
      if (!response || !response.success || !Array.isArray(response.data)) {
        throw new Error("No se pudieron cargar los viajes del ómnibus")
      }
  
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al cargar los viajes del ómnibus")
    }
  }, [])

  

  // Cargar viajes al montar el hook
  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  return {
    trips,
    loading,
    error,
    searchTrips,
    refetch: loadTrips,
    reasignTravel,
    loadTripsByBus,
  }
}

// Función auxiliar para calcular duración del viaje
function calculateTripDuration(departureDate, departureTime, arrivalDate, arrivalTime) {
  try {
    // Convierto fechas al formato YYYY-MM-DD
    const [depDay, depMonth, depYear] = departureDate.split("/")
    const [arrDay, arrMonth, arrYear] = arrivalDate.split("/")
    const formattedDepartureDate = `${depYear}-${depMonth.padStart(2, "0")}-${depDay.padStart(2, "0")}`
    const formattedArrivalDate = `${arrYear}-${arrMonth.padStart(2, "0")}-${arrDay.padStart(2, "0")}`

    // Convierto fechas y horas a objetos Date
    const [depHours, depMinutes] = departureTime.split(":").map(Number)
    const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number)

    const departure = new Date(formattedDepartureDate)
    departure.setHours(depHours, depMinutes)

    const arrival = new Date(formattedArrivalDate)
    arrival.setHours(arrHours, arrMinutes)

    // Calculo la diferencia en milisegundos
    const durationMs = arrival - departure

    if (durationMs <= 0) {
      return "N/A"
    }

    // Convierto la diferencia a días, horas y minutos
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    const days = Math.floor(durationMinutes / (60 * 24))
    const hours = Math.floor((durationMinutes % (60 * 24)) / 60)
    const minutes = durationMinutes % 60

    // Formateo la duración
    const dayPart = days > 0 ? `${days}d ` : ""
    const hourPart = hours > 0 ? `${hours}h ` : ""
    const minutePart = minutes > 0 ? `${minutes}m` : ""

    
    return `${dayPart}${hourPart}${minutePart}`.trim()
  } catch (error) {
    return "N/A"
  }
}

// Función auxiliar para convertir fecha DD/MM/YYYY a YYYY-MM-DD
function convertDateFormat(dateString) {
  try {
    const [day, month, year] = dateString.split("/")
    const converted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    //console.log(`📅 [useTrips] Conversión de fecha: "${dateString}" → "${converted}"`)
    return converted
  } catch (error) {
    return null
  }
}
