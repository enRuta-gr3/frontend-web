import { useState, useCallback } from "react"
import { listSeats, changeSeatsState } from "@/services"
import useAuthStore from "@/store/useAuthStore"

export default function useSeats() {
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useAuthStore()

  const fetchSeats = useCallback(async (tripId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await listSeats(tripId)
      const data = response.data || []

      

      setSeats(data)
      return data
    } catch (err) {
      
      const errorMessage = err.response?.data.message || "Error al cargar los asientos"
      setError(errorMessage)
      throw new Error(err.response?.data.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSeatsStateHandler = useCallback(
    async (tripId, selectedSeats, userUuid, passengers) => {
      try {
        
  
        // Usar el userUuid pasado como parámetro o el del store como fallback
        const finalUuid = userUuid || user?.uuidAuth;
  
        if (!finalUuid || typeof finalUuid !== "string") {
          throw new Error("UUID de usuario inválido o no proporcionado");
        }
  
        // Convertir selectedSeats a la estructura que espera el backend,
        // enviando los datos exactamente en el mismo formato recibido al listar los asientos.
        const seatsToSend = selectedSeats.map((selectedSeat) => {
          const fullSeatData = seats.find((seat) => seat.id_disAsiento === selectedSeat.id);
          if (!fullSeatData) {
            return null;
          }
          return {
            id_disAsiento: fullSeatData.id_disAsiento,
            asiento: fullSeatData.asiento,
            viaje: {
              id_viaje: tripId,
              cantidad: passengers, 
            },
            idBloqueo: String(finalUuid),
          };
        }).filter(Boolean);
  
        
  
        const response = await changeSeatsState(seatsToSend);
  
      
  
        // Actualizar estado local
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id_disAsiento)
              ? { ...seat, estado: "BLOQUEADO", idBloqueo: finalUuid }
              : seat,
          ),
        );
  
        return response;
      } catch (err) {
        const errorMessage = err.response?.data.message || "Error al actualizar el estado de los asientos" 
        setError(errorMessage);
        throw err
      }
    },
    [user, seats], // Agregar seats a las dependencias
  );

  const generateBusLayout = useCallback((seatsData, busCapacity = 40) => {
    

    if (!seatsData || seatsData.length === 0) {
      return generateDefaultLayout(busCapacity)
    }

    const validSeats = seatsData.filter((seat) => seat.asiento.numero_asiento <= busCapacity)

    const mappedSeats = validSeats.map((seatData) => ({
      id: seatData.id_disAsiento, // Usar id_disAsiento como ID
      number: seatData.asiento.numero_asiento,
      status: seatData.estado === "LIBRE" ? "available" : "occupied", // LIBRE = available, resto = occupied
      idBloqueo: seatData.idBloqueo || null,
      rawData: seatData,
    }))

    const seatsPerRow = 4
    const rows = []

    for (let i = 0; i < mappedSeats.length; i += seatsPerRow) {
      const row = mappedSeats.slice(i, i + seatsPerRow)

      while (row.length < seatsPerRow) {
        row.push({
          id: `empty-${i + row.length}`,
          number: "",
          status: "empty",
        })
      }

      rows.push(row)
    }

    return rows
  }, [])

  const generateDefaultLayout = useCallback((totalSeats = 40) => {
    const seatsPerRow = 4
    const rows = []

    for (let row = 0; row < Math.ceil(totalSeats / seatsPerRow); row++) {
      const rowSeats = []
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat + 1

        if (seatNumber <= totalSeats) {
          rowSeats.push({
            id: seatNumber,
            number: seatNumber,
            status: "available",
          })
        } else {
          rowSeats.push({
            id: `empty-${seatNumber}`,
            number: "",
            status: "empty",
          })
        }
      }
      rows.push(rowSeats)
    }

    return rows
  }, [])

  return {
    seats,
    loading,
    error,
    fetchSeats,
    updateSeatsState: updateSeatsStateHandler,
    generateBusLayout,
  }
}
