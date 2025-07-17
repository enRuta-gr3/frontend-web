import { useState, useEffect, useMemo } from "react"
import { Check, X, Info } from "lucide-react"
import { Button, Card, CardContent } from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useSeats from "@/hooks/useSeats"
import useSale from "@/hooks/useSale"
import useAuthStore from "@/store/useAuthStore"
import usePayment from "@/hooks/usePayments"

export default function SeatSelection({
  trip,
  passengers,
  onComplete,
  onCancel,
  isFinishStep,
  isReturn,
  isSellerForm = false,
  customerData = null,
  sellerData = null,
  roundTripData = null, // propiedad para viajes ida-vuelta
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [error, setError] = useState("")
  const [busLayout, setBusLayout] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])

  // Obtener usuario autenticado
  const { user } = useAuthStore()

  // Hook para manejar asientos
  const { seats, loading: seatsLoading, fetchSeats, updateSeatsState, generateBusLayout } = useSeats()

  // hook para manejar el monto final (con descuento segun tipo descuento del usuario asociado)
  const { saleCalculate } = useSale()

  // Hook para manejar pagos
  const { getPaymentMethods, loading: paymentLoading } = usePayment()

  // Capacidad del bus
  const busCapacity = useMemo(() => trip.bus?.capacity || 40, [trip.bus?.capacity])

 

  // Cargar asientos del ómnibus asociado al viaje
  useEffect(() => {
    if (trip.id) {
     

      fetchSeats(trip.id)
        .then((seatsData) => {
          //console.log(`✅ [SeatSelection] Asientos cargados para ${isReturn ? "vuelta" : "ida"}:`, seatsData)
        })
        .catch((error) => {
          //console.error(`❌ [SeatSelection] Error al cargar asientos:`, error)
          setError("Error al cargar los asientos del ómnibus")
        })
    }
  }, [trip.id, fetchSeats, isReturn])

  // Generar layout del bus cuando cambien los asientos
  useEffect(() => {
    if (seats.length > 0) {
      const layout = generateBusLayout(seats, busCapacity)
      setBusLayout(layout)
    } else if (!seatsLoading) {
      const layout = generateBusLayout([], busCapacity)
      setBusLayout(layout)
    }
  }, [seats, busCapacity, generateBusLayout, seatsLoading, isReturn])

  // Manejar click en asiento
  const handleSeatClick = (seat) => {
    // No permitir seleccionar asientos ocupados o vacíos
    if (seat.status === "occupied" || seat.status === "empty") {
      return
    }

    // Si el asiento ya está seleccionado, quitarlo
    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id))
      setError("") // Limpiar error
      return
    }

    // Si ya se seleccionaron todos los asientos necesarios, mostrar error
    if (selectedSeats.length >= passengers) {
      const errorMsg = `Solo puede seleccionar ${passengers} asiento(s)`
      setError(errorMsg)
      setTimeout(() => setError(""), 3000)
      return
    }

    // Agregar asiento a seleccionados
    setSelectedSeats([...selectedSeats, seat])
    setError("") // Limpiar error
  }

  // Manejar continuar/comprar
  const handleContinue = async () => {
    // Validar que se hayan seleccionado todos los asientos
    if (selectedSeats.length !== Number.parseInt(passengers)) {
      const errorMsg = `Debe seleccionar exactamente ${passengers} asiento(s)`
      setError(errorMsg)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      
      // Determinar el UUID del usuario según el contexto
      const userUuid = isSellerForm ? customerData?.uuidAuth : user?.uuidAuth

      // Llamar al servicio para cambiar estado de asientos (reservarlos)
      await updateSeatsState(trip.id, selectedSeats, userUuid, passengers)

      let ventaCalculada = null
      let paymentMethodsResponse = { success: false, data: [] }

      // 🎯 SOLO CALCULAR VENTA Y MÉTODOS DE PAGO EN EL PASO FINAL
      if (isFinishStep) {
        
        // Preparar datos para saleCalculate
        let rawData = []

        if (roundTripData?.isRoundTrip && roundTripData.idaTrip && roundTripData.vueltaTrip) {
          // VIAJE IDA-VUELTA: Calcular ambos viajes juntos
         
          rawData = [
            {
              uuidAuth: userUuid,
              id_viaje: roundTripData.idaTrip.id,
              cantidad: passengers,
            },
            {
              uuidAuth: userUuid,
              id_viaje: roundTripData.vueltaTrip.id,
              cantidad: passengers,
            },
          ]
        } else {
          // VIAJE SOLO IDA: Calcular solo este viaje
          
          rawData = [
            {
              uuidAuth: userUuid,
              id_viaje: trip.id,
              cantidad: passengers,
            },
          ]
        }

        
        ventaCalculada = await saleCalculate(rawData)
      

        // Obtener métodos de pago disponibles
       
        let paymentData = {}

        if (isSellerForm) {
          paymentData = {
            vendedor: {
              uuidAuth: sellerData?.uuidAuth || "",
            },
            cliente: {
              uuidAuth: customerData?.uuidAuth || "",
            },
          }
        } else {
          paymentData = {
            cliente: {
              uuidAuth: user.uuidAuth || "",
            },
          }
        }

       
        paymentMethodsResponse = await getPaymentMethods(isSellerForm, paymentData)

        if (paymentMethodsResponse.success && paymentMethodsResponse.data) {
          setPaymentMethods(paymentMethodsResponse.data)
        }
      } else {
        console.log("⏭️ [SeatSelection] No es paso final, omitiendo cálculo de venta y métodos de pago...")
      }

     

      // Completar con los datos correspondientes
      onComplete({
        selectedSeats,
        ventaCalculada: isFinishStep ? ventaCalculada : null,
        paymentMethods: isFinishStep ? paymentMethodsResponse.data || [] : [],
      })
    } catch (error) {
     
      setError("Error al reservar los asientos. Intente nuevamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Mostrar loading mientras cargan los asientos
  if (seatsLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"} mb-2`}>
            Selección de Asientos {isReturn ? "(Vuelta)" : "(Ida)"}
          </h2>
        </div>
        <div
          className={`flex flex-col items-center justify-center p-12 rounded-lg ${
            isDarkMode ? "bg-white/5" : "bg-white"
          } shadow-sm`}
        >
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
          <p className={isDarkMode ? "text-white" : "text-neutral-800"}>
            Cargando asientos del ómnibus {isReturn ? "(vuelta)" : "(ida)"}...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"} mb-2`}>
          Selección de Asientos {isReturn ? "(Vuelta)" : "(Ida)"}
        </h2>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
          Seleccione {passengers} asiento(s) para su viaje de {trip.origin} a {trip.destination}
          {isReturn && " (viaje de vuelta)"}
        </p>
        {isSellerForm && customerData && (
          <p className={`text-sm mt-1 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
            Cliente: {customerData.nombres} {customerData.apellidos} - {customerData.ci}
          </p>
        )}
        {isSellerForm && sellerData && (
          <p className={`text-sm mt-1 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
            Vendedor: {sellerData.nombres} {sellerData.apellidos}
          </p>
        )}
      </div>

      {error && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
          } flex items-center`}
        >
          <Info className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                  Bus {trip.busCompany || trip.bus?.number || "N/A"} - Capacidad: {busCapacity}
                  {isReturn && " (Vuelta)"}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                  {seats.filter((seat) => seat.estado === "LIBRE").length} asientos disponibles
                </div>
              </div>

              {/* Leyenda de asientos */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded border border-neutral-300 bg-white mr-2"></div>
                  <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-orange-500 mr-2"></div>
                  <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Seleccionado
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-neutral-300 mr-2"></div>
                  <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>Ocupado</span>
                </div>
              </div>

              {/* Layout del bus */}
              <div className={`p-4 rounded-lg ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"} mb-4`}>
                <div className="flex justify-center mb-4">
                  <div className={`px-4 py-2 rounded ${isDarkMode ? "bg-neutral-700" : "bg-neutral-200"}`}>
                    Frente del ómnibus {isReturn ? "(Vuelta)" : "(Ida)"}
                  </div>
                </div>

                {/* Layout de asientos */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {busLayout?.map((row, rowIndex) => (
                      <div key={`left-${rowIndex}`} className="flex justify-end space-x-2">
                        {row.slice(0, 2).map((seat) => (
                          <button
                            key={seat.id}
                            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                              seat.status === "occupied"
                                ? isDarkMode
                                  ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                                : seat.status === "empty"
                                  ? "invisible"
                                  : selectedSeats.some((s) => s.id === seat.id)
                                    ? "bg-orange-500 text-white"
                                    : isDarkMode
                                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                      : "bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-300"
                            }`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === "occupied" || seat.status === "empty"}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {busLayout?.map((row, rowIndex) => (
                      <div key={`right-${rowIndex}`} className="flex space-x-2">
                        {row.slice(2, 4).map((seat) => (
                          <button
                            key={seat.id}
                            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                              seat.status === "occupied"
                                ? isDarkMode
                                  ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                                : seat.status === "empty"
                                  ? "invisible"
                                  : selectedSeats.some((s) => s.id === seat.id)
                                    ? "bg-orange-500 text-white"
                                    : isDarkMode
                                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                      : "bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-300"
                            }`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === "occupied" || seat.status === "empty"}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-80">
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Resumen de selección {isReturn ? "(Vuelta)" : "(Ida)"}
              </h3>
              <div className={`mb-4 pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Viaje:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                    {trip.origin} → {trip.destination}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Tipo:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{isReturn ? "Vuelta" : "Ida"}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip.departureDate}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Hora:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Empresa:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip.busCompany}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Pasajeros:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{passengers}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos seleccionados:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                    {selectedSeats.length > 0 ? selectedSeats.map((s) => s.number).join(", ") : "Ninguno"}
                  </span>
                </div>
              </div>

              <div className={`mb-6 pt-4 border-t ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                <div className="flex justify-between text-lg font-medium">
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>Total:</span>
                  <span className="text-orange-500">${trip.price * passengers}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                  onClick={handleContinue}
                  disabled={selectedSeats.length !== Number.parseInt(passengers) || isProcessing}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isProcessing ? "Procesando..." : isFinishStep ? "Comprar" : "Continuar"}
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${
                    isDarkMode
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }`}
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
