import { useState } from "react"
import { ProfileLayout, Button, DataTableCard } from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"
import useTicketHistory from "@/hooks/useTicketHistory"
import useSearchAndFilter from "@/hooks/useSearchAndFilter"

export default function TicketHistoryPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const { user } = useAuthStore()

  // Hook encargado de manejar la carga de pasajes del usuario actual
  const { tickets, loading, error, loadTicketHistory } = useTicketHistory(user.uuidAuth)

  // Validar que tickets sea un array válido
  const validTickets = Array.isArray(tickets) ? tickets : []


  const enrichedTickets = validTickets.map((ticket) => ({
    ...ticket,
    // Campos planos para búsqueda fácil
    id_pasaje_str: ticket.id_pasaje?.toString() || "",
    precio_str: ticket.precio?.toString() || "",
    localidadOrigen_nombre: ticket.viaje?.localidadOrigen?.nombreLocalidad || "",
    localidadDestino_nombre: ticket.viaje?.localidadDestino?.nombreLocalidad || "",
    fecha_partida_str: ticket.viaje?.fecha_partida || "",
    fecha_llegada_str: ticket.viaje?.fecha_llegada || "",
  }))



  
  const searchFields = [
    "id_pasaje_str",
    "precio_str",
    "localidadOrigen_nombre",
    "localidadDestino_nombre",
    "fecha_partida_str",
    "fecha_llegada_str",
  ]

  const searchOptions = {
    caseSensitive: false,
    exactMatch: false,
    searchByWords: true,
  }

  const {
    searchQuery,
    setSearchQuery,
    filteredData: searchedTickets,
    clearSearch,
    hasActiveSearch,
    resultCount,
    originalCount,
  } = useSearchAndFilter(enrichedTickets, searchFields, searchOptions) 

  // Paginación
  const rowsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

 

  const columns = [
    {
      key: "id_pasaje",
      header: "ID Pasaje",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {ticket.id_pasaje || "Sin ID"}
        </span>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          ${ticket.precio || "Sin precio"}
        </span>
      ),
    },
    {
      key: "localidadOrigen",
      header: "Origen",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {ticket.viaje?.localidadOrigen?.nombreLocalidad || "Sin origen"}
        </span>
      ),
    },
    {
      key: "localidadDestino",
      header: "Destino",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {ticket.viaje?.localidadDestino?.nombreLocalidad || "Sin destino"}
        </span>
      ),
    },
    {
      key: "fecha_partida",
      header: "Fecha Partida",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {ticket.viaje?.fecha_partida || "Sin fecha"}
        </span>
      ),
    },
    {
      key: "fecha_llegada",
      header: "Fecha Llegada",
      render: (ticket) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {ticket.viaje?.fecha_llegada || "Sin fecha"}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </ProfileLayout>
    )
  }

  if (error) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-64">
          <div className={`text-center ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadTicketHistory}>Reintentar</Button>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Historial de Pasajes
            </h1>
            <p className={`mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Visualiza el historial de pasajes comprados por el usuario.
            </p>
          </div>
        </div>

        <DataTableCard
          columns={columns}
          data={searchedTickets}
          isDarkMode={isDarkMode}
          currentPage={currentPage}
          totalPages={Math.ceil(searchedTickets.length / rowsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={searchedTickets.length}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          searchPlaceholder="Buscar por ID, origen, destino o fecha..."
          clearSearch={clearSearch}
          hasActiveSearch={hasActiveSearch}
          originalCount={originalCount}
        />
      </div>
    </ProfileLayout>
  )
}
