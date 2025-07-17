import { useState, useMemo } from "react"
import { Card, CardContent, DataTable } from "@/components/ui"
import FilterPanel from "@/components/ui/filterPanel"
import { Search, AlertCircle, CheckCircle, X, Filter } from "lucide-react"


export default function DataTableCard({
  columns,
  data,
  actions,
  isDarkMode,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Buscar...",
  statusMessage,
  messageType = "success",
  hasAction = true,
  hasSearch = true,
  hasFilter = false,
  // Sistema de filtros dinámicos 
  sectionFilter = false,
  filterConfig = [],
  rowPerPage = 10,
}) {
  // ESTADO INTERNO DE FILTROS Y ORDENAMIENTO
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  })

  // ESTADO DE FILTROS DINÁMICOS
  const [activeFilters, setActiveFilters] = useState({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // FUNCIÓN PARA MANEJAR ORDENAMIENTO
  const handleSort = (columnKey) => {
    if (!hasFilter) return
    let direction = "asc"
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key: columnKey, direction })
  }

  // FUNCIÓN PARA LIMPIAR ORDENAMIENTO
  const clearSort = () => {
    setSortConfig({ key: null, direction: "asc" })
  }

  // FUNCIONES DE FILTRADO DINÁMICO
  const handleFilterChange = (key, value) => {
    console.log(`🔍 DataTableCard - Cambiando filtro ${key}:`, value)
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && value.from === "" && value.to === "") ||
        (typeof value === "object" && value.min === "" && value.max === "")
      ) {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }
      return newFilters
    })
    // Resetear página cuando cambian los filtros
    if (onPageChange) {
      onPageChange(1)
    }
  }

  const handleClearAllFilters = () => {
    setActiveFilters({})
    if (onPageChange) {
      onPageChange(1)
    }
  }

  const handleToggleFilterPanel = () => {
    setShowFilterPanel((prev) => !prev)
  }

  // FUNCIÓN DE FILTRADO AVANZADO
  const applyFilters = (items) => {
    if (Object.keys(activeFilters).length === 0) return items

    return items.filter((item) => {
      return Object.entries(activeFilters).every(([key, filterValue]) => {
        const itemValue = item[key]

        

        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          return true
        }

        // OBTENER CONFIGURACIÓN DEL FILTRO PARA DETERMINAR EL TIPO
        const filterConfigItem = filterConfig.find((config) => config.key === key)
        const filterType = filterConfigItem?.type || "text"

        // FILTRO ESPECÍFICO PARA TIPO_DESCUENTO
        if (key === "tipo_descuento") {
          
          // Filtrar solo por Estudiante, Jubilado o Ninguno
          return String(itemValue).toLowerCase() === String(filterValue).toLowerCase()
        }

        // FILTRO ESPECÍFICO PARA ESTADO_DESCUENTO
        if (key === "estado_descuento") {
          

          // Solo usuarios con descuento (Estudiante o Jubilado) pueden ser filtrados
          const tieneDescuento = item.esEstudiante === true || item.esJubilado === true

          if (filterValue === "verificado") {
            // Debe tener descuento Y estar verificado
            const resultado = tieneDescuento && item.discountVerifed === true
            return resultado
          }

          if (filterValue === "no_verificado") {
            // Debe tener descuento Y NO estar verificado
            const resultado = tieneDescuento && item.discountVerifed === false
            
            return resultado
          }

          // Si no es verificado ni no_verificado, mostrar todos
          return true
        }

        // FILTROS DE SELECT - COINCIDENCIA EXACTA
        if (filterType === "select") {
          // Para filtros de select, hacer coincidencia exacta
          return String(itemValue).trim() === String(filterValue).trim()
        }

        // Filtro por rango (precio, capacidad, etc.)
        if (typeof filterValue === "object" && (filterValue.min !== undefined || filterValue.max !== undefined)) {
          const numValue = Number.parseFloat(itemValue) || 0
          const min = filterValue.min ? Number.parseFloat(filterValue.min) : Number.NEGATIVE_INFINITY
          const max = filterValue.max ? Number.parseFloat(filterValue.max) : Number.POSITIVE_INFINITY
          return numValue >= min && numValue <= max
        }

        // Filtro por rango de fechas
        if (typeof filterValue === "object" && (filterValue.from || filterValue.to)) {
          try {
            const itemDate = new Date(itemValue)
            const fromDate = filterValue.from ? new Date(filterValue.from) : new Date("1900-01-01")
            const toDate = filterValue.to ? new Date(filterValue.to) : new Date("2100-12-31")
            return itemDate >= fromDate && itemDate <= toDate
          } catch (error) {
            return false
          }
        }

        // FILTRO POR FECHA ÚNICA (no rango) - MEJORADO PARA MANEJAR FORMATOS
        if (filterType === "date" && typeof filterValue === "string" && filterValue.trim() !== "") {
          try {
            

            // Normalizar el valor del item (puede venir como string o Date)
            let itemDateStr = itemValue
            if (itemValue instanceof Date) {
              // Si es un objeto Date, convertir a YYYY-MM-DD
              itemDateStr = itemValue.toISOString().split("T")[0]
            } else if (typeof itemValue === "string") {
              // Si viene como string, extraer solo la parte de fecha
              if (itemValue.includes("T")) {
                // Formato ISO: "2025-01-07T10:30:00" -> "2025-01-07"
                itemDateStr = itemValue.split("T")[0]
              } else if (itemValue.includes(" ")) {
                // Formato con espacio: "2025-01-07 10:30:00" -> "2025-01-07"
                itemDateStr = itemValue.split(" ")[0]
              } else {
                // Ya está en formato YYYY-MM-DD
                itemDateStr = itemValue
              }
            }

            // Normalizar el valor del filtro (siempre viene como YYYY-MM-DD del input date)
            const filterDateStr = filterValue.trim()

            

            return itemDateStr === filterDateStr
          } catch (error) {
            return false
          }
        }

        // FILTRO POR HORA (formato HH:MM) 
        if (filterType === "time" && typeof filterValue === "string" && filterValue.trim() !== "") {
          try {
            const itemTime = String(itemValue).trim()
            const filterTime = String(filterValue).trim()

            console.log(`🔍 Filtro de hora - ${key}:`, {
              filterTime,
              itemTime,
              sonIguales: itemTime === filterTime,
            })

            // Comparación exacta de hora
            return itemTime === filterTime
          } catch (error) {
            console.error("Error comparando horas:", error)
            return false
          }
        }

        // FILTRO BOOLEANO  (activo/inactivo)
        if (filterValue === "true" || filterValue === "false") {
          return (
            String(itemValue) === filterValue ||
            (filterValue === "true" && itemValue === true) ||
            (filterValue === "false" && itemValue === false)
          )
        }

        // Filtro multiselect
        if (Array.isArray(filterValue)) {
          return filterValue.includes(String(itemValue))
        }

        // FILTRO DE TEXTO SIMPLE - COINCIDENCIA PARCIAL (solo para campos de texto libre)
        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())
      })
    })
  }

  // FUNCIÓN DE ORDENAMIENTO INTELIGENTE POR TIPO DE DATO
  const getSmartSortValue = (value, key) => {
    if (value == null) return ""

    //  ORDENAMIENTO NUMÉRICO para campos específicos
    if (key === "capacidad" || key === "nro_coche" || key === "precio_viaje") {
      const numValue = Number.parseInt(String(value).replace(/\D/g, ""), 10)
      return isNaN(numValue) ? 0 : numValue
    }

    //  ORDENAMIENTO ESPECIAL PARA ESTADO
    if (key === "activo" || key === "estado_texto") {
      const strValue = String(value).toLowerCase()
      if (strValue.includes("activo")) return 1
      if (strValue.includes("inactivo")) return 2
      return 3
    }

    //  ORDENAMIENTO ALFABÉTICO para texto
    return String(value).toLowerCase()
  }

  //  APLICAR BÚSQUEDA, FILTROS Y ORDENAMIENTO
  const processedData = useMemo(() => {
    let result = [...data]

    

    // 1. Aplicar búsqueda
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        return Object.values(item).some((value) => String(value).toLowerCase().includes(query))
      })
      
    }

    // 2. Aplicar filtros dinámicos
    result = applyFilters(result)
    

    // 3. Aplicar ordenamiento
    if (hasFilter && sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getSmartSortValue(a[sortConfig.key], sortConfig.key)
        const bValue = getSmartSortValue(b[sortConfig.key], sortConfig.key)

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [data, searchQuery, activeFilters, sortConfig, hasFilter])

  //  PAGINACIÓN INTERNA - DESPUÉS DEL FILTRADO
  const totalFilteredItems = processedData.length
  const totalPagesCalculated = Math.ceil(totalFilteredItems / rowPerPage)
  const paginatedData = processedData.slice((currentPage - 1) * rowPerPage, currentPage * rowPerPage)

  // Filtrar columnas basado en hasAction
  const filteredColumns = hasAction ? columns : columns.filter((col) => col.key !== "actions")

  //  OBTENER NOMBRE LEGIBLE DE COLUMNA PARA INDICADOR
  const getColumnDisplayName = (key) => {
    const column = filteredColumns.find((col) => col.key === key)
    return column?.header || key
  }

  //  OBTENER TIPO DE ORDENAMIENTO PARA INDICADOR
  const getSortTypeIndicator = (key) => {
    if (key === "capacidad" || key === "nro_coche" || key === "precio_viaje") return "1-9"
    if (key === "activo" || key === "estado_texto") return "Activo-Inactivo"
    return "A-Z"
  }

  //  COMPONENTE PARA RENDERIZAR MENSAJE DE ESTADO
  const StatusMessage = () => {
    if (!statusMessage) return null

    return (
      <div
        className={`mb-4 p-3 rounded-lg border flex items-center gap-3 ${
          messageType === "error"
            ? isDarkMode
              ? "bg-red-900/20 border-red-800 text-red-300"
              : "bg-red-50 border-red-200 text-red-800"
            : messageType === "warning"
              ? isDarkMode
                ? "bg-yellow-900/20 border-yellow-800 text-yellow-300"
                : "bg-yellow-50 border-yellow-200 text-yellow-800"
              : messageType === "info"
                ? isDarkMode
                  ? "bg-blue-900/20 border-blue-800 text-blue-300"
                  : "bg-blue-50 border-blue-200 text-blue-800"
                : isDarkMode
                  ? "bg-green-900/20 border-green-800 text-green-300"
                  : "bg-green-50 border-green-200 text-green-800"
        }`}
      >
        {messageType === "error" ? (
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        ) : messageType === "warning" ? (
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        ) : messageType === "info" ? (
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
        <span className="font-semibold">{statusMessage}</span>
      </div>
    )
  }

  return (
    <>
      <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
        <CardContent className="p-4">
          {/*  BARRA DE BÚSQUEDA CON BOTÓN DE FILTROS AL LADO */}
          {hasSearch && (
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                {/* Barra de búsqueda */}
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      isDarkMode ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm ${
                      isDarkMode
                        ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                        : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500"
                    } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>

                {/*  BOTÓN DE FILTROS CON ICONO - POSICIONADO AL LADO DE LA BÚSQUEDA */}
                {sectionFilter && filterConfig.length > 0 && (
                  <button
                    onClick={handleToggleFilterPanel}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 min-w-[100px] relative ${
                      showFilterPanel
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                        : Object.keys(activeFilters).length > 0
                          ? isDarkMode
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-orange-50 text-orange-700 border-orange-300"
                          : isDarkMode
                            ? "bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                            : "bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtros</span>
                    {Object.keys(activeFilters).length > 0 && (
                      <span
                        className={`absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${
                          showFilterPanel || Object.keys(activeFilters).length > 0
                            ? "bg-white text-orange-600"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {Object.keys(activeFilters).length}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <StatusMessage />
            </div>
          )}

          {/*  PANEL DE FILTROS DINÁMICOS - DEBAJO DE LA BÚSQUEDA */}
          {sectionFilter && filterConfig.length > 0 && (
            <FilterPanel
              filterConfig={filterConfig}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAllFilters={handleClearAllFilters}
              isDarkMode={isDarkMode}
              showPanel={showFilterPanel}
              onTogglePanel={handleToggleFilterPanel}
            />
          )}

          {/*  INDICADOR DE ORDENAMIENTO ACTIVO */}
          {hasFilter && sortConfig.key && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                  📊 Ordenado por: {getColumnDisplayName(sortConfig.key)} (
                  {sortConfig.direction === "asc"
                    ? getSortTypeIndicator(sortConfig.key)
                    : getSortTypeIndicator(sortConfig.key).split("-").reverse().join("-")}
                  )
                </span>
              </div>
              <button
                onClick={clearSort}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isDarkMode
                    ? "text-blue-300 hover:text-blue-200 hover:bg-blue-800/30"
                    : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                }`}
              >
                <X className="h-3 w-3" />
                Limpiar ordenamiento
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            {/*  PASAR DATOS PROCESADOS CORRECTAMENTE */}
            <DataTable
              columns={filteredColumns}
              data={paginatedData} // ✅DATOS PAGINADOS INTERNAMENTE
              actions={hasAction ? actions : undefined}
              isDarkMode={isDarkMode}
              currentPage={currentPage}
              totalPages={totalPagesCalculated} // PÁGINAS CALCULADAS INTERNAMENTE
              onPageChange={onPageChange}
              totalItems={totalFilteredItems} //  TOTAL DE ITEMS FILTRADOS
              hasFilter={hasFilter}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
