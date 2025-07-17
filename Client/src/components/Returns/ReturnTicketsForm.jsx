import { useState } from "react"
import { Search, Ticket, User, MapPin, Calendar, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui"
import useReturns from "@/hooks/useReturns"
import useThemeStore from "@/store/useThemeStore"

export default function ReturnTicketsForm() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [saleId, setSaleId] = useState("")
  const [selectedTickets, setSelectedTickets] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [returnMessage, setReturnMessage] = useState("")
  const [returnMessageType, setReturnMessageType] = useState("success")

  const { tickets, loading, error, searchTicketsBySale, processReturn, clearTickets, canReturnTicket } = useReturns()

  // Buscar pasajes por ID de venta
  const handleSearch = async () => {
    if (!saleId.trim()) {
      setReturnMessage("Por favor ingrese un ID de venta")
      setReturnMessageType("error")
      return
    }

    setReturnMessage("")
    await searchTicketsBySale(saleId.trim())
  }

  // Manejar selección de pasajes 
  const handleTicketSelection = (ticketId) => {
    setSelectedTickets((prev) => {
      if (prev.includes(ticketId)) {
        return prev.filter((id) => id !== ticketId)
      } else {
        return [...prev, ticketId]
      }
    })
  }

  // Mostrar confirmación
  const handleReturnRequest = () => {
    if (selectedTickets.length === 0) {
      setReturnMessage("Debe seleccionar al menos un pasaje para devolver")
      setReturnMessageType("error")
      return
    }

    setShowConfirmation(true)
  }

  // Confirmar devolución
  const handleConfirmReturn = async () => {
    try {
      const result = await processReturn(selectedTickets)

      if (result.success) {
        setReturnMessage(result.message)
        setReturnMessageType("success")
        setSelectedTickets([])
        setShowConfirmation(false)

        // Limpiar después de 3 segundos
        setTimeout(() => {
          setReturnMessage("")
          clearTickets()
          setSaleId("")
        }, 3000)
      } else {
        setReturnMessage(result.message)
        setReturnMessageType("error")
        setShowConfirmation(false)
      }
    } catch (error) {
      setReturnMessage(error.message || "Error al procesar la devolución")
      setReturnMessageType("error")
      setShowConfirmation(false)
    }
  }

  // Cancelar confirmación
  const handleCancelReturn = () => {
    setShowConfirmation(false)
  }

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSaleId("")
    setSelectedTickets([])
    setReturnMessage("")
    clearTickets()
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
          Gestión de Devoluciones
        </h1>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} mt-1`}>
          Busque y procese devoluciones de pasajes
        </p>
      </div>

      {/* Búsqueda */}
      <div
        className={`p-6 rounded-lg border ${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
              ID de Venta
            </label>
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
              />
              <input
                type="text"
                placeholder="Ingrese el ID de la venta"
                value={saleId}
                onChange={(e) => setSaleId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  isDarkMode
                    ? "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
                }`}
              />
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <Button
              onClick={handleSearch}
              disabled={loading || !saleId.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button
              onClick={handleClearSearch}
              variant="outline"
              className={`cursor-pointer ${
                isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
              }`}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {returnMessage && (
        <div
          className={`p-4 rounded-lg border ${
            returnMessageType === "success"
              ? isDarkMode
                ? "bg-green-900/20 border-green-800 text-green-300"
                : "bg-green-50 border-green-200 text-green-700"
              : isDarkMode
                ? "bg-red-900/20 border-red-800 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            {returnMessageType === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <p className="font-medium">{returnMessage}</p>
          </div>
        </div>
      )}

      {/* Error de búsqueda */}
      {error && (
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
            <p className={`font-medium ${isDarkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>
          </div>
        </div>
      )}

      {/* Lista de pasajes */}
      {tickets.length > 0 && (
        <div
          className={`p-6 rounded-lg border ${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Pasajes Encontrados ({tickets.length})
            </h3>
            {selectedTickets.length > 0 && (
              <Button onClick={handleReturnRequest} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
                Devolver {selectedTickets.length} pasaje{selectedTickets.length > 1 ? "s" : ""}
              </Button>
            )}
          </div>

          {/* Instrucciones mejoradas */}
          <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? "bg-neutral-700/50" : "bg-neutral-100"}`}>
            <p className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
              💡 <strong>Selecciona los pasajes a devolver:</strong> Haz clic sobre el pasaje para seleccionarlo. Cuando
              esté seleccionado, haz clic nuevamente para deseleccionarlo.
            </p>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => {
              const canReturn = canReturnTicket(ticket)
              const isSelected = selectedTickets.includes(ticket.id_pasaje)

              return (
                <div
                  key={ticket.id_pasaje}
                  className={`relative p-4 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? isDarkMode
                        ? "border-orange-500 bg-orange-900/20 shadow-lg"
                        : "border-orange-500 bg-orange-50 shadow-lg"
                      : isDarkMode
                        ? "border-neutral-600 bg-neutral-700 hover:border-neutral-500"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                  } ${canReturn ? "cursor-pointer hover:shadow-md" : "opacity-60 cursor-not-allowed"}`}
                  onClick={() => canReturn && handleTicketSelection(ticket.id_pasaje)}
                >
                  {/* Indicador de estado en la esquina superior derecha */}
                  {canReturn && (
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : isDarkMode
                              ? "bg-neutral-600 text-neutral-300 hover:bg-neutral-500"
                              : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                        }`}
                      >
                        {isSelected ? "✓ Seleccionado" : "Clic para seleccionar"}
                      </div>
                    </div>
                  )}

                  {/* Indicador visual de selección */}
                  {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-lg"></div>}

                  <div className="flex items-start justify-between pr-32">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Información del pasaje */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Ticket className={`h-4 w-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                          <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                            Pasaje #{ticket.id_pasaje}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <User className={`h-3 w-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                          <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                            {ticket.cliente?.nombres} {ticket.cliente?.apellidos}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                            Asiento: {ticket.asiento?.numero_asiento}
                          </span>
                        </div>
                      </div>

                      {/* Información del viaje */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className={`h-4 w-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                          <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                            {ticket.viaje?.localidadOrigen?.nombreLocalidad} →{" "}
                            {ticket.viaje?.localidadDestino?.nombreLocalidad}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className={`h-3 w-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                          <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                            {ticket.viaje?.fecha_partida}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className={`h-3 w-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                          <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                            {ticket.viaje?.hora_partida}
                          </span>
                        </div>
                      </div>

                      {/* Precio y estado */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className={`h-4 w-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                          <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                            {ticket.precio}
                          </span>
                        </div>
                        {!canReturn && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-sm text-red-500">No se puede devolver (menos de 1h)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? "bg-neutral-900" : "bg-white"}`}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  Confirmar Devolución
                </h3>
              </div>

              <p className={`mb-6 ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                ¿Está seguro que desea devolver {selectedTickets.length} pasaje{selectedTickets.length > 1 ? "s" : ""}?
              </p>

              <div className="flex space-x-3">
                <Button
                  onClick={handleCancelReturn}
                  variant="outline"
                  className={`flex-1 cursor-pointer ${
                    isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
                  }`}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmReturn}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
