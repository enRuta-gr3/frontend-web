
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components"

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isDarkMode = false,
  maxVisiblePages = 10,
  className = "",
}) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null

  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    // Si hay menos páginas que el máximo visible, mostrar todas
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Calcular el rango de páginas a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = startPage + maxVisiblePages - 1

    // Ajustar si el rango excede el total de páginas
    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    const pages = []

    // Siempre mostrar la primera página
    if (startPage > 1) {
      pages.push(1)
      // Agregar puntos suspensivos si hay un salto
      if (startPage > 2) {
        pages.push("ellipsis-start")
      }
    }

    // Agregar las páginas del rango
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Siempre mostrar la última página
    if (endPage < totalPages) {
      // Agregar puntos suspensivos si hay un salto
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end")
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pageRange = getPageRange()

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Paginación">
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-200 text-neutral-700"}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      {pageRange.map((page, index) => {
        // Renderizar puntos suspensivos
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`w-9 h-9 flex items-center justify-center ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )
        }

        // Renderizar botón de página
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`Página ${page}`}
            className={
              currentPage === page
                ? "bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
                : isDarkMode
                  ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            }
          >
            {page}
          </Button>
        )
      })}

      {/* Botón Siguiente */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className={isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-200 text-neutral-700"}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
