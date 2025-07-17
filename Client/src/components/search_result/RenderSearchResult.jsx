import { useState, useEffect, useMemo, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom" // Importar useNavigate
import { TripCard, Pagination, SeatSelection, MercadoPagoPayment, PaymentSuccess, PaymentSelect } from "@/components"
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CreditCard,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Home,
  Search,
} from "lucide-react"
import useThemeStore from "@/store/useThemeStore"
import useAuthStore from "@/store/useAuthStore"
import usePendingTripStore from "@/store/usePendingTripStore"
import usePayment from "@/hooks/usePayments"
import useSaleConfirmation from "@/hooks/useSaleConfirmation"
import useTrips from "@/hooks/useTrips"
import useSale from "@/hooks/useSale"
import { urlRedir } from "@/config/paypal_config"
import { Button } from "@/components"

const RenderSearchResult = ({
  isSellerForm = false,
  externalSearchParam = null,
  customerData = null,
  sellerData = null,
}) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const location = useLocation() // Obtener el objeto location
  const navigate = useNavigate() // Obtener la función navigate

  // estado de autenticacion del usuario
  const usuario = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Hook para calcular venta
  const { saleCalculate } = useSale()

  // Determinar customerData según el contexto
  const effectiveCustomerData = useMemo(() => {
    if (isSellerForm) {
      return customerData
    } else {
      return usuario
    }
  }, [isSellerForm, customerData, usuario])

  // Determinamos el initial Params según si es por external lado vendedr o por URL en caso compra online (cliente) 
  const getInitialSearchParams = useCallback(() => {
    if (isSellerForm) {
      return externalSearchParam
    }
    return new URLSearchParams(location.search)
  }, [isSellerForm, externalSearchParam, location.search])

  const [searchParams, setSearchParams] = useState(getInitialSearchParams)

  const [trips, setTrips] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Agrego estos estados para el flujo de compra
  const [currentStep, setCurrentStep] = useState("search")
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])

  // agrego estado para la venta calculado
  const [saleCalculated, setSaleCalculated] = useState(null)

  // Estado para los métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)

  // Estado para el ID de venta y orden de PayPal
  const [saleId, setSaleId] = useState(null)
  const [paypalOrderId, setPaypalOrderId] = useState(null)
  const [confirmedTickets, setConfirmedTickets] = useState([])
  const [paymentDetails, setPaymentDetails] = useState(null)

  // Estados de carga específicos para pagos
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentType, setPaymentType] = useState(null)
  const [paypalWindowOpened, setPaypalWindowOpened] = useState(false)
  const [paypalPaymentData, setPaypalPaymentData] = useState(null)

  // viaje pendiente
  const { hasPendingTrip, resolvePendingTrip, isPendingTripValid, clearPendingTrip } = usePendingTripStore()

  // Hook de pagos y confirmación de venta
  const { requestPaymentParameters, getPaymentMethods } = usePayment()
  const { confirmSaleTransaction } = useSaleConfirmation()

  // Sincronizar searchParams con la URL o externalSearchParam
  useEffect(() => {
    if (isSellerForm) {
      setSearchParams(externalSearchParam)
    } else {
      setSearchParams(new URLSearchParams(location.search))
    }

    // Listener para el historial del navegador (botones atrás/adelante)
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search))
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isSellerForm, externalSearchParam, location.search]) // Depende de location.search para re-sincronizar

  const getParam = useCallback(
    (param) => {
      if (isSellerForm) {
        return searchParams[param] || ""
      }
      return searchParams.get(param) || ""
    },
    [isSellerForm, searchParams],
  )

  const origin = getParam("origin")
  const destination = getParam("destination")
  const date = getParam("date")
  const passengers = getParam("passengers") || "1"
  const returnDate = getParam("returnDate")
  const tripType = getParam("tripType") || (returnDate ? "roundTrip" : "oneWay")

  // pensar como integrar los viajes de ida y vuelta
  const [roundTripData, setRoundTripData] = useState({
    isRoundTrip: tripType === "roundTrip",
    step: "ida",
    idaTrip: null,
    idaSeats: [],
    vueltaTrip: null,
    vueltaSeats: [],
    isFinishStep: false,
  })


  const currentSearchCriteria = useMemo(() => {
    

    const isRoundTripFromParams = !!returnDate

   
    const effectiveOriginForHook = origin
    const effectiveDestinationForHook = destination
    let effectiveDateForHook = date
    const effectivePassengersForHook = passengers

    if (isRoundTripFromParams && currentStep === "search_vuelta") {
      effectiveDateForHook = returnDate
    }

    
    const displayOriginForUI = origin
    const displayDestinationForUI = destination
    let displayDateForUI = date
    const displayPassengersForUI = passengers

    if (isRoundTripFromParams && currentStep === "search_vuelta") {
      displayDateForUI = returnDate
    }

    return {
      origin: effectiveOriginForHook,
      destination: effectiveDestinationForHook,
      date: effectiveDateForHook,
      passengers: effectivePassengersForHook,
      displayOrigin: displayOriginForUI,
      displayDestination: displayDestinationForUI,
      displayDate: displayDateForUI,
      displayReturnDate: returnDate, 
      displayPassengers: displayPassengersForUI,
      isRoundTrip: isRoundTripFromParams,
      initialOrigin: origin, 
      initialDestination: destination,
      initialDate: date,
      initialReturnDate: returnDate,
    }
  }, [currentStep, origin, destination, date, passengers, returnDate])

  // Actualizar roundTripData.isRoundTrip al cargar el componente o cambiar la URL
  useEffect(() => {
    setRoundTripData((prev) => ({
      ...prev,
      isRoundTrip: currentSearchCriteria.isRoundTrip,
    }))
  }, [currentSearchCriteria.isRoundTrip])

  // Destructurar para usar en la UI y en el hook de viajes
  const {
    origin: searchOriginForHook,
    destination: searchDestinationForHook,
    date: searchDateForHook,
    passengers: searchPassengersForHook,
    displayOrigin,
    displayDestination,
    displayDate,
    displayReturnDate,
    displayPassengers,
    isRoundTrip,
    initialOrigin,
    initialDestination,
    initialReturnDate,
  } = currentSearchCriteria

  // verificar si hay viaje pendiente
  useEffect(() => {
    if (isAuthenticated && hasPendingTrip && isPendingTripValid()) {
      const { trip, data } = resolvePendingTrip()

      if (trip && data?.action === "selectSeats") {
        setSelectedTrip(trip)

        if (data.returnDate) {
          setRoundTripData((prev) => ({
            ...prev,
            isRoundTrip: true,
            idaTrip: trip,
          }))
        }
        setCurrentPage("seat_ida")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (isAuthenticated && hasPendingTrip && !isPendingTripValid()) {
        clearPendingTrip()
        setTimeout(() => {
          window.location.href = "/"
        }, 5000)
      }
    }
  }, [isAuthenticated, hasPendingTrip, isPendingTripValid, resolvePendingTrip, clearPendingTrip])

  // Usar el hook de viajes
  const { trips: allTrips, loading, searchTrips } = useTrips()

  useEffect(() => {
    if (searchOriginForHook && searchDestinationForHook && searchDateForHook) {
      setError("")

      const searchParamsForHook = {
        origin: searchOriginForHook,
        destination: searchDestinationForHook,
        date: searchDateForHook,
        passengers: searchPassengersForHook,
      }

      console.log("DEBUG: searchParamsForHook for useTrips:", searchParamsForHook) // Debug log
      const filteredTrips = searchTrips(searchParamsForHook)

      setTrips(filteredTrips)
      setTotalPages(Math.ceil(filteredTrips.length / 10))

      if (filteredTrips.length === 0 && !loading) {
        const fecha = currentSearchCriteria.date
        const errorMsg =
          currentStep === "search_vuelta"
            ? `No hay viajes de vuelta disponibles para la fecha seleccionada (${fecha}). Intenta con otra fecha.`
            : `No hay viajes disponibles para esta búsqueda. Intenta con otras fechas o destinos.`
        setError(errorMsg)
      }
    } else {
      setError("Por favor, completa todos los campos de búsqueda")
    }
  }, [
    currentSearchCriteria,
    currentStep,
    searchTrips,
    loading,
    searchOriginForHook,
    searchDestinationForHook,
    searchDateForHook,
    searchPassengersForHook,
  ])

  // Paginación
  const tripsPerPage = 10
  const indexOfLastTrip = currentPage * tripsPerPage
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Manejadores para el flujo de compra
  const handleSelectTrip = (trip) => {
    console.log("VIAJE SELECCIONADO :", trip)
    if (isRoundTrip && !roundTripData.idaTrip) {
      setRoundTripData((prev) => ({
        ...prev,
        idaTrip: trip,
      }))
      setSelectedTrip(trip)
      setCurrentStep("seats_ida")
      return
    }
    if (isRoundTrip && roundTripData.idaTrip && !roundTripData.vueltaTrip) {
      setRoundTripData((prev) => ({
        ...prev,
        vueltaTrip: trip,
      }))
      setSelectedTrip(trip)
      setCurrentStep("seats_vuelta")
      return
    }
    // Solo ida
    console.log("Viaje seleccionado: ", JSON.stringify(trip, null, 2))
    setSelectedTrip(trip)
    setCurrentStep("seats_ida")
  }

  // Manejar completar selección de asientos
  const handleSeatSelectionComplete = async ({ selectedSeats: seats, ventaCalculada, paymentMethods }) => {
    if (isRoundTrip && !roundTripData.idaSeats.length && !roundTripData.vueltaTrip) {
      // PRIMER PASO IDA-VUELTA: Guardar asientos de ida y continuar a búsqueda de vuelta
      setRoundTripData((prev) => ({
        ...prev,
        idaSeats: seats,
      }))
      setSelectedSeats([])
      setSelectedTrip(null)
      setSaleCalculated(null) // NO guardar venta calculada aún

      // Construir los nuevos parámetros de búsqueda para la vuelta
      if (!isSellerForm) {
        // Si es compra online, actualizar la URL para que el useEffect se actualize
        const newSearchParams = new URLSearchParams({
          origin: initialDestination, // El destino original se convierte en el nuevo origen
          destination: initialOrigin, // El origen original se convierte en el nuevo destino
          date: initialReturnDate,
          passengers: String(searchPassengersForHook), 
          tripType: "roundTrip",
          returnDate: initialReturnDate,
        }).toString()

        navigate({ search: newSearchParams })
      } else {
        // Si es lado vendedor, actualizar el estado interno con un objeto plano
        const newSearchParamsObject = {
          origin: initialDestination, // El destino original se convierte en el nuevo origen
          destination: initialOrigin, // El origen original se convierte en el nuevo destino
          date: initialReturnDate,
          passengers: String(searchPassengersForHook), 
          tripType: "roundTrip",
          returnDate: initialReturnDate,
        }

        setSearchParams(newSearchParamsObject) 
      }

      setCurrentStep("search_vuelta")
      return
    }

    if (isRoundTrip && roundTripData.idaSeats.length && roundTripData.vueltaTrip && !roundTripData.vueltaSeats.length) {
      // SEGUNDO PASO IDA-VUELTA: Guardar asientos de vuelta y calcular venta completa
      

      setRoundTripData((prev) => ({
        ...prev,
        vueltaSeats: seats,
      }))

      // CALCULAR VENTA PARA AMBOS VIAJES
      try {
        const userUuid = isSellerForm ? customerData?.uuidAuth : usuario?.uuidAuth
        const rawData = [
          {
            uuidAuth: userUuid,
            id_viaje: roundTripData.idaTrip.id,
            cantidad: Number.parseInt(searchPassengersForHook),
          },
          {
            uuidAuth: userUuid,
            id_viaje: roundTripData.vueltaTrip.id,
            cantidad: Number.parseInt(searchPassengersForHook),
          },
        ]

     
        const ventaCalculadaCompleta = await saleCalculate(rawData)
       
        // OBTENER MÉTODOS DE PAGO
        let paymentData = {}
        if (isSellerForm) {
          paymentData = {
            vendedor: { uuidAuth: sellerData?.uuidAuth || "" },
            cliente: { uuidAuth: customerData?.uuidAuth || "" },
          }
        } else {
          paymentData = {
            cliente: { uuidAuth: usuario.uuidAuth || "" },
          }
        }

        const paymentMethodsResponse = await getPaymentMethods(isSellerForm, paymentData)

        setSaleCalculated(ventaCalculadaCompleta)
        setPaymentMethods(paymentMethodsResponse.data || [])
        setSelectedSeats([])
        setSelectedTrip(null)
        setCurrentStep("payment-select")
      } catch (error) {
        console.error("Error: ", error)
      }
      return
    }

    // VIAJE SOLO IDA: Usar datos recibidos directamente
    setSelectedSeats(seats)
    setSaleCalculated(ventaCalculada)
    setPaymentMethods(paymentMethods || [])
    setCurrentStep("payment-select")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Agregar función para manejar la selección del método de pago
  const handlePaymentMethodSelect = async (paymentData) => {
    setSelectedPaymentMethod(paymentData)

    // Iniciar estado de carga
    setPaymentProcessing(true)
    const methodName = paymentData.paymentMethod.nombre.toLowerCase()
    setPaymentType(methodName.includes("efectivo") ? "cash" : "paypal")

    try {
      // Preparar datos para solicitar parámetros de pago
      const paymentRequestData = {
        pago: {
          medio_de_pago: {
            id_medio_de_pago: paymentData.paymentMethod.id_medio_de_pago,
            nombre: paymentData.paymentMethod.nombre,
          },
          ...(paymentData.paymentMethod.nombre.toLowerCase().includes("paypal") && { urlRedir: urlRedir }),
        },
        ...(isSellerForm && { vendedor: { uuidAuth: sellerData?.uuidAuth } }),
        pasajes: [],
      }

      // Construir array de pasajes según el tipo de viaje
      if (isRoundTrip) {
        // Viaje de ida y vuelta
        paymentRequestData.pasajes.push({
          uuidAuth: effectiveCustomerData?.uuidAuth,
          viaje: {
            id_viaje: roundTripData.idaTrip.id,
            cantidad: Number.parseInt(searchPassengersForHook),
          },
        })

        paymentRequestData.pasajes.push({
          uuidAuth: effectiveCustomerData?.uuidAuth,
          viaje: {
            id_viaje: roundTripData.vueltaTrip.id,
            cantidad: Number.parseInt(searchPassengersForHook),
          },
        })
      } else {
        // Solo ida
        paymentRequestData.pasajes.push({
          uuidAuth: effectiveCustomerData?.uuidAuth,
          viaje: {
            id_viaje: selectedTrip.id,
            cantidad: Number.parseInt(searchPassengersForHook),
          },
        })
      }


      const paymentParams = await requestPaymentParameters(paymentRequestData)
      

      if (paymentParams.success) {
        const paymentMethodName = paymentData.paymentMethod.nombre.toLowerCase()

        if (paymentMethodName.includes("efectivo") && isSellerForm) {
          // PAGO EN EFECTIVO (solo disponible en panel vendedor)
      
          // Validar que el monto recibido sea suficiente
          const totalAmount = saleCalculated?.montoTotal - (saleCalculated?.montoDescuento || 0)

          if (paymentData.cashAmount < totalAmount) {
            setPaymentProcessing(false)
            return
          }

          // Confirmar la venta para pago en efectivo
          const confirmResult = await confirmSaleTransaction(paymentParams.data.id_venta, "APROBADA")
          

          if (confirmResult.success) {
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
            alert(`Error al confirmar la venta: ${confirmResult.error}`)
          }
        } else if (paymentMethodName.includes("paypal")) {
          // PAGO CON PAYPAL - Abrir en nueva pestaña
      

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

            console.log(`🌐 [RenderSearchResult] PayPal abierto en nueva pestaña`)
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
      setPaymentProcessing(false)
      alert(`Error en el proceso de pago. Por favor, contacte al administrador. Detalles: ${error.message || error}`)
    }
  }

  // función para cancelar la selección de método de pago
  const handleCancelPaymentSelect = () => {
    if (isRoundTrip && roundTripData.vueltaSeats.length) {
      setCurrentStep("seats_vuelta")
    } else {
      setCurrentStep("seats_ida")
    }
    setSelectedPaymentMethod(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelSelection = () => {
    if (currentStep === "seats_ida" && isRoundTrip) {
      setSelectedTrip(null)
      setSelectedSeats([])
      setCurrentStep("search")
      return
    }
    if (currentStep === "seats_vuelta" && isRoundTrip) {
      setSelectedTrip(null)
      setSelectedSeats([])
      setCurrentStep("search_vuelta")
      return
    }
    setCurrentStep("search")
    setSelectedTrip(null)
    setSelectedSeats([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePaymentComplete = () => {
    setCurrentStep("success")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Función para ir al inicio (página principal)
  const handleGoHome = () => {
    window.location.href = "/"
  }

  // Función para nueva búsqueda (página principal)
  const handleNewSearch = () => {
    // Resetear todos los estados
    setCurrentStep("search")
    setSelectedTrip(null)
    setSelectedSeats([])
    setSaleCalculated(null)
    setPaymentMethods([])
    setSelectedPaymentMethod(null)
    setSaleId(null)
    setPaypalOrderId(null)
    setConfirmedTickets([])
    setPaymentDetails(null)
    setPaymentProcessing(false)
    setPaymentType(null)
    setPaypalWindowOpened(false)
    setPaypalPaymentData(null)
    setRoundTripData({
      isRoundTrip: false,
      step: "ida",
      idaTrip: null,
      idaSeats: [],
      vueltaTrip: null,
      vueltaSeats: [],
      isFinishStep: false,
    })

    // Ir al inicio para nueva búsqueda
    window.location.href = "/"
  }

  // Función para volver al paso anterior
  const handleGoBack = () => {
    
    switch (currentStep) {
      case "seats_ida":
        setCurrentStep("search")
        setSelectedTrip(null)
        break
      case "search_vuelta":
        setCurrentStep("seats_ida")
        setSelectedTrip(roundTripData.idaTrip)
        break
      case "seats_vuelta":
        setCurrentStep("search_vuelta")
        setSelectedTrip(null)
        break
      case "payment-select":
        if (isRoundTrip) {
          setCurrentStep("seats_vuelta")
          setSelectedTrip(roundTripData.vueltaTrip)
        } else {
          setCurrentStep("seats_ida")
          setSelectedTrip(selectedTrip)
        }
        break
      case "payment":
        if (paymentDetails?.method === "paypal") {
          setCurrentStep("payment-select")
        } else {
          setCurrentStep("payment-select")
        }
        break
      case "success":
        // No permitimos volver desde la pantalla de éxito
        break
      default:
        setCurrentStep("search")
    }
   
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Función para manejar el regreso cuando no hay viajes disponibles
  const handleBackToSearch = () => {
    if (isSellerForm) {
      // Si es vendedor, volver al formulario de venta
      window.location.href = "/enRuta/vendedor/vender-pasaje"
    } else {
      // Si es cliente, volver a la página principal
      window.location.href = "/"
    }
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

                {isSellerForm ? (
                  <Button onClick={handleNewSearch} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nueva venta
                  </Button>
                ) : (
                  <Button onClick={handleGoHome} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Ir al inicio
                  </Button>
                )}

                <p className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                  {isSellerForm
                    ? "Puede iniciar una nueva venta mientras el cliente completa el pago en PayPal"
                    : "Puede continuar navegando mientras completa el pago en PayPal"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 pt-30">
      {/* Overlay de carga para pagos */}
      <PaymentLoadingOverlay />

      {/* Botón para volver al paso anterior (excepto en la pantalla inicial y de éxito) */}
      {currentStep !== "search" && currentStep !== "success" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className={`mb-4 ${isDarkMode ? "text-white hover:bg-neutral-800" : "text-neutral-700 hover:bg-neutral-100"}`}
          disabled={paymentProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al paso anterior
        </Button>
      )}

      {/* Paso 1: Buscar viaje de ida */}
      {currentStep === "search" && (
        <>
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Resultados de búsqueda {isSellerForm && "(Venta por mostrador)"}
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              {displayOrigin} → {displayDestination} | {displayDate} | {displayPassengers}{" "}
              {Number.parseInt(displayPassengers) === 1 ? "pasajero" : "pasajeros"}
            </p>
            {isSellerForm && effectiveCustomerData && (
              <p className={`mt-1 text-sm ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                Cliente: {effectiveCustomerData.nombres} {effectiveCustomerData.apellidos} - {effectiveCustomerData.ci}
              </p>
            )}
            {isSellerForm && sellerData && (
              <p className={`mt-1 text-sm ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                Vendedor: {sellerData.nombres} {sellerData.apellidos}
              </p>
            )}
          </div>

          <div className="w-full">
            {loading ? (
              <div
                className={`flex flex-col items-center justify-center p-12 rounded-lg ${
                  isDarkMode ? "bg-white/5" : "bg-white"
                } shadow-sm`}
              >
                <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                <p className={isDarkMode ? "text-white" : "text-neutral-800"}>Buscando viajes disponibles...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div
                  className={`flex flex-col items-center p-8 rounded-lg ${
                    isDarkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-100"
                  } border`}
                >
                  <AlertCircle className={`h-12 w-12 mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                    No hay viajes disponibles
                  </h3>
                  <p className={`text-center mb-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      onClick={handleBackToSearch}
                      variant="outline"
                      className={`flex-1 ${
                        isDarkMode
                          ? "border-red-600 text-red-300 hover:bg-red-900/30"
                          : "border-red-300 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {isSellerForm ? "Volver a venta" : "Nueva búsqueda"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="space-y-4">
                <div
                  className={`flex flex-col items-center p-8 rounded-lg ${
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-100"
                  } border`}
                >
                  <Clock className={`h-12 w-12 mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                    No hay viajes disponibles
                  </h3>
                  <p className={`text-center mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    No encontramos viajes para esta búsqueda. Intenta con otras fechas o destinos.
                  </p>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      onClick={handleBackToSearch}
                      variant="outline"
                      className={`flex-1 ${
                        isDarkMode
                          ? "border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {isSellerForm ? "Volver a venta" : "Nueva búsqueda"}
                    </Button>

                    {!isSellerForm && (
                      <Button onClick={handleGoHome} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        <Home className="h-4 w-4 mr-2" />
                        Ir al inicio
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isDarkMode={isDarkMode}
                      onSelect={() => handleSelectTrip(trip)}
                      isAuthenticated={isAuthenticated}
                      searchParams={currentSearchCriteria}
                      isSellerForm={isSellerForm}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Paso 2: Selección de asientos de ida */}
      {currentStep === "seats_ida" && selectedTrip && (
        <SeatSelection
          trip={selectedTrip}
          passengers={Number.parseInt(searchPassengersForHook)}
          onComplete={handleSeatSelectionComplete}
          onCancel={handleCancelSelection}
          isFinishStep={!isRoundTrip}
          isReturn={false}
          isSellerForm={isSellerForm}
          customerData={effectiveCustomerData}
          sellerData={sellerData}
          roundTripData={roundTripData} // Pasar datos del viaje ida-vuelta
        />
      )}

      {/* Paso 3: Búsqueda de viaje de vuelta */}
      {currentStep === "search_vuelta" && (
        <>
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Selecciona tu viaje de vuelta {isSellerForm && "(Venta por mostrador)"}
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              {displayOrigin} → {displayDestination} | {displayDate} | {displayPassengers}{" "}
              {Number.parseInt(displayPassengers) === 1 ? "pasajero" : "pasajeros"}
            </p>
            {isSellerForm && effectiveCustomerData && (
              <p className={`mt-1 text-sm ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                Cliente: {effectiveCustomerData.nombres} {effectiveCustomerData.apellidos} - {effectiveCustomerData.ci}
              </p>
            )}
            {isSellerForm && sellerData && (
              <p className={`mt-1 text-sm ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                Vendedor: {sellerData.nombres} {sellerData.apellidos}
              </p>
            )}
          </div>
          <div className="w-full">
            {loading ? (
              <div
                className={`flex flex-col items-center justify-center p-12 rounded-lg ${
                  isDarkMode ? "bg-white/5" : "bg-white"
                } shadow-sm`}
              >
                <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                <p className={isDarkMode ? "text-white" : "text-neutral-800"}>Buscando viajes disponibles...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div
                  className={`flex flex-col items-center p-8 rounded-lg ${
                    isDarkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-100"
                  } border`}
                >
                  <AlertCircle className={`h-12 w-12 mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                    Error en la búsqueda de vuelta
                  </h3>
                  <p className={`text-center mb-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>

                  {/* Botones de acción para error en viaje de vuelta */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      onClick={() => {
                        setCurrentStep("seats_ida")
                        setSelectedTrip(roundTripData.idaTrip)
                      }}
                      variant="outline"
                      className={`flex-1 ${
                        isDarkMode
                          ? "border-red-600 text-red-300 hover:bg-red-900/30"
                          : "border-red-300 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a ida
                    </Button>

                    <Button
                      onClick={handleBackToSearch}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Nueva búsqueda
                    </Button>
                  </div>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="space-y-4">
                <div
                  className={`flex flex-col items-center p-8 rounded-lg ${
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-100"
                  } border`}
                >
                  <Clock className={`h-12 w-12 mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                    No hay viajes de vuelta disponibles
                  </h3>
                  <p className={`text-center mb-6 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    No encontramos viajes de vuelta para la fecha seleccionada ({displayReturnDate}). Intenta con otra
                    fecha.
                  </p>

                  {/* Botones de acción para viaje de vuelta */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      onClick={() => {
                        setCurrentStep("seats_ida")
                        setSelectedTrip(roundTripData.idaTrip)
                      }}
                      variant="outline"
                      className={`flex-1 ${
                        isDarkMode
                          ? "border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a ida
                    </Button>

                    <Button
                      onClick={handleBackToSearch}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Nueva búsqueda
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isDarkMode={isDarkMode}
                      onSelect={() => handleSelectTrip(trip)}
                      isAuthenticated={isAuthenticated}
                      searchParams={currentSearchCriteria}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Paso 4: Selección de asientos de vuelta */}
      {currentStep === "seats_vuelta" && selectedTrip && (
        <SeatSelection
          trip={selectedTrip}
          passengers={Number.parseInt(searchPassengersForHook)}
          onComplete={handleSeatSelectionComplete}
          onCancel={handleCancelSelection}
          isFinishStep={true}
          isReturn={true}
          isSellerForm={isSellerForm}
          customerData={effectiveCustomerData}
          sellerData={sellerData}
          roundTripData={roundTripData} // Pasar datos del viaje ida-vuelta
        />
      )}

      {/* Paso 5: Selección de método de pago */}
      {currentStep === "payment-select" && (
        <PaymentSelect
          paymentMethods={paymentMethods}
          onSelectPayment={handlePaymentMethodSelect}
          onCancel={handleCancelPaymentSelect}
          trip={
            isRoundTrip
              ? {
                  ida: roundTripData.idaTrip,
                  vuelta: roundTripData.vueltaTrip,
                }
              : selectedTrip
          }
          passengers={Number.parseInt(searchPassengersForHook)}
          selectedSeats={
            isRoundTrip
              ? {
                  ida: roundTripData.idaSeats,
                  vuelta: roundTripData.vueltaSeats,
                }
              : selectedSeats
          }
          totalAmount={
            saleCalculated?.montoTotal ||
            (isRoundTrip
              ? (roundTripData.idaTrip?.price || 0) * Number.parseInt(searchPassengersForHook) +
                (roundTripData.vueltaTrip?.price || 0) * Number.parseInt(searchPassengersForHook)
              : (selectedTrip?.price || 0) * Number.parseInt(searchPassengersForHook))
          }
          roundTrip={isRoundTrip}
          isSellerForm={isSellerForm}
          customerData={effectiveCustomerData}
          sellerData={sellerData}
          disabled={paymentProcessing}
          discountAmount={saleCalculated?.montoDescuento || 0}
        />
      )}

      {/* Paso 6: Procesamiento de pago */}
      {currentStep === "payment" &&
        (isRoundTrip ? (
          <MercadoPagoPayment
            trip={{
              ida: roundTripData.idaTrip,
              vuelta: roundTripData.vueltaTrip,
            }}
            passengers={Number.parseInt(searchPassengersForHook)}
            selectedSeats={{
              ida: roundTripData.idaSeats,
              vuelta: roundTripData.vueltaSeats,
            }}
            onComplete={handlePaymentComplete}
            onCancel={handleCancelSelection}
            totalAmount={
              (roundTripData.idaTrip?.price || 0) * Number.parseInt(searchPassengersForHook) +
              (roundTripData.vueltaTrip?.price || 0) * Number.parseInt(searchPassengersForHook)
            }
            roundTrip={true}
            isSellerForm={isSellerForm}
            customerData={effectiveCustomerData}
            sellerData={sellerData}
          />
        ) : (
          <MercadoPagoPayment
            trip={selectedTrip}
            passengers={Number.parseInt(searchPassengersForHook)}
            selectedSeats={selectedSeats}
            onComplete={handlePaymentComplete}
            onCancel={handleCancelSelection}
            totalAmount={
              saleCalculated?.montoTotal || (selectedTrip?.price || 0) * Number.parseInt(searchPassengersForHook)
            }
            roundTrip={false}
            tipoDescuento={saleCalculated?.tipoDescuento}
            montoDescuento={saleCalculated?.montoDescuento}
            isSellerForm={isSellerForm}
            customerData={effectiveCustomerData}
            sellerData={sellerData}
          />
        ))}

      {/* Paso 7: Confirmación de éxito - SOLO para pagos en efectivo */}
      {currentStep === "success" && (
        <PaymentSuccess
          trip={
            isRoundTrip
              ? {
                  ida: roundTripData.idaTrip,
                  vuelta: roundTripData.vueltaTrip,
                }
              : selectedTrip
          }
          passengers={Number.parseInt(searchPassengersForHook)}
          selectedSeats={
            isRoundTrip
              ? {
                  ida: roundTripData.idaSeats,
                  vuelta: roundTripData.vueltaSeats,
                }
              : selectedSeats
          }
          roundTrip={isRoundTrip}
          isSellerForm={isSellerForm}
          customerData={effectiveCustomerData}
          sellerData={sellerData}
          tickets={confirmedTickets}
          saleId={saleId}
          paymentDetails={paymentDetails}
          discountAmount={saleCalculated?.montoDescuento || 0}
        />
      )}
    </main>
  )
}

export default RenderSearchResult
