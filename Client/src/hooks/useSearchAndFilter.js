import { useState , useMemo} from "react";
import { searchAndFilter } from "@/lib/searchAndFilters";


export const useSearchAndFilter = (data = [], searchFields = [], options = {}) => {
  const [searchQuery, setSearchQuery] = useState("")

  // Memoizamos los datos filtrados para optimizar rendimiento
  const filteredData = useMemo(() => {
    const result = searchAndFilter(data, searchQuery, searchFields, options)
    return result
  }, [data, searchQuery, searchFields, options])

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Función para resetear a una query específica
  const setSearch = (query) => {
    setSearchQuery(query || "")
  }

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    clearSearch,
    setSearch,
    hasActiveSearch: searchQuery.trim().length > 0,
    resultCount: filteredData?.length || 0,
    originalCount: data?.length || 0,
  }
}

export default useSearchAndFilter
