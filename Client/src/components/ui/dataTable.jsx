
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown } from "lucide-react"


export default function DataTable({
  columns,
  data,
  actions,
  isDarkMode,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  // Props de ordenamiento (manejado por DataTableCard)
  hasFilter = false,
  sortConfig = { key: null, direction: "asc" },
  onSort = () => {},
}) {
  // FUNCIÓN PARA RENDERIZAR INDICADOR DE ORDENAMIENTO
  const renderSortIndicator = (columnKey) => {
    if (!hasFilter) return null

    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="h-4 w-4 inline ml-1" />
      ) : (
        <ChevronDown className="h-4 w-4 inline ml-1" />
      )
    }

    return <ChevronUp className="h-4 w-4 inline ml-1 opacity-30" />
  }

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 font-medium text-sm ${
                    isDarkMode ? "text-neutral-300" : "text-neutral-700"
                  } ${hasFilter ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" : ""}`}
                  onClick={() => hasFilter && onSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {hasFilter && renderSortIndicator(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th
                  className={`text-left py-3 px-4 font-medium text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                >
                  ACCIONES
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className={`text-center py-8 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
                >
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b ${isDarkMode ? "border-neutral-800 hover:bg-neutral-800/50" : "border-neutral-100 hover:bg-neutral-50"}`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  {actions && <td className="py-3 px-4">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
            Mostrando {data.length} de {totalItems} elementos
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : isDarkMode
                    ? "hover:bg-neutral-800 text-neutral-400"
                    : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : isDarkMode
                    ? "hover:bg-neutral-800 text-neutral-400"
                    : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className={`px-3 py-1 text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : isDarkMode
                    ? "hover:bg-neutral-800 text-neutral-400"
                    : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : isDarkMode
                    ? "hover:bg-neutral-800 text-neutral-400"
                    : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
