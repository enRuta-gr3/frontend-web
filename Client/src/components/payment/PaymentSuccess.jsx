import { Button } from "@/components"
import { Check, Download, ArrowLeft, Receipt, AlertCircle } from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import { generateAndDownloadPDF } from "@/lib/pdfGenerator"

/**
 * Componente PaymentSuccess
 *
 * Muestra la confirmación de pago exitoso y los detalles de los pasajes comprados.
 * Utiliza los datos reales de la respuesta del backend.
 */

//si llega aca fue compra exitosa

export default function PaymentSuccess({
  trip,
  passengers,
  selectedSeats,
  roundTrip = false,
  isSellerForm = false,
  customerData = null,
  sellerData = null,
  tickets = [],
  saleId = null,
  paymentDetails = null,
  discountAmount = 0,
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  console.log("😆[PaymentSuccess] Tickets:  ", tickets)
  console.warn(`Ticket.Data: ${JSON.stringify(tickets, null, 2)}`)

  // Calcular el subtotal original (antes de descuentos) basado en los precios originales de los viajes
  const calculateOriginalSubtotal = () => {
    if (roundTrip && trip?.ida && trip?.vuelta) {
      // Para viajes ida y vuelta, usar los precios originales de cada viaje
      return (trip.ida.price || 0) * passengers + (trip.vuelta.price || 0) * passengers
    } else if (trip?.price) {
      // Para viaje solo ida
      return trip.price * passengers
    } else if (tickets && tickets.length > 0) {
      // Fallback:  calcular desde tickets + descuento
      const currentTotal = tickets.reduce((sum, ticket) => sum + (ticket.precio || 0), 0)
      return currentTotal + discountAmount
    }
    return 0
  }

  // Calcular el total actual de los tickets (después de descuentos aplicados)
  const calculateTicketsTotal = () => {
    if (tickets && tickets.length > 0) {
      return tickets.reduce((sum, ticket) => sum + (ticket.precio || 0), 0)
    }
    return 0
  }

  // Calcular el monto real pagado
  const calculateActualPaidAmount = () => {
    if (paymentDetails?.method === "efectivo" && paymentDetails?.cashAmount && paymentDetails?.change !== undefined) {
      // Para efectivo: monto recibido - vuelto = monto pagado
      return paymentDetails.cashAmount - paymentDetails.change
    }

    // Para otros métodos: usar el total de tickets (ya con descuentos aplicados)
    return calculateTicketsTotal()
  }

  // Función para obtener el precio original de un ticket específico
  const getOriginalTicketPrice = (ticket, index) => {
    if (roundTrip && trip?.ida && trip?.vuelta) {
      // Para viajes ida y vuelta, determinar si es ida o vuelta
      if (index === 0) {
        return trip.ida.price || 0
      } else {
        return trip.vuelta.price || 0
      }
    } else if (trip?.price) {
      // Para viaje solo ida
      return trip.price || 0
    }
    // Fallback: calcular proporcionalmente
    const totalOriginal = calculateOriginalSubtotal()
    const totalCurrent = calculateTicketsTotal()
    if (totalCurrent > 0) {
      return (ticket.precio * totalOriginal) / totalCurrent
    }
    return ticket.precio || 0
  }

  // Función para calcular el descuento aplicado a un ticket específico
  const getTicketDiscount = (ticket, index) => {
    const originalPrice = getOriginalTicketPrice(ticket, index)
    const finalPrice = ticket.precio || 0
    return Math.max(0, originalPrice - finalPrice)
  }

  const originalSubtotal = calculateOriginalSubtotal()
  const ticketsTotal = calculateTicketsTotal()
  const actualPaidAmount = calculateActualPaidAmount()

  // Función para volver a la página principal
  const handleBackToHome = () => {
    if (isSellerForm) {
      // En el panel del vendedor, recargar la página para hacer una nueva venta
      window.location.reload()
    } else {
      // En el panel del cliente, ir al inicio
      window.location.href = "/"
    }
  }

  // Función para descargar los pasajes
  const handleDownloadTickets = () => {
    if (tickets.length === 0) {
      alert("No hay pasajes para descargar")
      return
    }

    // Crear datos para el PDF con información detallada de cada ticket
    const ticketsWithDetails = tickets.map((ticket, index) => ({
      ...ticket,
      originalPrice: getOriginalTicketPrice(ticket, index),
      discountApplied: getTicketDiscount(ticket, index),
    }))

    const pdfData = {
      tickets: ticketsWithDetails,
      saleId,
      paymentDetails: {
        ...paymentDetails,
        actualPaidAmount,
        originalSubtotal,
        ticketsTotal,
      },
      customerData: isSellerForm ? customerData : null,
      sellerData: isSellerForm ? sellerData : null,
      totalAmount: actualPaidAmount,
      originalSubtotal,
      ticketsTotal,
      discountAmount,
    }

   
    const success = generateAndDownloadPDF(pdfData, `pasaje_${saleId || "temp"}_${new Date().getTime()}.pdf`)

    if (!success) {
      const dataStr = JSON.stringify(pdfData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pasaje_${saleId || "temp"}_${new Date().getTime()}.json`
      link.click()
      URL.revokeObjectURL(url)
      alert("Error al generar el PDF. Se descargó en como JSON")
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      // Si viene en formato DD/MM/YYYY, devolverlo tal como está
      if (dateString.includes("/")) {
        return dateString
      }
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Función para formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    try {
      // Si viene en formato HH:MM, devolverlo tal como está
      if (timeString.includes(":") && timeString.length <= 5) {
        return timeString
      }
      // Si viene en formato HH:MM:SS, tomar solo HH:MM
      return timeString.substring(0, 5)
    } catch {
      return timeString
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className={`rounded-lg overflow-hidden border ${
          isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
        } shadow-sm`}
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              ¡Compra completada con éxito!
            </h2>

            <p className={`text-center mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Su compra ha sido procesada correctamente. A continuación puede descargar sus pasajes.
            </p>

            {/* Información del pago con desglose claro */}
            {paymentDetails && (
              <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                <div className="flex items-center mb-3">
                  <Receipt className={`h-5 w-5 mr-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`} />
                  <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Detalles del Pago</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      Método de pago:
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {paymentDetails.method === "efectivo" ? "Efectivo" : "PayPal"}
                    </span>
                  </div>

                  {/* Desglose de precios */}
                  <div className={`pt-2 border-t ${isDarkMode ? "border-neutral-700" : "border-neutral-300"}`}>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Subtotal original:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        ${originalSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                          Descuento aplicado:
                        </span>
                        <span className="text-green-500 font-medium">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-medium">
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        Total a pagar:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        ${ticketsTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {paymentDetails.method === "efectivo" && (
                    <div className={`pt-2 border-t ${isDarkMode ? "border-neutral-700" : "border-neutral-300"}`}>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                          Monto recibido:
                        </span>
                        <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                          ${paymentDetails.cashAmount?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                          Vuelto:
                        </span>
                        <span className={`text-sm font-medium text-green-600`}>
                          ${paymentDetails.change?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentDetails.method === "paypal" && paymentDetails.orderId && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        ID de orden PayPal:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {paymentDetails.orderId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mostrar información de los pasajes confirmados con desglose individual */}
            {tickets && tickets.length > 0 ? (
              <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    Pasajes Confirmados ({tickets.length})
                  </h3>
                  <span className={`text-sm px-3 py-1 rounded-full bg-green-100 text-green-800`}>✓ Confirmado</span>
                </div>

                <div className="space-y-4">
                  {tickets.map((ticket, index) => {
                    const originalPrice = getOriginalTicketPrice(ticket, index)
                    const ticketDiscount = getTicketDiscount(ticket, index)

                    return (
                      <div
                        key={ticket.id_pasaje || index}
                        className={`p-4 rounded-lg border-2 ${
                          isDarkMode ? "border-neutral-700 bg-neutral-900" : "border-neutral-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                                Pasaje #{ticket.id_pasaje}
                              </span>
                              <div className="flex flex-col items-end">
                                {ticketDiscount > 0 && (
                                  <span className="text-sm text-neutral-500 line-through">
                                    ${originalPrice.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-2xl font-bold text-orange-500">${ticket.precio}</span>
                                {ticketDiscount > 0 && (
                                  <span className="text-sm text-green-500 font-medium">
                                    Ahorro: ${ticketDiscount.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Información del viaje */}
                              <div className="space-y-2">
                                <h4
                                  className={`font-medium text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                                >
                                  RUTA
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                                    {ticket.viaje?.localidadOrigen?.nombreLocalidad || "N/A"}
                                  </span>
                                  <span className="text-orange-500">→</span>
                                  <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                                    {ticket.viaje?.localidadDestino?.nombreLocalidad || "N/A"}
                                  </span>
                                </div>
                                <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                                  {ticket.viaje?.localidadOrigen?.departamento?.nombreDepartamento} →{" "}
                                  {ticket.viaje?.localidadDestino?.departamento?.nombreDepartamento}
                                </p>
                              </div>

                              {/* Información de fechas y horarios */}
                              <div className="space-y-2">
                                <h4
                                  className={`font-medium text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                                >
                                  HORARIOS
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                                      Salida:
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}
                                    >
                                      {formatDate(ticket.viaje?.fecha_partida)} {formatTime(ticket.viaje?.hora_partida)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                                      Llegada:
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}
                                    >
                                      {formatDate(ticket.viaje?.fecha_llegada)} {formatTime(ticket.viaje?.hora_llegada)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Información del asiento */}
                              <div className="space-y-2">
                                <h4
                                  className={`font-medium text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                                >
                                  ASIENTO
                                </h4>
                                <div
                                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-orange-500 bg-orange-50`}
                                >
                                  <span className="font-bold text-orange-600 text-lg">
                                    {ticket.asiento?.numero_asiento || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              // Fallback  si no hay tickets confirmados
              <div
                className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
              >
                <div className="flex items-center">
                  <AlertCircle className={`h-5 w-5 mr-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? "text-yellow-400" : "text-yellow-800"}`}>
                      Procesando detalles de los pasajes
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                      Los detalles de los pasajes se están cargando. Si el problema persiste, contacte al administrador.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional de la venta */}
            <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
              <h3 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Información de la Venta
              </h3>

              <div className="space-y-2">
                {isSellerForm && customerData && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>Cliente:</span>
                    <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {customerData.nombres} {customerData.apellidos}
                    </span>
                  </div>
                )}

                {isSellerForm && sellerData && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>Vendedor:</span>
                    <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {sellerData.nombres} {sellerData.apellidos}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>Pasajeros:</span>
                  <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{passengers}</span>
                </div>

                {saleId && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      ID de venta:
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{saleId}</span>
                  </div>
                )}

                <div className="flex justify-between font-medium pt-2 border-t border-neutral-600">
                  <span className={isDarkMode ? "text-white" : "text-neutral-900"}>Total Pagado:</span>
                  <span className="text-orange-500 text-lg">${actualPaidAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isSellerForm ? "Nueva venta" : "Volver al inicio"}
              </Button>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleDownloadTickets}>
                <Download className="h-4 w-4 mr-2" />
                Descargar pasajes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
