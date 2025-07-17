import { useState } from "react"
import { Button, Card, CardContent } from "@/components"
import { CreditCard, Banknote, AlertCircle, ArrowLeft } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import paypal_logo from "@/assets/paypal_logo.webp"


export default function PaymentSelect({
  paymentMethods = [],
  onSelectPayment,
  onCancel,
  trip,
  passengers,
  selectedSeats,
  totalAmount,
  discountAmount = 0,
  roundTrip = false,
  isSellerForm = false,
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState("")
  const [change, setChange] = useState(0)
  const [error, setError] = useState("")

  // Filtrar métodos de pago: quitar PayPal cuando es isSellerForm = true
  const filteredPaymentMethods = paymentMethods.filter((method) => {
    if (isSellerForm && method.nombre.toLowerCase().includes("paypal")) {
      return false // Ocultar PayPal en panel vendedor
    }
    return true
  })

  // Calcular total correctamente
  const total = roundTrip
    ? (selectedSeats.ida?.length || 0) * (trip.ida?.price || 0) +
      (selectedSeats.vuelta?.length || 0) * (trip.vuelta?.price || 0)
    : (Array.isArray(selectedSeats) ? selectedSeats.length : 0) * (trip?.price || 0)

  // Usar totalAmount si está disponible (viene del saleCalculate)
  const finalTotal = totalAmount ? totalAmount - discountAmount : total - discountAmount

  console.log("🎯 [PaymentSelect] Cálculo de totales:", {
    roundTrip,
    selectedSeats,
    trip,
    total,
    totalAmount,
    discountAmount,
    finalTotal,
  })

  // Manejar cambio en el monto en efectivo
  const handleCashAmountChange = (e) => {
    const value = e.target.value
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCashAmount(value)

      const numValue = Number.parseFloat(value) || 0
      if (numValue >= finalTotal) {
        setChange(numValue - finalTotal)
        setError("")
      } else {
        setChange(0)
        if (value !== "") {
          setError("El monto ingresado es menor al total a pagar")
        } else {
          setError("")
        }
      }
    }
  }

  // Seleccionar método de pago
  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    setError("")

    // Si no es efectivo, resetear los campos de efectivo
    if (method.nombre.toLowerCase() !== "efectivo") {
      setCashAmount("")
      setChange(0)
    }
  }

  // Continuar con el pago
  const handleContinue = () => {
    if (!selectedMethod) {
      setError("Debe seleccionar un método de pago")
      return
    }

    // Validar monto en efectivo si es pago en efectivo
    if (selectedMethod.nombre.toLowerCase() === "efectivo") {
      if (!cashAmount || Number.parseFloat(cashAmount) < finalTotal) {
        setError("El monto ingresado debe ser igual o mayor al total a pagar")
        return
      }
    }

    // Enviar método seleccionado y datos adicionales
    onSelectPayment({
      paymentMethod: selectedMethod,
      cashAmount: Number.parseFloat(cashAmount) || 0,
      change: change,
    })
  }

  // Obtener ícono según el método de pago
  const getMethodIcon = (methodName) => {
    const name = methodName.toLowerCase()
    if (name.includes("efectivo")) {
      return <Banknote className={`h-5 w-5 mr-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`} />
    }
    if (name.includes("paypal")) {
      return <img src={paypal_logo || "/placeholder.svg"} alt="PayPal" className="h-5 w-5 mr-3" />
    }
    return <CreditCard className={`h-5 w-5 mr-3 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`} />
  }

  // Obtener descripción según el método de pago
  const getMethodDescription = (methodName) => {
    const name = methodName.toLowerCase()
    if (name.includes("efectivo")) {
      return "Pago en efectivo en mostrador"
    }
    if (name.includes("paypal")) {
      return "Pago online con PayPal"
    }
    return "Método de pago disponible"
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"} mb-2`}>
          Seleccionar método de pago
        </h2>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
          Elige cómo deseas realizar el pago de tu viaje
        </p>
        {isSellerForm && (
          <p className={`text-sm mt-1 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
            * PayPal no está disponible para ventas por mostrador
          </p>
        )}
      </div>

      {error && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
          } flex items-center`}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Métodos de pago disponibles */}
        <div>
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Métodos de Pago Disponibles
              </h3>

              {filteredPaymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle
                    className={`h-8 w-8 mx-auto mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
                  />
                  <p className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>
                    No hay métodos de pago disponibles en este momento
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPaymentMethods.map((method) => (
                    <div
                      key={method.id_medio_de_pago}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMethod?.id_medio_de_pago === method.id_medio_de_pago
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : isDarkMode
                            ? "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50"
                            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                      onClick={() => handleSelectMethod(method)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                            selectedMethod?.id_medio_de_pago === method.id_medio_de_pago
                              ? "border-orange-500"
                              : isDarkMode
                                ? "border-neutral-600"
                                : "border-neutral-300"
                          }`}
                        >
                          {selectedMethod?.id_medio_de_pago === method.id_medio_de_pago && (
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          )}
                        </div>
                        <div className="flex items-center flex-1">
                          {getMethodIcon(method.nombre)}
                          <div>
                            <p className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                              {method.nombre}
                            </p>
                            <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                              {getMethodDescription(method.nombre)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Campos adicionales para pago en efectivo */}
              {selectedMethod?.nombre.toLowerCase() === "efectivo" && isSellerForm && (
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                    Detalles del pago en efectivo
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Monto a pagar
                      </label>
                      <div className={`p-2 rounded ${isDarkMode ? "bg-neutral-700" : "bg-neutral-200"}`}>
                        ${finalTotal.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Monto recibido
                      </label>
                      <input
                        type="text"
                        value={cashAmount}
                        onChange={handleCashAmountChange}
                        className={`w-full p-2 rounded border ${
                          isDarkMode
                            ? "bg-neutral-800 border-neutral-700 text-white"
                            : "bg-white border-neutral-300 text-neutral-900"
                        }`}
                        placeholder="Ingrese el monto recibido"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Vuelto
                      </label>
                      <div
                        className={`p-2 rounded font-medium ${
                          isDarkMode ? "bg-neutral-700 text-green-400" : "bg-neutral-200 text-green-600"
                        }`}
                      >
                        ${change.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleContinue}
                  disabled={
                    !selectedMethod ||
                    (selectedMethod?.nombre.toLowerCase() === "efectivo" &&
                      isSellerForm &&
                      (!cashAmount || Number.parseFloat(cashAmount) < finalTotal))
                  }
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de la compra */}
        <div>
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Resumen de la Compra
              </h3>

              {roundTrip ? (
                <div>
                  <div className={`mb-4 pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                      Viaje de Ida
                    </h4>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {trip.ida?.origin} → {trip.ida?.destination}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip.ida?.departureDate}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {selectedSeats.ida?.map((seat) => seat.number).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Subtotal:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        ${((trip.ida?.price || 0) * passengers).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className={`mb-4 pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                    <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                      Viaje de Vuelta
                    </h4>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {trip.vuelta?.origin} → {trip.vuelta?.destination}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {trip.vuelta?.departureDate}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {selectedSeats.vuelta?.map((seat) => seat.number).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Subtotal:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        ${((trip.vuelta?.price || 0) * passengers).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Mostrar subtotal antes del descuento */}
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Subtotal:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                      ${(totalAmount || total).toFixed(2)}
                    </span>
                  </div>

                  {/* Mostrar descuento si existe */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between mb-4">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Descuento:</span>
                      <span className="text-green-500 font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`mb-4 pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                      {trip?.origin} → {trip?.destination}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip?.departureDate}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Hora:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{trip?.departureTime}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Empresa:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>EnRuta</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Num Asientos:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                      {Array.isArray(selectedSeats)
                        ? selectedSeats.map((seat) => seat.number).join(", ")
                        : "No seleccionados"}
                    </span>
                  </div>

                  {/* Mostrar subtotal antes del descuento */}
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Subtotal:</span>
                    <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                      ${(totalAmount || total).toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && ( // Mostrar descuento si existe
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Descuento:</span>
                      <span className="text-green-500 font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Pasajeros:</span>
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{passengers}</span>
                </div>
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                <div className="flex justify-between text-lg font-medium">
                  <span className={isDarkMode ? "text-white" : "text-neutral-800"}>Total:</span>
                  <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
