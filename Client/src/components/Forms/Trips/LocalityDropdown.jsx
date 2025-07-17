import { createPortal } from "react-dom"

const LocalityDropdown = ({
    isDarkMode,
    isVisible,
    groupedLocalities,
    onSelect,
    isLoading,
    searchTerm,
    placeholder = "No hay localidades disponibles",
    dropdownRef,
    top,
    left,
    width,
  }) => {
    if (!isVisible || top === 0 || left === 0 || width === 0) return null

    return createPortal (
      <div
        ref={dropdownRef}
        className={`absolute z-[9999] mt-1 w-[320px] ${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-300"} rounded-md shadow-xl border py-1 max-h-80 overflow-y-auto`}
        style={{
          position: "absolute",
          top,
          left,
          width,
          zIndex: 9999,
          maxHeight: "320px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: isDarkMode ? "#4B5563 #374151" : "#D1D5DB #F3F4F6",
        }}
      >
        {isLoading ? (
          <div className="px-3 py-4 text-sm text-center">
            <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <span className={`mt-2 block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
              Cargando localidades...
            </span>
          </div>
        ) : Object.keys(groupedLocalities).length > 0 ? (
          <>
            {/* Mostramos contador de resultados si hay filtrado */}
            {searchTerm && (
              <div
                className={`px-3 py-2 text-xs border-b ${
                  isDarkMode
                    ? "text-neutral-400 border-neutral-700 bg-neutral-700/30"
                    : "text-neutral-500 border-neutral-200 bg-neutral-50"
                }`}
              >
                {Object.values(groupedLocalities).flat().length} resultado(s) para "{searchTerm}"
              </div>
            )}

            {Object.entries(groupedLocalities).map(([department, localities]) => (
              <div key={department}>
                <p
                  className={`px-3 py-2 text-xs font-medium border-b sticky top-0 ${
                    isDarkMode
                      ? "text-orange-400 border-neutral-700 bg-neutral-800"
                      : "text-orange-600 border-neutral-200 bg-white"
                  }`}
                >
                  {department} ({localities.length})
                </p>
                {localities.map((locality) => (
                  <button
                    key={locality.id}
                    className={`w-full text-left px-3 py-3 text-sm transition-colors ${
                      isDarkMode
                        ? "text-white hover:bg-neutral-700 focus:bg-neutral-700"
                        : "text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100"
                    } focus:outline-none`}
                    onClick={(e) => {
                      e.preventDefault()
                      onSelect(locality)
                    }}
                    type="button"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{locality.name}</span>
                      <span className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                        {locality.department}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="px-3 py-4 text-sm text-center">
            <p className={isDarkMode ? "text-neutral-400" : "text-neutral-500"}>
              {searchTerm ? `No se encontraron localidades para "${searchTerm}"` : placeholder}
            </p>
            {searchTerm && (
              <p className={`text-xs mt-1 ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`}>
                Intenta con otro término de búsqueda
              </p>
            )}
          </div>
        )}
      </div>,
      document.body

    )
  }

export default LocalityDropdown;