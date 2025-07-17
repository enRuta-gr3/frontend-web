import { useState, useEffect } from "react"
import { SellerLayout, Button, NewBusForm, BulkUploadForm1, ChangeStatusForm } from "@/components"
import { DataTableCard } from "@/components/ui"
import { BusTripsViewer } from "@/components/Viewers"
import useThemeStore from "@/store/useThemeStore"
import useBuses from "@/hooks/useBuses"
import useLocalities from "@/hooks/useLocalities"
import useAuthStore from "@/store/useAuthStore"
import ShowConfirm from "@/components/Forms/ShowConfirm"
import { Plus, Upload, RefreshCcw, Eye } from "lucide-react"

export default function SellerBusPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  // Hooks
  const { buses, loading, error, loadBuses, handleCreateBus, bulkUploadAndRegisterBuses, handleChangeStatusBus } =
    useBuses()
  const { localities, loading: loadingLocalities, error: errorLocalities, loadLocalities } = useLocalities()
  const [statusMessage, setStatusMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [showNewBusModal, setShowNewBusModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [selectedBus, setSelectedBus] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showConfirmReactivate, setShowConfirmReactivate] = useState(false)
  const [showTripsViewer, setShowTripsViewer] = useState(false)
  const [busToReactivate, setBusToReactivate] = useState(null)
  const usuario = useAuthStore((state) => state.user)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage] = useState(10)




  //
  useEffect(() => {
    loadBuses(true)
    loadLocalities()
  }, [])

  const showMessage = (message, type = "success") => {
    setStatusMessage(message)
    setMessageType(type)
    const duration = type === "error" ? 10000 : 3500
    setTimeout(() => {
      setStatusMessage("")
      setMessageType("success")
    }, duration)
  }

  // 🔧 Función para enriquecer datos de buses con información de localidad y departamento
  const enrichBusData = (busData) => {
    if (!Array.isArray(busData) || !Array.isArray(localities)) return []
    return busData.map((bus) => {
      const localidad = localities.find((l) => l.id_localidad === bus.id_localidad_actual)
      return {
        ...bus,
        localidad_nombre: localidad?.nombreLocalidad || "Desconocida",
        departamento_nombre: localidad?.departamento?.nombreDepartamento || "Desconocido",
        estado_texto: bus.activo ? "Activo" : "Inactivo",
      }
    })
  }

  // 🔍 Datos enriquecidos para DataTableCard
  const enrichedBuses = enrichBusData(buses)
  

  // 🎯 CONFIGURACIÓN DE FILTROS DINÁMICOS PARA BUSES
  const filterConfig = [
    {
      key: "estado_texto",
      label: "Estado",
      type: "select",
      placeholder: "Todos los estados",
      options: [
        { value: "Activo", label: "Activo" },
        { value: "Inactivo", label: "Inactivo" },
      ],
    },
    {
      key: "capacidad",
      label: "Capacidad",
      type: "range",
      rangeType: "number",
    },
    {
      key: "departamento_nombre",
      label: "Departamento",
      type: "select",
      placeholder:"Todos los departamentos",
      options: [...new Set(enrichedBuses.map((bus) => bus.departamento_nombre))]
        .filter(Boolean)
        .sort()
        .map((dept) => ({
          value: dept,
          label: dept,
        })),
    },
    {
      key: "localidad_nombre",
      label: "Localidad",
      type: "select",
      placeholder: "Todas las localidades",
      options: [...new Set(enrichedBuses.map((bus) => bus.localidad_nombre))]
        .filter(Boolean)
        .sort()
        .map((loc) => ({
          value: loc,
          label: loc,
        })),
    },
  ]

  const columns = [
    {
      key: "nro_coche",
      header: "Número de coche",
      render: (bus) => <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{bus.nro_coche}</span>,
    },
    {
      key: "capacidad",
      header: "Capacidad",
      render: (bus) => (
        <span className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-900"}`}>
          {bus.capacidad} pasajeros
        </span>
      ),
    },
    {
      key: "activo",
      header: "Estado",
      render: (bus) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            bus.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {bus.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "localidad_nombre",
      header: "Localidad",
      render: (bus) => <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{bus.localidad_nombre}</span>,
    },
    {
      key: "departamento_nombre",
      header: "Departamento",
      render: (bus) => (
        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{bus.departamento_nombre}</span>
      ),
    },
  ]

  const actions = (bus) => (
    <div className="flex items-center space-x-2">
      {/* Ver Viajes */}
      <Button
        variant="ghost"
        size="icon"
        title="Ver viajes"
        onClick={() => handleViewTrips(bus)}
        className={`cursor-pointer ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {/* Activar/Inactivar */}
      <Button
        variant="ghost"
        size="icon"
        title="Cambiar estado"
        onClick={() => handleEstadoClick(bus)}
        className={`cursor-pointer ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  )

  const handleBusCreated = async (busData) => {
    try {
      console.log("🔄 [SellerBusPage] Creando bus:", busData)
      const response = await handleCreateBus(busData)  // recarga  los buses
      if (response?.data?.id_omnibus) {
        setShowNewBusModal(false)
        showMessage("Ómnibus creado exitosamente", "success")
        return true
      } else {
        showMessage(`Error al crear el ómnibus: ${response?.message || "Error desconocido"}`, "error")
        return false
      }
    } catch (err) {
      let errorMessage = "Error al crear nuevo ómnibus"
    
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.message) {
          errorMessage = err.message
        }
      showMessage(errorMessage,'error')
      return false
    }
  }

  const handleEstadoClick = async (bus) => {
    if (!bus.activo) {
      // Mostrar modal de confirmación para volver a activar
      setBusToReactivate(bus)
      setShowConfirmReactivate(true)
    } else {
      // Mostrar modal para inactivarlo con fechas
      setSelectedBus(bus)
      setShowScheduleModal(true)
    }
  }

  const handleViewTrips = (bus) => {
    console.log("🚌 [SellerBusPage] Mostrando viajes para bus:", bus)
    setSelectedBus(bus)
    setShowTripsViewer(true)
  }

  // Manejo de carga masiva
  const handleBulkUpload = async (file) => {
    try {
      if (!file) {
        showMessage("Por favor selecciona un archivo", "error")
        return false
      }

      const { name } = file
      if ( name !== "omnibus.csv"){
        showMessage("El nombre del archivo debe ser 'omnibus.csv' ", "error")
        setShowBulkUploadModal(false)
        return false
      }

  
      const response = await bulkUploadAndRegisterBuses(file)
      console.log("📋 [SellerBusPage] Respuesta completa:", JSON.stringify(response, null, 2))
      if (response?.success) {
        await loadBuses() // recargamos
        console.log("✅ [SellerBusPage] Carga exitosa")
        showMessage(response.message || "Carga masiva de ómnibus completada con éxito", "success")
        setShowBulkUploadModal(false)
        return true
      } else {
        showMessage(response?.error || "Error al procesar la carga masiva de ómnibus", "error")
        setShowBulkUploadModal(false)
        return false
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido en carga masiva"
      showMessage(`Error: ${errorMessage}`, "error")
      setShowBulkUploadModal(false)
      return false
    }
  }

  // Mostrar loading si está cargando buses o localidades
  if (loading || loadingLocalities) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </SellerLayout>
    )
  }



  return (
    <SellerLayout>
      <div>
        {/* Título y botones */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Gestión de Ómnibus
            </h1>
            <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} mt-1`}>
              Administra la flota de ómnibus en el sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowNewBusModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Alta Ómnibus
            </Button>
            <Button
              variant="outline"
              className={`cursor-pointer ${
                isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
              }`}
              onClick={() => setShowBulkUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Carga Masiva
            </Button>
          </div>
        </div>

        {/* 🎯 DataTableCard maneja TODA la lógica de búsqueda, filtros y paginación */}
        <DataTableCard
          columns={columns}
          data={enrichedBuses} // ✅ TODOS LOS DATOS ENRIQUECIDOS
          actions={actions}
          isDarkMode={isDarkMode}
          currentPage={currentPage}
          totalPages={Math.ceil(enrichedBuses.length / rowsPerPage)}
          totalItems={enrichedBuses.length}
          onPageChange={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Buscar por coche, localidad o departamento..."
          statusMessage={statusMessage}
          messageType={messageType}
          hasAction={true}
          hasSearch={true}
          hasFilter={false}
          sectionFilter={true}
          filterConfig={filterConfig}
          rowsPerPage={rowsPerPage}
        />

        {/* Modal alta */}
        {showNewBusModal && (
          <NewBusForm
            onRegister={handleBusCreated}
            onCancel={() => setShowNewBusModal(false)}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal carga masiva */}
        {showBulkUploadModal && (
          <BulkUploadForm1
            title="Carga Masiva de Ómnibus"
            description="Sube un archivo CSV con los ómnibus a registrar"
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUploadModal(false)}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal cambio de estado (inactivación programada) */}
        {showScheduleModal && selectedBus && (
          <ChangeStatusForm
            selectedBus={selectedBus}
            isDarkMode={isDarkMode}
            onCancel={() => {
              setShowScheduleModal(false)
              setSelectedBus(null)
            }}
            onConfirm={async (formData) => {
              try {
                const response = await handleChangeStatusBus(formData)
                if (response?.success) {
                  await loadBuses(true)
                  showMessage("Ómnibus inactivado correctamente", "success")
                } else {
                  showMessage(response?.message || "Error al cambiar estado", "error")
                }
              } catch (err) {
                console.error("❌ Error al cambiar estado:", err)
                const errorMessage = err.response?.data?.message || "Error al cambiar el estado del ómnibus"
                showMessage(errorMessage, "error")
              } finally {
                setShowScheduleModal(false)
                setSelectedBus(null)
              }
            }}
          />
        )}

        {showConfirmReactivate && busToReactivate && (
          <ShowConfirm
            open={true}
            title="¿Desea reactivar este ómnibus?"
            data={[{ label: "Número de coche", value: busToReactivate.nro_coche }]}
            isDarkMode={isDarkMode}
            onCancel={() => {
              setShowConfirmReactivate(false)
              setBusToReactivate(null)
            }}
            onAccept={async () => {
              try {
                const response = await handleChangeStatusBus({
                  activo: true,
                  id_omnibus: busToReactivate.id_omnibus,
                  vendedor: usuario.uuidAuth,
                })
                if (response?.success) {
                  await loadBuses(true)
                  
                  showMessage("Ómnibus reactivado correctamente", "success")
                } else {
                  showMessage(response?.message || "Error al reactivar el ómnibus", "error")
                }
              } catch (err) {
                console.error("❌ Error al reactivar ómnibus:", err)
                const errorMessage = err.response?.data?.message || "Error al reactivar el ómnibus"
                showMessage(errorMessage, "error")
              } finally {
                setShowConfirmReactivate(false)
                setBusToReactivate(null)
              }
            }}
          />
        )}

        {/* Visor de viajes del bus */}
        {showTripsViewer && selectedBus && (
          <BusTripsViewer
            bus={selectedBus}
            onClose={() => {
              setShowTripsViewer(false)
              setSelectedBus(null)
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </SellerLayout>
  )
}
