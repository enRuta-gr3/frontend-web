
import { Check, Download, ArrowLeft } from "lucide-react"
import { Button, Card, CardContent } from "@/components"
import useThemeStore from "@/store/useThemeStore"

/**
 * Componente PaymentSuccess
 * 
 * Muestra la confirmación de pago exitoso y los detalles de la venta de pasajes.
 * Permite iniciar una nueva venta o descargar los pasajes generados.
 * 
 * Props:
 * @param {Object} trip - Información del viaje vendido.
 * @param {number} passengers - Cantidad de pasajeros.
 * @param {Array} selectedSeats - Asientos seleccionados.
 * @param {boolean} roundTrip - Indica si es ida y vuelta (opcional).
 * @param {string} paymentMethod - Método de pago utilizado (opcional).
 * @param {Function} onNewSale - Callback para iniciar una nueva venta.
 * 
 * @returns {JSX.Element}
 */
export default function PaymentSuccess({
  trip,
  passengers,
  selectedSeats,
  roundTrip = false,
  paymentMethod = "cash",
  onNewSale,
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  // Calcular el total pagado
  const totalAmount = roundTrip
    ? (trip.ida?.price || 0) * passengers + (trip.vuelta?.price || 0) * passengers
    : (trip?.price || 0) * passengers

  return (
    <div className="max-w-4xl mx-auto">
      <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              ¡Pago Completado!
            </h2>

            <p className={`text-center mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Se ha registrado la venta y se han generado los pasajes correctamente.
            </p>

            <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
              <h3 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Detalles de la venta
              </h3>

              {roundTrip ? (
                <div className="space-y-4">
                  <div className={`pb-3 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                      Viaje de Ida
                    </h4>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                        {trip.ida.origin} → {trip.ida.destination}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>{trip.ida.departureDate}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                        {selectedSeats.ida.map((seat) => seat.number).join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className={`pb-3 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                      Viaje de Vuelta
                    </h4>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                        {trip.vuelta.origin} → {trip.vuelta.destination}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                        {trip.vuelta.departureDate}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                        {selectedSeats.vuelta.map((seat) => seat.number).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`pb-3 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
                  <div className="flex justify-between mb-1">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                      {trip.origin} → {trip.destination}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-900"}>{trip.departureDate}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Hora:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-900"}>{trip.departureTime}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                      {selectedSeats.map((seat) => seat.number).join(", ")}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Pasajeros:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-900"}>{passengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Método de pago:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-900"}>
                    {paymentMethod === "cash" ? "Efectivo" : "Mercado Pago"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className={isDarkMode ? "text-white" : "text-neutral-900"}>Total pagado:</span>
                  <span className="text-orange-500">${totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={onNewSale}
                className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nueva venta
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Download className="h-4 w-4 mr-2" />
                Descargar pasajes (PDF)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
