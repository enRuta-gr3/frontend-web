import { useState, useEffect, useCallback } from "react"
import { X, Ticket, MapPin, Calendar, Clock, DollarSign, Search, Users } from "lucide-react"
import { Button } from "@/components/ui"
import { DataTableCard } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import { getTicketsByTrip } from "@/services"
import { useSearchAndFilter } from "@/hooks/useSearchAndFilter"

// listar pasajes por viaje
export default function TicketViewer({ trip, onClose, isDarkMode }) {
  const theme = useThemeStore((state) => state.isDarkMode)
  const dark = isDarkMode ?? theme

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const rowsPerPage = 10

  // Configurar campos de búsqueda
  const searchFields = [
    "id_pasaje",
    "venta_compra.cliente.nombres",
    "venta_compra.cliente.apellidos",
    "venta_compra.cliente.ci",
    "numero_asiento",
    "precio",
    "id_venta",
    // Función personalizada para buscar por nombre completo
    (ticket) => {
      const cliente = ticket.venta_compra?.cliente
      return `${cliente?.nombres || ""} ${cliente?.apellidos || ""}`.trim()
    },
    // Función para buscar por tipo de descuento
    (ticket) => {
      const cliente = ticket.venta_compra?.cliente
      const descuentos = []
      if (cliente?.esEstudiante) descuentos.push("estudiante")
      if (cliente?.esJubilado) descuentos.push("jubilado")
      return descuentos.join(" ")
    },
  ]

  // Opciones de búsqueda
  const searchOptions = {
    caseSensitive: false,
    exactMatch: false,
    searchByWords: true,
  }

  // Hook de búsqueda
  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredTickets,
    clearSearch,
    hasActiveSearch,
    resultCount,
    originalCount,
  } = useSearchAndFilter(tickets, searchFields, searchOptions)

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (trip?.id_viaje) {
      loadTickets()
    }
  }, [trip])

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 [TicketViewer] Cargando pasajes para viaje:", trip.id_viaje)
      const response = await getTicketsByTrip(trip.id_viaje)

      if (response.success && response.data) {
        setTickets(response.data)
      } else {
        const backendMessage = response?.message || response?.data?.message || "Error desconocido"
        setError(backendMessage)
      }
    } catch (err) {
      const messageFromBackend = err?.response?.data?.message || err.message || "Error inesperado"
      setError(messageFromBackend)
    } finally {
      setLoading(false)
    }
  }, [trip])

  // Función para limpiar búsqueda
  const clearAllFilters = () => {
    clearSearch()
    setCurrentPage(1)
  }

  const columns = [
    {
      key: "id_pasaje",
      header: "ID PASAJE",
      render: (ticket) => (
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              dark ? "bg-neutral-700" : "bg-neutral-200"
            }`}
          >
            <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-700"}`}>
              {ticket.id_pasaje}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "CLIENTE",
      render: (ticket) => (
        <div className="flex items-center">
          <Users className={`h-4 w-4 mr-2 ${dark ? "text-neutral-400" : "text-neutral-500"}`} />
          <div>
            <div className={`font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
              {`${ticket.venta_compra?.cliente?.nombres || ""} ${ticket.venta_compra?.cliente?.apellidos || ""}`.trim() ||
                "N/A"}
            </div>
            {ticket.venta_compra?.cliente?.ci && (
              <div className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                CI: {ticket.venta_compra.cliente.ci}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "asiento",
      header: "ASIENTO",
      render: (ticket) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dark ? "bg-orange-900/20 text-orange-300" : "bg-orange-100 text-orange-800"
          }`}
        >
          Asiento {ticket.asiento?.numero_asiento || "N/A"}
        </span>
      ),
    },
    {
      key: "precio",
      header: "PRECIO",
      render: (ticket) => (
        <div className="flex items-center">
          <DollarSign className={`h-4 w-4 mr-1 ${dark ? "text-green-400" : "text-green-600"}`} />
          <span className={`font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
            {ticket.precio?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    {
      key: "descuentos",
      header: "DESCUENTOS",
      render: (ticket) => {
        const cliente = ticket.venta_compra?.cliente
        const descuentos = []

        if (cliente?.esEstudiante) descuentos.push("Estudiante")
        if (cliente?.esJubilado) descuentos.push("Jubilado")

        return descuentos.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {descuentos.map((descuento, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  dark ? "bg-blue-900/20 text-blue-300" : "bg-blue-100 text-blue-800"
                }`}
              >
                {descuento}
              </span>
            ))}
          </div>
        ) : (
          <span className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-500"}`}>Sin descuentos</span>
        )
      },
    },
    {
      key: "venta",
      header: "ID VENTA",
      render: (ticket) => (
        <span className={`font-mono text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
          {ticket.venta_compra?.id_venta || "N/A"}
        </span>
      ),
    },
  ]

  // Paginación
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage)
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Calcular estadísticas
  const stats = {
    total: filteredTickets.length,
    conDescuento: filteredTickets.filter(
      (t) => t.venta_compra?.cliente?.esEstudiante || t.venta_compra?.cliente?.esJubilado,
    ).length,
    sinDescuento: filteredTickets.filter(
      (t) => !t.venta_compra?.cliente?.esEstudiante && !t.venta_compra?.cliente?.esJubilado,
    ).length,
    ingresos: filteredTickets.reduce((sum, t) => sum + (Number(t.precio) || 0), 0),
    estudiantes: filteredTickets.filter((t) => t.venta_compra?.cliente?.esEstudiante).length,
    jubilados: filteredTickets.filter((t) => t.venta_compra?.cliente?.esJubilado).length,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`relative w-full max-w-7xl h-[95vh] rounded-lg shadow-lg overflow-hidden flex flex-col ${
          dark ? "bg-neutral-900" : "bg-white"
        }`}
      >
        {/* Header - Altura fija */}
        <div
          className={`flex-shrink-0 flex justify-between items-center p-6 border-b ${
            dark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <div>
            <h3 className={`text-xl font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>
              Pasajes del Viaje #{trip?.id_viaje}
            </h3>
            <div className={`mt-2 flex flex-wrap gap-4 text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {trip?.localidadOrigen?.nombreLocalidad} → {trip?.localidadDestino?.nombreLocalidad}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {trip?.fecha_partida}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {trip?.hora_partida}
              </div>
              {!loading && !error && (
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${dark ? "text-orange-400" : "text-orange-600"}`}>
                    {filteredTickets.length} de {originalCount} pasajes
                    {hasActiveSearch ? " (filtrados)" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full cursor-pointer transition-colors ${
              dark ? "hover:bg-neutral-800" : "hover:bg-neutral-100"
            }`}
          >
            <X className={`h-5 w-5 ${dark ? "text-neutral-400" : "text-neutral-500"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className={`text-lg ${dark ? "text-white" : "text-neutral-600"}`}>Cargando pasajes del viaje...</p>
                <p className={`text-sm mt-2 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Esto puede tomar unos segundos
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-white" : "text-neutral-900"}`}>
                  <div className="mb-4">
                    <Ticket className={`h-16 w-16 mx-auto mb-4 ${dark ? "text-red-400" : "text-red-500"}`} />
                  </div>

                  <p className="text-red-500 mb-6 max-w-md">{error}</p>
                  <Button onClick={loadTickets} className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                  <Ticket className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No hay pasajes registrados</h4>
                  <p className="mb-4">Este viaje no tiene pasajes vendidos actualmente</p>
                  <Button
                    onClick={loadTickets}
                    variant="outline"
                    className={`${dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No se encontraron pasajes</h4>
                  <p className="mb-4">No hay pasajes que coincidan con los criterios de búsqueda</p>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className={`${dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Estadísticas rápidas */}
                <div className={`mb-6 p-4 rounded-lg ${dark ? "bg-neutral-800" : "bg-neutral-50"}`}>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${dark ? "text-white" : "text-neutral-900"}`}>{stats.total}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
                        Pasajes {hasActiveSearch ? "Filtrados" : "Totales"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-blue-500`}>{stats.estudiantes}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Estudiantes</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-purple-500`}>{stats.jubilados}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Jubilados</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-green-500`}>{stats.conDescuento}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Con Descuento</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-gray-500`}>{stats.sinDescuento}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Sin Descuento</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-orange-500`}>${stats.ingresos.toLocaleString()}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
                        Ingresos {hasActiveSearch ? "Filtrados" : "Totales"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabla de pasajes con DataTableCard */}
                <DataTableCard
                  columns={columns}
                  data={filteredTickets}
                  isDarkMode={dark}
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTickets.length / rowsPerPage)}
                  totalItems={filteredTickets.length}
                  onPageChange={setCurrentPage}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchPlaceholder="Buscar por id pasaje, cliente, CI o precio "
                  clearSearch={clearSearch}
                  hasActiveSearch={hasActiveSearch}
                  originalCount={originalCount}
                  hasSearch={true}
                  hasFilter={false}
                  hasAction={false}
                  
                />
              </>
            )}
          </div>
        </div>

        {/* Footer - Altura fija */}
        <div
          className={`flex-shrink-0 flex justify-between items-center p-4 border-t ${
            dark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <div className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
            {!loading && !error && tickets.length > 0 && (
              <span>
                Mostrando {paginatedTickets.length} de {filteredTickets.length} pasajes
                {hasActiveSearch && ` (${originalCount} total)`}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {!loading && !error && tickets.length > 0 && (
              <Button
                onClick={loadTickets}
                variant="outline"
                className={`cursor-pointer ${
                  dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
                }`}
              >
                Actualizar
              </Button>
            )}
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
