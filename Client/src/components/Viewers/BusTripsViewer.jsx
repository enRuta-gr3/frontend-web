import { useState, useEffect } from "react"
import { X, Bus, DollarSign, MapPin, Clock, Search, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui"
import { DataTableCard } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import useTrips from "@/hooks/useTrips"
import { useSearchAndFilter } from "@/hooks/useSearchAndFilter"

export default function BusTripsViewer({ bus, onClose, isDarkMode }) {
  const theme = useThemeStore((state) => state.isDarkMode)
  const dark = isDarkMode ?? theme

  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const rowsPerPage = 10

  // Obtener la función del hook useTrips
  const { loadTripsByBus } = useTrips()

  // Configurar campos de búsqueda
  const searchFields = [
    "id_viaje",
    "localidadOrigen.nombreLocalidad",
    "localidadDestino.nombreLocalidad",
    "estado",
    "precio_viaje",
    "fecha_partida",
    "fecha_llegada",
    "hora_partida",
    "hora_llegada",
    // Función personalizada para buscar por ruta completa
    (trip) => `${trip.localidadOrigen?.nombreLocalidad || ""} ${trip.localidadDestino?.nombreLocalidad || ""}`,
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
    filteredData: filteredTrips,
    clearSearch,
    hasActiveSearch,
    resultCount,
    originalCount,
  } = useSearchAndFilter(trips, searchFields, searchOptions)

  // Cargar viajes cuando se abre el modal
  useEffect(() => {
    if (bus?.id_omnibus) {
      loadTrips()
    }
  }, [bus])

  const loadTrips = async () => {
    try {
      setLoading(true)
      setError(null)

     
      const tripsData = await loadTripsByBus(bus.id_omnibus)


      setTrips(tripsData)
    } catch (err) {
      
      setError(err.message || "Error al cargar los viajes del ómnibus")
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar búsqueda
  const clearAllFilters = () => {
    clearSearch()
    setCurrentPage(1)
  }

  const columns = [
    {
      key: "id_viaje",
      header: "ID VIAJE",
      render: (trip) => (
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              dark ? "bg-neutral-700" : "bg-neutral-200"
            }`}
          >
            <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-700"}`}>{trip.id_viaje}</span>
          </div>
        </div>
      ),
    },
    {
      key: "ruta",
      header: "RUTA",
      render: (trip) => (
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <div className="flex items-center">
              <MapPin className={`h-3 w-3 mr-1 ${dark ? "text-green-400" : "text-green-600"}`} />
              <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
                {trip.localidadOrigen?.nombreLocalidad || "N/A"}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <MapPin className={`h-3 w-3 mr-1 ${dark ? "text-red-400" : "text-red-600"}`} />
              <span className={`text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                {trip.localidadDestino?.nombreLocalidad || "N/A"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "fecha_partida",
      header: "PARTIDA",
      render: (trip) => (
        <div className="flex items-center">
          <Clock className={`h-4 w-4 mr-1 ${dark ? "text-blue-400" : "text-blue-600"}`} />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
              {trip.fecha_partida || "N/A"}
            </span>
            <span className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
              {trip.hora_partida || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "fecha_llegada",
      header: "LLEGADA",
      render: (trip) => (
        <div className="flex items-center">
          <Clock className={`h-4 w-4 mr-1 ${dark ? "text-purple-400" : "text-purple-600"}`} />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
              {trip.fecha_llegada || "N/A"}
            </span>
            <span className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
              {trip.hora_llegada || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "precio_viaje",
      header: "PRECIO",
      render: (trip) => (
        <div className="flex items-center">
          <DollarSign className={`h-4 w-4 mr-1 ${dark ? "text-green-400" : "text-green-600"}`} />
          <span className={`font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
            {trip.precio_viaje?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "ESTADO",
      render: (trip) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trip.estado === "ABIERTO"
              ? "bg-green-100 text-green-800"
              : trip.estado === "CERRADO"
                ? "bg-red-100 text-red-800"
                : trip.estado === "CANCELADO"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-yellow-100 text-yellow-800"
              
          }`}
        >
          {trip.estado || "N/A"}
        </span>
      ),
    },
    {
      key: "asientosDisponibles",
      header: "ASIENTOS",
      render: (trip) => (
        <div className="flex items-center">
          <Bus className={`h-4 w-4 mr-1 ${dark ? "text-blue-400" : "text-blue-600"}`} />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
              {trip.asientosDisponibles || 0} disp.
            </span>
            <span className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
              de {trip.omnibus?.capacidad || bus?.capacidad || 0}
            </span>
          </div>
        </div>
      ),
    },
  ]

  // Paginación
  const totalPages = Math.ceil(filteredTrips.length / rowsPerPage)
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Calcular estadísticas
  const stats = {
    total: filteredTrips.length,
    abiertos: filteredTrips.filter((t) => t.estado === "ABIERTO").length,
    cerrados: filteredTrips.filter((t) => t.estado === "CERRADO").length,
    cancelados: filteredTrips.filter((t) => t.estado === "CANCELADO").length,
  }

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
              Viajes del Ómnibus #{bus?.nro_coche}
            </h3>
            <div className={`mt-2 flex flex-wrap gap-4 text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
              <div className="flex items-center">
                <Bus className="h-4 w-4 mr-1" />
                Capacidad: {bus?.capacidad} pasajeros
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    bus?.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {bus?.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              {!loading && !error && (
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${dark ? "text-orange-400" : "text-orange-600"}`}>
                    {filteredTrips.length} de {originalCount} viajes
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

        {/* Barra de búsqueda - Altura fija */}
        {!loading && !error && trips.length > 0 && (
          <div className={`flex-shrink-0 p-4 border-b ${dark ? "border-neutral-800" : "border-neutral-200"}`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${dark ? "text-neutral-400" : "text-neutral-500"}`}
                />
                <input
                  type="text"
                  placeholder="Buscar por ID, origen, destino, estado, precio, fecha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    dark
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
                      : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
                  }`}
                />
                {hasActiveSearch && (
                  <div className={`absolute right-3 top-1/2 transform -translate-y-1/2`}>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${dark ? "bg-orange-900 text-orange-300" : "bg-orange-100 text-orange-700"}`}
                    >
                      {resultCount} resultados
                    </span>
                  </div>
                )}
              </div>

              {/* Botón limpiar */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={!hasActiveSearch}
                  className={`cursor-pointer ${
                    dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
                  }`}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        )}


        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className={`text-lg ${dark ? "text-white" : "text-neutral-600"}`}>Cargando viajes del ómnibus...</p>
                <p className={`text-sm mt-2 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Esto puede tomar unos segundos
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-white" : "text-neutral-900"}`}>
                  <div className="mb-4">
                    <Bus className={`h-16 w-16 mx-auto mb-4 ${dark ? "text-red-400" : "text-red-500"}`} />
                  </div>
                  <p className="text-red-500 mb-6 max-w-md">{error}</p>
                  <Button onClick={loadTrips} className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                  <Bus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No hay viajes registrados</h4>
                  <p className="mb-4">Este ómnibus no tiene viajes asignados actualmente</p>
                  <Button
                    onClick={loadTrips}
                    variant="outline"
                    className={`${dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className={`text-center ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No se encontraron viajes</h4>
                  <p className="mb-4">No hay viajes que coincidan con los criterios de búsqueda</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${dark ? "text-white" : "text-neutral-900"}`}>{stats.total}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
                        Viajes {hasActiveSearch ? "Filtrados" : "Totales"}
                      </p>
                    </div>
                    {/*  viajes abiertos */}
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-green-500`}>{stats.abiertos}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Abiertos</p>
                    </div>
                    {/* viajes cerrados */}
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-red-500`}>{stats.cerrados}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Cerrados</p>
                    </div>
                    {/* viajes cancelads */}
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-yellow-500`}>{stats.cancelados}</p>
                      <p className={`text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>Cancelados</p>
                    </div>
                   
                  </div>
                </div>

                {/* Tabla de viajes */}
                <DataTableCard
                  columns={columns}
                  data={filteredTrips}
                  isDarkMode={dark}
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTrips.length / rowsPerPage)}
                  totalItems={filteredTrips.length}
                  onPageChange={setCurrentPage}
                  searchQuery=""
                  setSearchQuery={() => {}}
                  searchPlaceholder=""
                  statusMessage=""
                  messageType="success"
                  hasAction={false}
                  hasSearch={false}
                  hasFilter={false}
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
            {!loading && !error && trips.length > 0 && (
              <span>
                Mostrando {paginatedTrips.length} de {filteredTrips.length} viajes
                {hasActiveSearch && ` (${originalCount} total)`}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {!loading && !error && trips.length > 0 && (
              <Button
                onClick={loadTrips}
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
