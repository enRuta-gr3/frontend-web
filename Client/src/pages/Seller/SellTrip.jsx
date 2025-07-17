import { useState } from "react"
import { SellerLayout } from "@/components"
import {
  SeatSelection,
  TripSearchForm,
  RenderSearchResult,
  PaymentSelect,
  SearchUserComponent,
  PaymentSuccess,
} from "@/components"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"
import useUser from "@/hooks/useUser"
import useSaleConfirmation from "@/hooks/useSaleConfirmation"
import { Button } from "@/components"
import usePayment from "@/hooks/usePayments"
import { urlRedir } from "@/config/paypal_config"
import { Loader2, CreditCard, DollarSign, ExternalLink, RefreshCw } from "lucide-react"

/**
 * Componente SellTrip
 *
 * Gestiona el flujo completo de venta de pasajes: verificación de cliente,
 * búsqueda de viajes, selección de asientos, pago y confirmación.
 * Soporta ventas de ida y vuelta, y maneja estados y validaciones.
 *
 * @returns {JSX.Element}
 */
export default function SellTrip() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const { user } = useAuthStore() // Datos del vendedor autenticado
  const { searchUserByCedula, loading: userLoading, error: userError, clearError: clearUserError } = useUser()
  // hook que maneja la confirmacion de la venta efectivo
  const { confirmSaleTransaction, loading: confirmLoading } = useSaleConfirmation()
  const { requestPaymentParameters, loading: paymentLoading } = usePayment()

  // Estados para el flujo de venta
  const [currentStep, setCurrentStep] = useState("customer") // customer, confirm-client, search-trip, results, seats, payment, success
  const [customer, setCustomer] = useState(null)
  const [cedula, setCedula] = useState("")
  const [cedulaError, setCedulaError] = useState("")
  const [searchParams, setSearchParams] = useState({
    tripType: "oneWay",
    origin: "",
    destination: "",
    date: "",
    returnDate: "",
    passengers: "",
  })

  const [searchResults, setSearchResults] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("cash") // cash, mercadopago
  const [saleId, setSaleId] = useState(null) // ID de la venta para confirmar
  const [confirmedTickets, setConfirmedTickets] = useState([]) // Pasajes confirmados

  // Estados para datos de pago
  const [paymentMethods, setPaymentMethods] = useState([])
  const [saleData, setSaleData] = useState(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState(null)

  // Estados de carga específicos para pagos
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentType, setPaymentType] = useState(null) // 'cash' | 'paypal'
  const [paypalWindowOpened, setPaypalWindowOpened] = useState(false)
  const [paypalPaymentData, setPaypalPaymentData] = useState(null)

  // Estado para viajes de ida y vuelta
  const [roundTripData, setRoundTripData] = useState({
    isRoundTrip: false,
    idaTrip: null,
    idaSeats: [],
    vueltaTrip: null,
    vueltaSeats: [],
  })

  // Datos del vendedor para pasar a los componentes
  const sellerData = {
    uuidAuth: user?.uuidAuth,
    nombres: user?.nombres || user?.name,
    apellidos: user?.apellidos || user?.lastName,
    ci: user?.ci || user?.cedula,
    email: user?.email,
  }

  // Función para verificar cliente por cédula
  const handleVerifyCustomer = async () => {
    // Validar formato de cédula
    if (!cedula || cedula.length < 6) {
      setCedulaError("Debe ingresar una cédula con formato válido.")
      return
    }

    clearUserError()
    setCedulaError("")
    // busco al cliente por cedula [si o si debe ser cliente]
    const result = await searchUserByCedula(cedula, "CLIENTE")
    
    if (result.success) {
      setCustomer(result.data)
      setCurrentStep("confirm-client")
    } else {
      setCedulaError(result.error || "La cédula no existe.")
    }
  }

  // Función para registrar un nuevo cliente
  const handleRegisterCustomer = () => {
    window.location.href = "/enruta/vendedor/usuarios"
  }

  // Función para manejar la selección de asientos completada
  const handleSeatSelectionComplete = (seatData) => {
    if (searchParams.tripType === "roundTrip" && !roundTripData.idaSeats.length) {
      // Asientos del viaje de ida
      setRoundTripData((prev) => ({
        ...prev,
        idaTrip: selectedTrip,
        idaSeats: seatData.selectedSeats,
      }))

      // Invertir origen y destino para la búsqueda de vuelta
      setSearchParams({
        ...searchParams,
        origin: searchParams.destination,
        destination: searchParams.origin,
        date: searchParams.returnDate,
      })

      setSelectedTrip(null)
      setSelectedSeats([])
      setCurrentStep("results")
      return
    }

    if (searchParams.tripType === "roundTrip" && roundTripData.idaSeats.length) {
      // Asientos del viaje de vuelta - ir directo a pago
      setRoundTripData((prev) => ({
        ...prev,
        vueltaTrip: selectedTrip,
        vueltaSeats: seatData.selectedSeats,
      }))

      // Configurar datos para pago de ida y vuelta
      setPaymentMethods(seatData.paymentMethods || [])
      setSaleData(seatData.ventaCalculada)
      setTotalAmount(
        (roundTripData.idaTrip?.price || 0) * Number.parseInt(searchParams.passengers) +
          (selectedTrip?.price || 0) * Number.parseInt(searchParams.passengers),
      )
      setCurrentStep("payment")
      return
    }

    // Solo ida - ir a pago
    setSelectedSeats(seatData.selectedSeats)
    setPaymentMethods(seatData.paymentMethods || [])
    setSaleData(seatData.ventaCalculada)
    setTotalAmount((
      selectedTrip?.price || 0) * Number.parseInt(searchParams.passengers))
    setCurrentStep("payment")
  }

  // Función para cancelar la selección
  const handleCancelSelection = () => {
    if (currentStep === "seats" && searchParams.tripType === "roundTrip" && !roundTripData.idaSeats.length) {
      setSelectedTrip(null)
      setCurrentStep("results")
      return
    }

    if (currentStep === "seats" && searchParams.tripType === "roundTrip" && roundTripData.idaSeats.length) {
      setSelectedTrip(null)
      setCurrentStep("results")
      return
    }

    if (currentStep === "payment") {
      setCurrentStep("seats")
      return
    }

    setCurrentStep("results")
    setSelectedTrip(null)
    setSelectedSeats([])
  }

  // Función para manejar la selección de método de pago
  const handlePaymentSelection = async (paymentData) => {
    console.log("💳 [SellTrip] Método de pago seleccionado:", paymentData)
    setPaymentMethod(paymentData.paymentMethod.nombre)

    // Iniciar estado de carga
    setPaymentProcessing(true)
    const methodName = paymentData.paymentMethod.nombre.toLowerCase()
    setPaymentType(methodName.includes("efectivo") ? "cash" : "paypal")

    try {
      // Validar que tenemos los datos necesarios
      if (!customer?.uuidAuth) {
        throw new Error("No se encontró uuidAuth del cliente")
      }

      // Preparar datos para solicitar parámetros de pago
      const paymentRequestData = {
        pago: {
          medio_de_pago: {
            id_medio_de_pago: paymentData.paymentMethod.id_medio_de_pago,
            nombre: paymentData.paymentMethod.nombre,

          },
          ...(paymentData.paymentMethod.nombre.toLowerCase().includes("paypal") && { urlRedir: urlRedir }),
        },
        pasajes: [], // Inicializar array vacío
        vendedor: {
          uuidAuth: user.uuidAuth, // uuidAuth vendedor
        }
      }

      // Construir array de pasajes según el tipo de viaje
      if (searchParams.tripType === "roundTrip") {
        // Viaje de ida y vuelta
        if (!roundTripData.idaTrip?.id || !roundTripData.vueltaTrip?.id) {
          throw new Error("Faltan datos de los viajes de ida y vuelta")
        }

        // Agregar viaje de ida
        paymentRequestData.pasajes.push({
          uuidAuth: customer.uuidAuth,
          viaje: {
            id_viaje: roundTripData.idaTrip.id,
            cantidad: Number.parseInt(searchParams.passengers),
          },
        })

        // Agregar viaje de vuelta
        paymentRequestData.pasajes.push({
          uuidAuth: customer.uuidAuth,
          viaje: {
            id_viaje: roundTripData.vueltaTrip.id,
            cantidad: Number.parseInt(searchParams.passengers),
          },
        })
      } else {
        // Solo ida
        if (!selectedTrip?.id) {
          throw new Error("Falta id_viaje del viaje seleccionado")
        }

        paymentRequestData.pasajes.push({
          uuidAuth: customer.uuidAuth,
          viaje: {
            id_viaje: selectedTrip.id,
            cantidad: Number.parseInt(searchParams.passengers),
          },
        })
      }

      console.log("🔄 [SellTrip] Solicitando parámetros de pago:", JSON.stringify(paymentRequestData, null, 2))

      // Solicitar parámetros de pago
      const paymentParams = await requestPaymentParameters(paymentRequestData)

      console.log("✅ [SellTrip] Parámetros de pago recibidos:", paymentParams)

      if (paymentParams.success) {
        const paymentMethodName = paymentData.paymentMethod.nombre.toLowerCase()

        if (paymentMethodName.includes("efectivo")) {
          // PAGO EN EFECTIVO - Confirmar venta inmediatamente y mostrar success
          console.log("💰 [SellTrip] Procesando pago en efectivo")

          // Validar que el monto recibido sea suficiente
          if (paymentData.cashAmount < totalAmount) {
            alert("El monto recibido es insuficiente")
            setPaymentProcessing(false)
            return
          }

          // Confirmar la venta para pago en efectivo
          const confirmResult = await confirmSaleTransaction(paymentParams.data.id_venta, "APROBADA")
          console.log(`Resultado de la confirmacion: `, JSON.stringify(confirmResult, null, 2))

          if (confirmResult.success) {
            // Guardar datos para mostrar en PaymentSuccess
            setConfirmedTickets(confirmResult.data || [])
            setSaleId(paymentParams.data.id_venta)
            setPaymentDetails({
              method: "efectivo",
              cashAmount: paymentData.cashAmount,
              change: paymentData.change,
              totalAmount: totalAmount,
            })

            // Pequeña pausa para mostrar el éxito del procesamiento
            setTimeout(() => {
              setPaymentProcessing(false)
              setCurrentStep("success")
            }, 1000)
          } else {
            setPaymentProcessing(false)
            alert(`Error al confirmar la venta: ${confirmResult.message}`)
          }
        } else if (paymentMethodName.includes("paypal")) {
          // PAGO CON PAYPAL - Abrir en nueva pestaña
          console.log("🌐 [SellTrip] Abriendo PayPal en nueva pestaña")

          if (paymentParams.data.urlPago && paymentParams.data.id_orden) {
            // Guardar datos de PayPal para el estado de carga
            setPaypalPaymentData({
              saleId: paymentParams.data.id_venta,
              orderId: paymentParams.data.id_orden,
              urlPago: paymentParams.data.urlPago,
            })

            // Abrir PayPal en nueva pestaña
            const paypalWindow = window.open(paymentParams.data.urlPago, "_blank")
            setPaypalWindowOpened(true)

            // Verificar si la ventana se abrió correctamente
            if (!paypalWindow) {
              setPaymentProcessing(false)
              alert("No se pudo abrir PayPal. Por favor, permita ventanas emergentes y vuelva a intentar.")
              return
            }

            console.log(`🌐 [SellTrip] PayPal abierto en nueva pestaña`)
          } else {
            setPaymentProcessing(false)
            alert("Error: No se recibió la URL de pago o ID de orden de PayPal")
          }
        } else {
          // Otros métodos de pago
          setPaymentProcessing(false)
          alert("Método de pago no implementado aún")
        }
      } else {
        setPaymentProcessing(false)
        alert(`Error al solicitar parámetros de pago: ${paymentParams.message}`)
      }
    } catch (error) {
      console.error("❌ [SellTrip] Error en el proceso de pago:", error)
      setPaymentProcessing(false)
      alert(`Error en el proceso de pago: ${error.message}`)
    }
  }

  // Función para cancelar el pago
  const handlePaymentCancel = () => {
    setCurrentStep("seats")
  }

  // Función para nueva venta (después de PayPal)
  const handleNewSale = () => {
    handleStartOver()
  }

  // Función para volver al inicio
  const handleStartOver = () => {
    setCurrentStep("customer")
    setCustomer(null)
    setCedula("")
    setCedulaError("")
    setSaleId(null)
    setConfirmedTickets([])
    setPaymentMethods([])
    setSaleData(null)
    setTotalAmount(0)
    setPaymentDetails(null)
    setPaymentProcessing(false)
    setPaymentType(null)
    setPaypalWindowOpened(false)
    setPaypalPaymentData(null)
    setSearchParams({
      tripType: "oneWay",
      origin: "",
      destination: "",
      date: "",
      returnDate: "",
      passengers: "1",
    })
    setSearchResults([])
    setSelectedTrip(null)
    setSelectedSeats([])
    setRoundTripData({
      isRoundTrip: false,
      idaTrip: null,
      idaSeats: [],
      vueltaTrip: null,
      vueltaSeats: [],
    })
  }

  // Componente de carga para pagos
  const PaymentLoadingOverlay = () => {
    if (!paymentProcessing) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`rounded-lg p-8 max-w-md mx-4 ${
            isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
          } border shadow-xl`}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {paymentType === "cash" ? (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              )}
            </div>

            {!paypalWindowOpened ? (
              <div className="flex justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : null}

            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              {paymentType === "cash"
                ? "Procesando pago en efectivo..."
                : paypalWindowOpened
                  ? "Esperando confirmación de PayPal..."
                  : "Preparando pago con PayPal..."}
            </h3>

            <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"} mb-4`}>
              {paymentType === "cash"
                ? "Confirmando la transacción y generando los pasajes."
                : paypalWindowOpened
                  ? "Complete el pago en la ventana de PayPal que se abrió. Una vez confirmado, podrá continuar aquí."
                  : "Configurando el pago seguro con PayPal. Se abrirá en una nueva pestaña."}
            </p>

            {paymentType === "paypal" && paypalWindowOpened && (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg ${isDarkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <ExternalLink className={`h-4 w-4 mr-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                      PayPal abierto en nueva pestaña
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                    ID de venta: {paypalPaymentData?.saleId}
                  </p>
                </div>

                <Button onClick={handleNewSale} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nueva venta
                </Button>

                <p className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                  Puede iniciar una nueva venta mientras el cliente completa el pago en PayPal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto">
  
        {/* Overlay de carga para pagos */}
        <PaymentLoadingOverlay />

        {/* Paso 1: Verificación de cliente */}
        {currentStep === "customer" && (
          <SearchUserComponent
            cedula={cedula}
            setCedulaError={setCedulaError}
            cedulaError={cedulaError || userError}
            isDarkMode={isDarkMode}
            handleVerifyCustomer={handleVerifyCustomer}
            loading={userLoading}
            setCedula={setCedula}
            handleRegisterCustomer={handleRegisterCustomer}
          />
        )}

        {/* Paso 2: Confirmación de cliente */}
        {currentStep === "confirm-client" && customer && (
          <div className="max-w-md mx-auto">
            <div
              className={`rounded-lg overflow-hidden border shadow-sm ${
                isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
              }`}
            >
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  Datos del cliente
                </h2>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Nombre</p>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {customer.nombres} {customer.apellidos}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Email</p>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{customer.email}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Cédula</p>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{customer.ci}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Descuento</p>
                    {/* no se esta mostrando correctamente el tipo de descuento */}
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {customer.tipoDescuentoCliente}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCedula("")
                      setCustomer(null)
                      setCurrentStep("customer")
                    }}
                    className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setCurrentStep("search-trip")}
                  >
                    Aceptar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Búsqueda de viajes */}
        {currentStep === "search-trip" && (
          <TripSearchForm
            onSubmit={(formData) => {
              const mappedParams = {
                origin: formData.origin,
                destination: formData.destination,
                date: formData.date,
                returnDate: formData.returnDate,
                passengers: formData.passengers,
                tripType: formData.returnDate ? "roundTrip" : "oneWay",
              }
              setSearchParams(mappedParams)
              setCurrentStep("results")
            }}
            isSellerForm={true}
          />
        )}

        {/* Paso 4: Resultados de búsqueda */}
        {currentStep === "results" && (
          <RenderSearchResult
            isSellerForm={true}
            externalSearchParam={searchParams}
            customerData={customer}
            sellerData={sellerData}
          />
        )}
        

        {/*  Se elimino redundancias en compra de pasaje por mostrador*/}

      </div>
    </SellerLayout>
  )
}

