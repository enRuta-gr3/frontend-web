import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Store para manejar viajes pendientes cuando el usuario no está autenticado
 */
const usePendingTripStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      pendingTrip: null,
      pendingTripData: null,
      hasPendingTrip: false,

      // Función para guardar un viaje pendiente
      setPendingTrip: (trip, travelData = {}) => {
        console.log("🎫 [PendingTripStore] Guardando viaje pendiente:", trip)
        console.log("📋 [PendingTripStore] Datos del viaje:", travelData)

        set({
          pendingTrip: trip,
          pendingTripData: {
            ...travelData,
            searchParams: travelData.searchParams || window.location.search,
            timestamp: Date.now(),
          },
          hasPendingTrip: true,
        })
      },

      // Función para obtener y limpiar el viaje pendiente
      resolvePendingTrip: () => {
        const { pendingTrip, pendingTripData } = get()

        console.log("🔄 [PendingTripStore] Consumiendo viaje pendiente:", pendingTrip)

        // Limpia el store
        set({
          pendingTrip: null,
          pendingTripData: null,
          hasPendingTrip: false,
        })

        return { trip: pendingTrip, data: pendingTripData }
      },

      // Función para limpiar el viaje pendiente sin consumirlo
      clearPendingTrip: () => {
        console.log("🗑️ [PendingTripStore] Limpiando viaje pendiente")
        set({
          pendingTrip: null,
          pendingTripData: null,
          hasPendingTrip: false, // si tiene pendiente viaje en false por defectp
        })
      },

      // Función para verificar si el viaje pendiente es válido (no muy antiguo)
      isPendingTripValid: () => {
        const { pendingTripData } = get()
        if (!pendingTripData?.timestamp) return false

        // Considerar válido si tiene menos de 30 minutos
        const thirtyMinutes = 30 * 60 * 1000    // ajustar el tiempo de valides
        return Date.now() - pendingTripData.timestamp < thirtyMinutes
      },
    }),
    {
      name: "pending-trip-storage",
      partialize: (state) => ({
        pendingTrip: state.pendingTrip,
        pendingTripData: {
          ...state.pendingTripData,
          searchParams: state.pendingTripData?.searchParams,
        },
        hasPendingTrip: state.hasPendingTrip,
      }),
    },
  ),
)

export default usePendingTripStore




