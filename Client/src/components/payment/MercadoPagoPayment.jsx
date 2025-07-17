import { useState } from "react"
import { CreditCard, AlertCircle, Check, ArrowLeft } from "lucide-react"
import { Button, Card, CardContent } from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore" // Importamos el store de autenticación
import paypal_pago from "@/assets/paypal_logo.webp"
import {initialOptions} from "@/config/paypal_config.js"

//importamos el sdk paypal
import {PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"






export default function MercadoPagoPayment({
  trip,
  passengers,
  selectedSeats,
  onComplete,
  onCancel,
  totalAmount,
  roundTrip = false,
  tipoDescuento,
  montoDescuento,
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // null, 'success', 'rejected', 'cancelled'

  // Obtener información del usuario autenticado
  const user = useAuthStore((state) => state.user)

 
  const calculatePrice = () => {
    // Si es un viaje de ida y vuelta, usar el totalAmount proporcionado
    if (roundTrip && totalAmount) {
      return totalAmount
    }

    // Para viajes de solo ida
    if (!roundTrip) {
      // Si trip es un objeto simple (viaje de solo ida)
      if (trip && trip.price) {
        return trip.price * passengers
      }

      // Si trip está dentro de una estructura con ida/vuelta
      if (trip && trip.ida && trip.ida.price) {
        return trip.ida.price * passengers
      }
    }
   
    return 0 // Valor por defecto si no hay datos de precio
  }

  // Calcula el precio final
  const finalPrice = calculatePrice()

  const handleAccept = () => {
    setIsRedirecting(true)

    // Simulación de redirección a Mercado Pago
    setTimeout(() => {
      // Simulación de respuesta de Mercado Pago (éxito, rechazo o cancelación)
      const outcomes = ["success", "rejected", "cancelled"]
      const result = outcomes[Math.floor(Math.random() * outcomes.length)]

      setIsRedirecting(false)
      setPaymentStatus(result)

      if (result === "success") {
        // Si el pago fue exitoso, continuar al siguiente paso
        setTimeout(() => {
          onComplete(result)
        }, 2000)
      }
    }, 2000)
  }

  const handleRetry = () => {
    setPaymentStatus(null)
  }

  // Verificar que tenemos los datos necesarios para mostrar el componente
  const hasValidData = roundTrip ? trip?.ida && selectedSeats?.ida : trip && selectedSeats

  if (!hasValidData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Error en los datos del viaje
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                No se pudieron cargar los detalles del viaje. Por favor, intente nuevamente.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onCancel}>
                Volver a la búsqueda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"} mb-2`}>
          Pago con Paypal
        </h2>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
          Complete el pago de su compra de manera segura
        </p>
      </div>

      <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
        <CardContent className="p-6">
          {paymentStatus === null ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className={`p-4 rounded-full ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  <img src={paypal_pago} className={`h-10 w-10 ${isDarkMode ? "text-white" : "text-neutral-800"}`} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                  Será redirigido a Paypal
                </h3>
                <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                  Para completar su compra, será redirigido a la plataforma segura de Paypal.
                </p>
              </div>

              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                {/* Si es ida y vuelta, mostrar ambos viajes */}
                {roundTrip ? (
                  <>
                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                        Viaje de ida:
                      </h4>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {trip.ida?.origin} → {trip.ida?.destination}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {trip.ida?.departureDate}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {Array.isArray(selectedSeats.ida)
                            ? selectedSeats.ida.map((s) => s.number).join(", ")
                            : "No seleccionados"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Precio:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          ${trip.ida?.price} × {passengers} = ${(trip.ida?.price || 0) * passengers}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                        Viaje de vuelta:
                      </h4>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Ruta:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {trip.vuelta?.origin} → {trip.vuelta?.destination}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {trip.vuelta?.departureDate}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          {Array.isArray(selectedSeats.vuelta)
                            ? selectedSeats.vuelta.map((s) => s.number).join(", ")
                            : "No seleccionados"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Precio:</span>
                        <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                          ${trip.vuelta?.price} × {passengers} = ${(trip.vuelta?.price || 0) * passengers}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Viaje:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {trip.origin
                          ? `${trip.origin} → ${trip.destination}`
                          : `${trip.ida?.origin} → ${trip.ida?.destination}`}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Fecha:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {trip.departureDate || trip.ida?.departureDate}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Pasajeros:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>{passengers}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Asientos:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        {Array.isArray(selectedSeats)
                          ? selectedSeats.map((s) => s.number).join(", ")
                          : Array.isArray(selectedSeats.ida)
                            ? selectedSeats.ida.map((s) => s.number).join(", ")
                            : "No seleccionados"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>Precio por pasaje:</span>
                      <span className={isDarkMode ? "text-white" : "text-neutral-800"}>
                        ${trip.price || trip.ida?.price}
                      </span>
                    </div>
                  </>
                )}
                {tipoDescuento && (
                    <div className="mb-4 p-4 rounded-lg border border-green-300 bg-green-50 text-green-700">
                      <p className="text-sm font-medium">
                        🎓 Descuento aplicado: <strong>{tipoDescuento}</strong>
                      </p>
                      <p className="text-sm">
                        Ahorro: <strong>${Number(montoDescuento).toFixed(2)}</strong>
                      </p>
                    </div>
                  )}
                <div className="flex justify-between pt-2 mt-2 border-t border-neutral-700">
                  <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                    Total a pagar:
                  </span>
                  <span className="font-medium text-orange-500">${finalPrice}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className={`flex-1 ${
                    isDarkMode
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }`}
                  onClick={onCancel}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <div className="flex-1 flex items-center justify-center">
                  {/* luego que funcione refactorizarlo en un PayPalButtonComponent */}
                  <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                      style={{ layout: "horizontal", color: "blue", shape: "rect", label: "paypal" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: totalAmount?.toFixed(2) || "0.00",
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                          console.log("✅ Pago aprobado por " + details.payer.name.given_name);
                          setPaymentStatus("success");
                          setTimeout(() => {
                           onComplete("success");
                          }, 2000);
                        });
                      }}
                      onCancel={() => {
                        console.log("⚠️ Pago cancelado");
                        setPaymentStatus("cancelled");
                      }}
                      onError={(err) => {
                        console.error("❌ Error en PayPal:", err);
                        setPaymentStatus("rejected");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            </>
          ) : paymentStatus === "success" ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                ¡Pago completado con éxito!
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                Su compra ha sido procesada correctamente. Se ha enviado un correo con los detalles de su compra.
              </p>
            </div>
          ) : paymentStatus === "rejected" ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Pago rechazado
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                Su pago ha sido rechazado por PayPal. Por favor, intente nuevamente.
              </p>
              <div className="flex justify-center">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleRetry}>
                  Intentar nuevamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Pago cancelado
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                Ha cancelado el proceso de pago. Puede intentar nuevamente cuando lo desee.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  className={
                    isDarkMode
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }
                  onClick={onCancel}
                >
                  Volver a la búsqueda
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleRetry}>
                  Intentar nuevamente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
