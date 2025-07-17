import { useState } from "react"
import { SellerLayout, Button, NewTripForm, DataTableCard, ReasignTravelForm, LoadingOverlay } from "@/components"
import { TicketViewer } from "@/components/Viewers"
import useThemeStore from "@/store/useThemeStore"
import useViajes from "@/hooks/useViajes"
import useTrips from "@/hooks/useTrips"
import useLocalities from "@/hooks/useLocalities"
import useBuses from "@/hooks/useBuses"
import { Plus, Ticket, Usb } from "lucide-react"
import useSearchAndFilter from "@/hooks/useSearchAndFilter"

export default function SellerTravelPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [showNewTripModal, setShowNewTripModal] = useState(false)
  const [messageType, setMessageType] = useState("success")
  const [statusMessage, setStatusMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [showTicketViewer, setShowTicketViewer] = useState(false)
  const [selectedTripForTickets, setSelectedTripForTickets] = useState(null)

  const [isReasigning, setIsReasigning] = useState(false)
  const [selectedTripForReasign, setSelectedTripForReasign] = useState(null)
  const [showReasignModal, setShowReasignModal] = useState(false)

  const { viajes, loading, error, handleCreateViaje, loadViajes } = useViajes()
  const { reasignTravel } = useTrips()
  const { localities } = useLocalities()
  const { buses } = useBuses()

  const enrichedTrips = (Array.isArray(viajes) ? viajes : []).map((trip) => {
    console.log(`📅 Formato de fecha original:`, {
      id: trip.id_viaje,
      fecha_partida: trip.fecha_partida,
      tipo: typeof trip.fecha_partida,
    })

    return {
      ...trip,
      localidadOrigen_nombre: trip.localidadOrigen?.nombreLocalidad || "Sin origen",
      localidadDestino_nombre: trip.localidadDestino?.nombreLocalidad || "Sin destino",
      omnibus_numero: String(trip.omnibus?.nro_coche || "Sin asignar"),
    }
  })

  if (enrichedTrips.length > 0) {
    console.log("🔍 EJEMPLOS DE FECHAS EN LOS DATOS:")
    enrichedTrips.slice(0, 3).forEach((trip, index) => {
      console.log(`Viaje ${index + 1}:`, {
        id: trip.id_viaje,
        fecha_partida: trip.fecha_partida,
        tipo: typeof trip.fecha_partida,
        constructor: trip.fecha_partida?.constructor?.name,
      })
    })
  }

  const {
    searchQuery: advancedSearchQuery,
    setSearchQuery: setAdvancedSearchQuery,
    filteredData: searchFilteredTrips,
    searchFields,
    setSearchFields,
    clearSearch,
  } = useSearchAndFilter(enrichedTrips, [
    "localidadOrigen_nombre",
    "localidadDestino_nombre",
    "fecha_partida",
    "hora_partida",
    "estado",
    "omnibus_numero",
    "precio_viaje",
  ])

  const filterConfig = [
    {
      key: "localidadOrigen_nombre",
      label: "Origen",
      type: "select",
      placeholder: "Todos los origenes",
      options: Array.from(
        new Map(
          enrichedTrips
            .filter((trip) => trip.localidadOrigen_nombre && trip.localidadOrigen_nombre !== "Sin origen")
            .map((trip) => [
              trip.localidadOrigen_nombre,
              {
                localidad: trip.localidadOrigen_nombre,
                departamento: trip.localidadOrigen?.departamento?.nombreDepartamento || "",
              },
            ]),
        ).values(),
      )
        .sort((a, b) => a.localidad.localeCompare(b.localidad))
        .map((item) => ({
          value: item.localidad,
          label: item.departamento ? `${item.localidad} (${item.departamento})` : item.localidad,
        })),
    },
    {
      key: "localidadDestino_nombre",
      label: "Destino",
      type: "select",
      placeholder: "Todos los destinos",
      options: Array.from(
        new Map(
          enrichedTrips
            .filter((trip) => trip.localidadDestino_nombre && trip.localidadDestino_nombre !== "Sin destino")
            .map((trip) => [
              trip.localidadDestino_nombre,
              {
                localidad: trip.localidadDestino_nombre,
                departamento: trip.localidadDestino?.departamento?.nombreDepartamento || "",
              },
            ]),
        ).values(),
      )
        .sort((a, b) => a.localidad.localeCompare(b.localidad))
        .map((item) => ({
          value: item.localidad,
          label: item.departamento ? `${item.localidad} (${item.departamento})` : item.localidad,
        })),
    },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      placeholder: "Todos los estados",
      options: [
        { value: "ABIERTO", label: "Abierto" },
        { value: "CANCELADO", label: "Cancelado" },
        { value: "CERRADO", label: "Cerrado" },
      ],
    },
    {
      key: "precio_viaje",
      label: "Precio",
      type: "range",
      rangeType: "number",
    },
    {
      key: "omnibus_numero",
      label: "Coche",
      type: "select",
      placeholder: "Seleccione coche",
      options: [...new Set(enrichedTrips.map((trip) => trip.omnibus_numero))]
        .filter((coche) => coche !== "Sin asignar")
        .sort((a, b) => {
          const numA = Number.parseInt(a, 10)
          const numB = Number.parseInt(b, 10)
          return numA - numB
        })
        .map((coche) => ({
          value: coche,
          label: `Coche ${coche}`,
        })),
    },
    {
      key: "hora_partida",
      label: "Hora de partida",
      type: "time",
    },
  ]

  const showMessage = (message, type = "success") => {
    setStatusMessage(message)
    setMessageType(type)
    setTimeout(() => setStatusMessage(""), 5000)
  }

  const handleReasignSubmit = async (newBusId) => {
    setShowReasignModal(false)
    setIsReasigning(true)
    try {
      const response = await reasignTravel(selectedTripForReasign.id_viaje, newBusId)
      if (response.success) {
        showMessage("Viaje reasignado exitosamente.", "success")
        await loadViajes()
      } else {
        showMessage(response.message || "Error al reasignar el viaje.", "error")
      }
    } catch (err) {
      console.error("❌ Error en la reasignación:", err)
      const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error inesperado."
      showMessage(errorMessage, "error")
    } finally {
      setIsReasigning(false)
      setSelectedTripForReasign(null)
    }
  }

  const openReasignModal = (trip) => {
    setSelectedTripForReasign(trip)
    setShowReasignModal(true)
  }

  const cancelReasign = () => {
    setShowReasignModal(false)
    setSelectedTripForReasign(null)
  }

  const handleTripCreated = async (viajeData) => {
    try {
      const response = await handleCreateViaje(viajeData)
      if (response?.data?.id_viaje) {
        setShowNewTripModal(false)
        showMessage("El viaje ha sido creado exitosamente.")
      } else {
        showMessage("No se pudo crear el viaje.", "error")
      }
    } catch (err) {
      const errorMessage = err.response?.data.message || "Error al crear el viaje."
      showMessage(errorMessage, "error")
    }
  }

  const columns = [
    {
      key: "localidadOrigen",
      header: "Origen",
      render: (trip) => (
        <div className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
          <div className="font-medium">{trip.localidadOrigen?.nombreLocalidad || "-"}</div>
          <div className="text-xs text-neutral-500">{trip.localidadOrigen?.departamento?.nombreDepartamento || ""}</div>
        </div>
      ),
    },
    {
      key: "localidadDestino",
      header: "Destino",
      render: (trip) => (
        <div className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
          <div className="font-medium">{trip.localidadDestino?.nombreLocalidad || "-"}</div>
          <div className="text-xs text-neutral-500">
            {trip.localidadDestino?.departamento?.nombreDepartamento || ""}
          </div>
        </div>
      ),
    },
    {
      key: "fecha_partida",
      header: "Fecha Partida",
      render: (trip) => (
        <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>{trip.fecha_partida}</span>
      ),
    },
    {
      key: "hora_partida",
      header: "Hora Partida",
      render: (trip) => (
        <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>{trip.hora_partida}</span>
      ),
    },
    {
      key: "precio_viaje",
      header: "Precio",
      render: (trip) => (
        <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>${trip.precio_viaje}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (trip) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trip.estado === "ABIERTO"
              ? isDarkMode
                ? "bg-green-500/20 text-green-400"
                : "bg-green-100 text-green-800"
              : trip.estado === "CANCELADO"
                ? isDarkMode
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-orange-100 text-orange-800"
                : isDarkMode
                  ? "bg-red-500/20 text-red-400"
                  : "bg-red-100 text-red-800"
          }`}
        >
          {trip.estado}
        </span>
      ),
    },
    {
      key: "omnibus",
      header: "Coche",
      render: (trip) => (
        <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
          {trip.omnibus?.nro_coche || "-"}
        </span>
      ),
    },
  ]

  const actions = (trip) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className={`cursor-pointer ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
        }`}
        onClick={() => {
          setSelectedTripForTickets(trip)
          setShowTicketViewer(true)
        }}
        title="Ver pasajes"
      >
        <Ticket className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`cursor-pointer ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
        }`}
        onClick={() => openReasignModal(trip)}
        title="Reasignar viaje"
      >
        <Usb className="h-4 w-4" />
      </Button>
    </div>
  )

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </SellerLayout>
    )
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="text-center p-8">
          <p className="text-red-500">{error}</p>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <LoadingOverlay isActive={isReasigning} text="Reasignando viaje..." isDarkMode={isDarkMode} />

      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Gestión de Viajes
            </h1>
            <p className={`mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Administra los viajes registrados en el sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowNewTripModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Alta Viaje
            </Button>
          </div>
        </div>

        {advancedSearchQuery && (
          <div
            className={`mb-4 p-3 rounded-lg border flex items-center justify-between ${
              isDarkMode ? "bg-blue-900/20 border-blue-800 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                🔍 Búsqueda activa: "{advancedSearchQuery}" ({searchFilteredTrips.length} de {enrichedTrips.length}{" "}
                viajes)
              </span>
            </div>
            <button
              onClick={clearSearch}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isDarkMode
                  ? "text-blue-300 hover:text-blue-200 hover:bg-blue-800/30"
                  : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
              }`}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        <DataTableCard
          columns={columns}
          data={searchFilteredTrips}
          actions={actions}
          isDarkMode={isDarkMode}
          currentPage={currentPage}
          totalItems={searchFilteredTrips.length}
          totalPages={Math.ceil(searchFilteredTrips.length / rowsPerPage)}
          onPageChange={setCurrentPage}
          searchQuery={advancedSearchQuery}
          setSearchQuery={setAdvancedSearchQuery}
          searchPlaceholder="Búsqueda avanzada: Origen, Destino, fecha, hora, precio, estado, coche..."
          statusMessage={statusMessage}
          messageType={messageType}
          hasAction={true}
          hasSearch={true}
          hasFilter={false}
          sectionFilter={true}
          filterConfig={filterConfig}
          rowsPerPage={rowsPerPage}
        />

        {showNewTripModal && (
          <NewTripForm
            localidades={localities}
            omnibus={buses}
            isDarkMode={isDarkMode}
            onCancel={() => setShowNewTripModal(false)}
            onTripCreated={handleTripCreated}
          />
        )}

        {showTicketViewer && selectedTripForTickets && (
          <TicketViewer
            trip={selectedTripForTickets}
            onClose={() => {
              setShowTicketViewer(false)
              setSelectedTripForTickets(null)
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {showReasignModal && selectedTripForReasign && (
          <ReasignTravelForm
            onReasignSubmit={handleReasignSubmit}
            onCancel={cancelReasign}
            id_viaje={selectedTripForReasign.id_viaje}
            isDarkMode={isDarkMode}
            currentBusInfo={selectedTripForReasign.omnibus}
            tripInfo={selectedTripForReasign}
          />
        )}
      </div>
    </SellerLayout>
  )
}
