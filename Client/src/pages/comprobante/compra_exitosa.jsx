import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Check, Download, ArrowLeft, Receipt, AlertCircle } from "lucide-react"
import { Button } from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useSaleConfirmation from "@/hooks/useSaleConfirmation"
import { generateAndDownloadPDF } from "@/lib/pdfGenerator"

/**
 * Página dedicada para mostrar comprobantes de pasajes
 * Maneja tanto pagos en efectivo como PayPal
 * URL: /comprobante-pasaje?id_venta=123&id_orden=456
 */
export default function ComprobantePasajePage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const location = useLocation()
  const navigate = useNavigate()
  const { confirmPayPalSaleTransaction } = useSaleConfirmation()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ticketData, setTicketData] = useState(null)
  const [confirmedTickets, setConfirmedTickets] = useState([])

  // Función para calcular el precio original de un ticket específico
  const getOriginalTicketPrice = useCallback((ticket, allTickets) => {
    // Si el ticket ya tiene originalPrice del backend, usarlo
    if (ticket.originalPrice && ticket.originalPrice > 0) {
      return ticket.originalPrice
    }

    // Si no, asumir que el precio actual es el original (sin descuento)
    return ticket.precio || 0
  }, [])

  // Función para calcular el descuento aplicado a un ticket específico
  const getTicketDiscount = useCallback(
    (ticket, allTickets) => {
      // Si el ticket ya tiene discountApplied del backend, usarlo
      if (ticket.discountApplied && ticket.discountApplied > 0) {
        return ticket.discountApplied
      }

      const originalPrice = getOriginalTicketPrice(ticket, allTickets)
      const finalPrice = ticket.precio || 0
      return Math.max(0, originalPrice - finalPrice)
    },
    [getOriginalTicketPrice],
  )

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(location.search)
        const id_venta = urlParams.get("id_venta")
        const token = urlParams.get("token")
        const id_orden = token

        if (id_venta && id_orden) {
          const confirmResult = await confirmPayPalSaleTransaction(id_venta, id_orden)
          if (confirmResult.success) {
            const ticketsData = confirmResult.data || []

            // Calcular originalPrice y discountApplied para cada ticket
            const processedTickets = ticketsData.map((ticket) => {
              const originalPrice = getOriginalTicketPrice(ticket, ticketsData)
              const discountApplied = getTicketDiscount(ticket, ticketsData)

              return {
                ...ticket,
                originalPrice,
                discountApplied: discountApplied > 0 ? discountApplied : 0, // Asegurar que el descuento no sea negativo
              }
            })

            setConfirmedTickets(processedTickets)

            // Calcular el subtotal original y el descuento total de la venta
            const originalSubtotal = processedTickets.reduce((sum, ticket) => sum + (ticket.originalPrice || 0), 0)
            const discountAmount = processedTickets.reduce((sum, ticket) => sum + (ticket.discountApplied || 0), 0)
            const totalAmountPaid = processedTickets.reduce((sum, ticket) => sum + (ticket.precio || 0), 0)

            // Crear datos del ticket para mostrar
            const ticketInfo = {
              saleId: id_venta,
              paypalOrderId: token,
              tickets: processedTickets, // Usar los tickets procesados
              paymentDetails: {
                method: "paypal",
                orderId: token,
                totalAmount: totalAmountPaid, // Monto final pagado
                originalSubtotal: originalSubtotal, // Subtotal antes de descuentos
                discountAmount: discountAmount, // Descuento total aplicado
              },
              customerData: confirmResult.data?.customerData,
              sellerData: confirmResult.data?.sellerData,
              // También añadir a nivel superior para consistencia con PaymentSuccess
              originalSubtotal: originalSubtotal,
              discountAmount: discountAmount,
              totalAmount: totalAmountPaid,
            }

            setTicketData(ticketInfo)
          } else {
            setError(`Error al confirmar el pago PayPal: ${confirmResult.error || confirmResult.message}`)
          }
        } else {
          setError("No se encontraron parámetros válidos en la URL")
        }
      } catch (err) {
        setError(`Error al procesar el comprobante: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [location.search, confirmPayPalSaleTransaction, getOriginalTicketPrice, getTicketDiscount])

  // Función para volver al home ,  si es del lado vendedor o compra online van al home.
  const handleGoBack = () => {
    navigate("/")
  }

  // Función para generar y descargar PDF
  const handleDownloadPDF = useCallback(() => {
    if (!ticketData || !ticketData.tickets || ticketData.tickets.length === 0) {
      alert("No hay pasajes para descargar")
      return
    }

    // Los tickets en ticketData.tickets ya tienen originalPrice y discountApplied
    // paymentDetails también tiene originalSubtotal y discountAmount
    const pdfData = {
      saleId: ticketData.saleId,
      tickets: ticketData.tickets,
      paymentDetails: ticketData.paymentDetails,
      customerData: ticketData.customerData,
      sellerData: ticketData.sellerData,
      totalAmount: ticketData.totalAmount, // Usar el totalAmount ya calculado
      originalSubtotal: ticketData.originalSubtotal,
      discountAmount: ticketData.discountAmount,
      generatedAt: new Date().toISOString(),
    }

    console.log("📄 Generando PDF con los siguientes datos:", pdfData)
    const success = generateAndDownloadPDF(
      pdfData,
      `comprobante_${ticketData?.saleId || "temp"}_${new Date().getTime()}.pdf`,
    )

    if (!success) {
      // Fallback al método anterior si falla el PDF
      const dataStr = JSON.stringify(pdfData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `comprobante_${ticketData?.saleId || "temp"}_${new Date().getTime()}.json`
      link.click()
      URL.revokeObjectURL(url)

      alert("Error generando PDF. Se descargó como JSON.")
    }
  }, [ticketData, confirmedTickets]) // Dependencias para useCallback

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      if (dateString.includes("/")) return dateString
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
      if (timeString.includes(":") && timeString.length <= 5) return timeString
      return timeString.substring(0, 5)
    } catch {
      return timeString
    }
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-neutral-900" : "bg-neutral-50"} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? "text-white" : "text-neutral-800"}`}>Procesando comprobante...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-neutral-900" : "bg-neutral-50"} flex items-center justify-center`}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            Error al cargar el comprobante
          </h2>
          <p className={`mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>{error}</p>
          <Button onClick={handleGoBack} className="bg-orange-500 hover:bg-orange-600 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const totalAmount = ticketData?.totalAmount || 0 // Usar el totalAmount ya calculado en ticketData

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-neutral-900" : "bg-neutral-50"} py-8`}>
      <div className="max-w-4xl mx-auto px-4">
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

              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                ¡Compra completada con éxito!
              </h1>

              <p className={`text-center mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                Su compra ha sido procesada correctamente. A continuación puede descargar sus pasajes.
              </p>

              {/* Información del pago */}
              {ticketData?.paymentDetails && (
                <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  <div className="flex items-center mb-3">
                    <Receipt className={`h-5 w-5 mr-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`} />
                    <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      Detalles del Pago
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Método de pago:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {ticketData.paymentDetails.method === "efectivo" ? "Efectivo" : "PayPal"}
                      </span>
                    </div>

                    {ticketData.paymentDetails.method === "paypal" && ticketData.paymentDetails.orderId && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                          ID de orden PayPal:
                        </span>
                        <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                          {ticketData.paymentDetails.orderId}
                        </span>
                      </div>
                    )}

                    {/* Desglose de precios */}
                    <div className={`pt-2 border-t ${isDarkMode ? "border-neutral-700" : "border-neutral-300"}`}>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                          Subtotal original:
                        </span>
                        <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                          ${ticketData.paymentDetails.originalSubtotal?.toFixed(2)}
                        </span>
                      </div>

                      {ticketData.paymentDetails.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                            Descuento aplicado:
                          </span>
                          <span className="text-green-500 font-medium">
                            -${ticketData.paymentDetails.discountAmount?.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-medium">
                        <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                          Total Pagado:
                        </span>
                        <span className="text-orange-500 text-lg">
                          ${ticketData.paymentDetails.totalAmount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar información de los pasajes confirmados */}
              {confirmedTickets && confirmedTickets.length > 0 ? (
                <div className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      Pasajes Confirmados ({confirmedTickets.length})
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full bg-green-100 text-green-800`}>✓ Confirmado</span>
                  </div>

                  <div className="space-y-4">
                    {confirmedTickets.map((ticket, index) => (
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
                                {ticket.discountApplied > 0 && (
                                  <span
                                    className={`text-sm line-through ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
                                  >
                                    ${ticket.originalPrice.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-2xl font-bold text-orange-500">${ticket.precio.toFixed(2)}</span>
                                {ticket.discountApplied > 0 && (
                                  <span className="text-xs text-green-600">
                                    Ahorro: ${ticket.discountApplied.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Información del viaje */}
                              <div className="space-y-2">
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-neutral-300" : "text-neutral-700"
                                  }`}
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
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-neutral-300" : "text-neutral-700"
                                  }`}
                                >
                                  HORARIOS
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                                      Salida:
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${
                                        isDarkMode ? "text-white" : "text-neutral-900"
                                      }`}
                                    >
                                      {formatDate(ticket.viaje?.fecha_partida)} {formatTime(ticket.viaje?.hora_partida)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                                      Llegada:
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${
                                        isDarkMode ? "text-white" : "text-neutral-900"
                                      }`}
                                    >
                                      {formatDate(ticket.viaje?.fecha_llegada)} {formatTime(ticket.viaje?.hora_llegada)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Información del asiento */}
                              <div className="space-y-2">
                                <h4
                                  className={`font-medium text-sm ${
                                    isDarkMode ? "text-neutral-300" : "text-neutral-700"
                                  }`}
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
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`w-full p-4 rounded-lg mb-6 ${
                    isDarkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
                  } border`}
                >
                  <div className="flex items-center">
                    <AlertCircle className={`h-5 w-5 mr-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? "text-yellow-400" : "text-yellow-800"}`}>
                        Procesando detalles de los pasajes
                      </h3>
                      <p className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                        Los detalles de los pasajes se están cargando. Si el problema persiste, contacte al
                        administrador.
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
                  {ticketData?.customerData && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Cliente:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {ticketData.customerData.nombres} {ticketData.customerData.apellidos}
                      </span>
                    </div>
                  )}

                  {ticketData?.sellerData && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Vendedor:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {ticketData.sellerData.nombres} {ticketData.sellerData.apellidos}
                      </span>
                    </div>
                  )}

                  {ticketData?.saleId && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        ID de venta:
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {ticketData.saleId}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium pt-2 border-t border-neutral-600">
                    <span className={isDarkMode ? "text-white" : "text-neutral-900"}>Total Pagado:</span>
                    <span className="text-orange-500 text-lg">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {ticketData?.isSellerForm ? "Nueva venta" : "Volver al inicio"}
                </Button>

                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar comprobante (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
