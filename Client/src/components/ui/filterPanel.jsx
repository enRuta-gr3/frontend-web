
import { X } from "lucide-react"

export default function FilterPanel({
  filterConfig,
  activeFilters,
  onFilterChange,
  onClearAllFilters,
  isDarkMode,
  showPanel,
  onTogglePanel,
}) {
  if (!showPanel) return null

  const renderFilterInput = (config) => {
    const { key, label, type, options, rangeType, placeholder } = config
    const currentValue = activeFilters[key] || ""

    switch (type) {
      case "select":
        return (
          <div key={key} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              {label}
            </label>
            <select
              value={currentValue}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-neutral-900"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">{config.placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case "range":
        const rangeValue = currentValue || { min: "", max: "" }
        return (
          <div key={key} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              {label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type={rangeType === "number" ? "number" : "text"}
                placeholder="Mín"
                value={rangeValue.min || ""}
                onChange={(e) =>
                  onFilterChange(key, {
                    ...rangeValue,
                    min: e.target.value,
                  })
                }
                className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                  isDarkMode
                    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500"
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              <input
                type={rangeType === "number" ? "number" : "text"}
                placeholder="Máx"
                value={rangeValue.max || ""}
                onChange={(e) =>
                  onFilterChange(key, {
                    ...rangeValue,
                    max: e.target.value,
                  })
                }
                className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                  isDarkMode
                    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500"
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
            </div>
          </div>
        )

      case "date":
        return (
          <div key={key} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              {label}
            </label>
            <input
              type="date"
              value={currentValue}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-neutral-900"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
          </div>
        )

      case "time":
        return (
          <div key={key} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              {label}
            </label>
            <input
              type="time"
              value={currentValue}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-neutral-900"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
          </div>
        )

      case "text":
      default:
        return (
          <div key={key} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              {label}
            </label>
            <input
              type="text"
              placeholder={`Filtrar por ${label.toLowerCase()}...`}
              value={currentValue}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
          </div>
        )
    }
  }

  return (
    <div
      className={`mb-6 p-4 rounded-lg border transition-all duration-200 ${
        isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Filtros Avanzados</h3>
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={onClearAllFilters}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                : "text-red-600 hover:text-red-700 hover:bg-red-50"
            }`}
          >
            <X className="h-4 w-4" />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filterConfig.map((config) => renderFilterInput(config))}
      </div>

      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const config = filterConfig.find((c) => c.key === key)
              const label = config?.label || key

              let displayValue = value
              if (typeof value === "object" && value.min && value.max) {
                displayValue = `${value.min} - ${value.max}`
              } else if (typeof value === "object" && (value.min || value.max)) {
                displayValue = value.min ? `≥ ${value.min}` : `≤ ${value.max}`
              }

              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {label}: {displayValue}
                  <button
                    onClick={() => onFilterChange(key, "")}
                    className="ml-1 hover:bg-orange-700 hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
