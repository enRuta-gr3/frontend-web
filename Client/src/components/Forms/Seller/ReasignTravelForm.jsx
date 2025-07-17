import { useState, useEffect } from "react"
import useBuses from "@/hooks/useBuses"
import { X, Bus, DollarSign, Info, CheckCircle, Rocket, Flag, ClipboardList } from "lucide-react"

export default function ReasignTravelForm({
  onReasignSubmit,
  onCancel,
  isDarkMode,
  id_viaje,
  currentBusInfo,
  tripInfo,
}) {
  const [availableBuses, setAvailableBuses] = useState([])
  const [loadingBuses, setLoadingBuses] = useState(true)
  const [selectedBus, setSelectedBus] = useState("")

  const { loadAvailableBus } = useBuses()

  useEffect(() => {
    const fetchAvailableBuses = async () => {
      if (!id_viaje) return
      setLoadingBuses(true)
      try {
        const buses = await loadAvailableBus(id_viaje)
        setAvailableBuses(buses || [])
      } catch (error) {
        console.error("❌ [ReasignTravelForm] Error al cargar buses disponibles:", error)
        setAvailableBuses([])
      } finally {
        setLoadingBuses(false)
      }
    }
    fetchAvailableBuses()
  }, [id_viaje, loadAvailableBus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedBus) return
    onReasignSubmit(selectedBus)
  }

  const InfoCard = ({ icon, label, value }) => (
    <div className={`p-3 rounded-lg flex flex-col gap-1 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-800"}`}>{value}</span>
    </div>
  )

  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        status === "ABIERTO"
          ? isDarkMode
            ? "bg-green-500/20 text-green-400"
            : "bg-green-100 text-green-800"
          : isDarkMode
            ? "bg-red-500/20 text-red-400"
            : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  )

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
        isDarkMode ? "bg-black/60" : "bg-neutral-900/50"
      }`}
    >
      <div
        className={`rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col ${
          isDarkMode ? "bg-neutral-900 border border-neutral-700/50 text-white" : "bg-white text-neutral-900"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
         
          <div
            className={`flex justify-between items-center p-4 border-b flex-shrink-0 ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}
          >
            <h2 className="text-lg font-semibold">Reasignar Viaje</h2>
            <button
              type="button"
              onClick={onCancel}
              className={`${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-800"}`}
            >
              <X size={20} />
            </button>
          </div>

         
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
            <div>
              <label
                htmlFor="omnibus"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
              >
                Ómnibus disponibles
              </label>
              <select
                id="omnibus"
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className={`w-full rounded-md p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  isDarkMode
                    ? "bg-neutral-800 border-neutral-700 text-white"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
                disabled={loadingBuses || availableBuses.length === 0}
              >
                <option value="">{loadingBuses ? "Cargando..." : "Seleccione una opción"}</option>
                {availableBuses.map((bus) => (
                  <option key={bus.id_omnibus} value={bus.id_omnibus}>
                    Coche N° {bus.nro_coche} - {bus.capacidad} asientos
                  </option>
                ))}
              </select>
            </div>

            <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
              <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                Ómnibus actual:{" "}
                <span className={`font-semibold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                  Coche N° {currentBusInfo?.nro_coche} ({currentBusInfo?.capacidad} asientos)
                </span>
              </p>
            </div>

            <div className={`p-4 rounded-lg space-y-4 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className={`${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                <h3 className="font-semibold">Información del Viaje</h3>
              </div>
              <div className={`p-3 rounded-md flex items-center gap-2 ${isDarkMode ? "bg-neutral-900" : "bg-white"}`}>
                <Bus size={16} className="text-orange-500" />
                <span className="font-medium">
                  {tripInfo?.localidadOrigen?.nombreLocalidad} → {tripInfo?.localidadDestino?.nombreLocalidad}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={<Rocket size={16} className="text-green-500" />}
                  label="Partida"
                  value={`${tripInfo?.fecha_partida} - ${tripInfo?.hora_partida}`}
                />
                <InfoCard
                  icon={<Flag size={16} className="text-red-500" />}
                  label="Llegada"
                  value={`${tripInfo?.fecha_llegada} - ${tripInfo?.hora_llegada}`}
                />
                <InfoCard
                  icon={<DollarSign size={16} className="text-yellow-500" />}
                  label="Precio"
                  value={`$${tripInfo?.precio_viaje}`}
                />
                <div
                  className={`p-3 rounded-lg flex flex-col gap-1 h-full ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    <Info size={16} />
                    <span>Estado</span>
                  </div>
                  <StatusBadge status={tripInfo?.estado} />
                </div>
              </div>
            </div>

            {!loadingBuses && (
              <div
                className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm ${
                  availableBuses.length > 0
                    ? isDarkMode
                      ? "border border-green-500/50 bg-green-900/30 text-green-400"
                      : "border border-green-300 bg-green-50 text-green-800"
                    : isDarkMode
                      ? "border border-red-500/50 bg-red-900/30 text-red-400"
                      : "border border-red-300 bg-red-50 text-red-800"
                }`}
              >
                {availableBuses.length > 0 ? <CheckCircle size={16} /> : <X size={16} />}
                <span>
                  {availableBuses.length > 0
                    ? `${availableBuses.length} ómnibus disponible${availableBuses.length > 1 ? "s" : ""} para reasignar`
                    : "No hay ómnibus disponibles para reasignar"}
                </span>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div
            className={`flex justify-end items-center gap-3 p-4 border-t flex-shrink-0 ${isDarkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}
          >
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-md font-semibold text-sm ${
                isDarkMode
                  ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                  : "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300"
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedBus || loadingBuses}
              className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm disabled:bg-neutral-500 disabled:cursor-not-allowed"
            >
              Reasignar viaje
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
