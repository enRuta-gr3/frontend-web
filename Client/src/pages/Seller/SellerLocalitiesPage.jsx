import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import { SellerLayout, Button, NewLocationForm, BulkUploadForm1 } from "@/components"
import { DataTableCard } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import useLocalities from "@/hooks/useLocalities"


export default function SellerLocalitiesPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [showNewLocationModal, setShowNewLocationModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [messageType, setMessageType] = useState("success")
  const [rowsPerPage] = useState(10)

  const { localities, loading, error, loadLocalities, handleCreateLocality, bulkUploadAndRegisterLocalities } =
    useLocalities()





  // 🔧 Función para enriquecer datos de localidades con campos planos para filtros
  const enrichLocalityData = (localityData) => {
    if (!Array.isArray(localityData)) return []

    return localityData.map((locality) => ({
      ...locality,
      departamento_nombre: locality.departamento?.nombreDepartamento || "Sin departamento",
    }))
  }

  // Función para mostrar mensajes con tipo y duración específica
  const showMessage = (message, type = "success") => {
    setStatusMessage(message)
    setMessageType(type)

    const duration = type === "error" ? 10000 : 3500
    setTimeout(() => {
      setStatusMessage("")
      setMessageType("success")
    }, duration)
  }

  // 🔧 Procesamiento de datos - solo enriquecimiento
  const enrichedLocalities = enrichLocalityData(localities)

  console.log("📋 [SellerLocalitiesPage] Datos procesados:", {
    original: localities?.length || 0,
    enriched: enrichedLocalities.length,
    currentPage,
  })

  // 🔧 Columnas para DataTable
  const columns = [
    {
      key: "nombreLocalidad",
      header: "Localidad",
      render: (loc) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {loc.nombreLocalidad || "Sin nombre"}
        </span>
      ),
    },
    {
      key: "departamento_nombre",
      header: "Departamento",
      render: (loc) => (
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
          {loc.departamento_nombre}
        </span>
      ),
    },
  ]

  // 🎯 CONFIGURACIÓN DE FILTROS DINÁMICOS
  const filterConfig = [
    {
      key: "departamento_nombre",
      label: "Departamento",
      type: "select",
      placeholder:"Todos los departamentos",
      options: [...new Set(enrichedLocalities.map((loc) => loc.departamento_nombre))]
        .filter(Boolean)
        .sort()
        .map((dept) => ({
          value: dept,
          label: dept,
        })),
    },
    {
      key: "nombreLocalidad",
      label: "Localidad",
      type: "select",
      placeholder: "Todas las localidades",
      options: [...new Set(enrichedLocalities.map((loc) => loc.nombreLocalidad))]
        .filter(Boolean)
        .sort()
        .map((localidad) => ({
          value: localidad,
          label: localidad,
        })),
    },
  ]

  const handleLocationCreated = async (formValues) => {
    try {
      

      const response = await handleCreateLocality(formValues)
 

      if (response?.id_localidad || response?.data?.id_localidad) {
        setShowNewLocationModal(false)
        showMessage(`La localidad "${formValues.nombreLocalidad}" ha sido creada exitosamente.`, "success")
        await loadLocalities()
        return true
      } else {
        showMessage(`Error al crear la localidad: ${response?.message || "Error desconocido"}`, "error")
        return false
      }
    } catch (error) {
      
      showMessage(`Error al crear la localidad: ${error.message}`, "error")
      return false
    }
  }

  const handleCancelNewLocation = () => {
    setShowNewLocationModal(false)
  }

  // Manejo de carga masiva
  const handleBulkUpload = async (file) => {
    try {
      if (!file) {
        showMessage("Por favor selecciona un archivo", "error")
        return false
      }
     
      const { name } = file
  
      if( name !== "localidades.csv"){
        showMessage("El nombre del archivo debe ser 'localidades.csv'","error")
        setShowBulkUploadModal(false)
        return false
      }
      
      const response = await bulkUploadAndRegisterLocalities(file)
      
      if (response?.success) {
        await loadLocalities()
        showMessage(response.message || "Carga masiva de localidades completada con éxito", "success")
        setShowBulkUploadModal(false)
        return true
      } else {
        showMessage(response?.error || "Error al procesar la carga masiva de localidades", "error")
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

  if (loading) {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Gestión de Localidades
            </h1>
            <p className={`mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Administra las localidades en el sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button
              className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowNewLocationModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Alta Localidad
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

        {/* ✅ DataTableCard maneja TODA la lógica de filtrado, búsqueda y paginación */}
        <DataTableCard
          columns={columns}
          data={enrichedLocalities} // ✅ TODOS LOS DATOS ENRIQUECIDOS
          isDarkMode={isDarkMode}
          currentPage={currentPage}
          totalPages={Math.ceil(enrichedLocalities.length / rowsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={enrichedLocalities.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Buscar Localidades o Departamento..."
          statusMessage={statusMessage}
          messageType={messageType}
          hasAction={false}
          hasSearch={true}
          hasFilter={false}
          sectionFilter={true}
          filterConfig={filterConfig}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {showNewLocationModal && (
        <NewLocationForm
          onCancel={handleCancelNewLocation}
          onLocationCreated={handleLocationCreated}
          isDarkMode={isDarkMode}
        />
      )}

      {showBulkUploadModal && (
        <BulkUploadForm1
          title="Carga Masiva de Localidades"
          description="Sube un archivo CSV con las localidades a registrar"
          onUpload={handleBulkUpload}
          onClose={() => setShowBulkUploadModal(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </SellerLayout>
  )
}
