import { useState } from "react"
import { Clock, CreditCard, LogIn, X, MapPin } from "lucide-react"
import { Button } from "@/components"
import { Link } from "react-router-dom"
import usePendingTripStore from "@/store/usePendingTripStore"

export default function TripCard({ trip, isDarkMode, onSelect, isAuthenticated,travelData={},isSeller=false,isSellerForm=false }) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  const {setPendingTrip} = usePendingTripStore()

 

  const handleSelectClick = () => {
    if (!isAuthenticated) {
      // Guardar los datos del viaje pendiente para redirección post-login
      setPendingTrip(trip,{
        ...travelData,
        action: "selectSeats",
      })
      setShowLoginModal(true)
    } else {
      onSelect()
    }
  }

  // Función para obtener las iniciales de la empresa de autobús
  const getBusCompanyInitials = () => {
    if (!trip?.bus?.number) return "B"
    return `${trip.bus.number}`.charAt(0) || "B"
  }

  // Función para obtener el nombre de la empresa (por ahora usamos el número del coche)
  const getBusCompanyName = () => {
    return `Coche ${trip?.bus?.number || "N/A"}`
  }

  // Función para obtener el tipo de autobús
  const getBusType = () => {
    const capacity = trip?.bus?.capacity || 0
    if (capacity >= 40) return "Ejecutivo"
    if (capacity >= 30) return "Semi-cama"
    return "Común"
  }

  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl p-6 max-w-sm w-full shadow-xl ${isDarkMode ? "bg-neutral-800" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <LogIn className={`h-5 w-5 mr-2 ${isDarkMode ? "text-orange-400" : "text-orange-500"}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Iniciar Sesión
            </h3>
          </div>
          <button
            onClick={() => setShowLoginModal(false)}
            className={`p-1 rounded-full transition-colors ${isDarkMode ? "hover:bg-neutral-700" : "hover:bg-neutral-100"}`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? "text-white" : "text-neutral-800"}`} />
          </button>
        </div>

        <p className={`text-sm mb-6 ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
          Para seleccionar y reservar este viaje necesitas estar registrado en nuestra plataforma.
        </p>

        <div className="flex gap-3">
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
            onClick={() => setShowLoginModal(false)}
          >
            Cancelar
          </button>
          {/* redirecciona a la pagina /login */}
          <Link to="/login" className="flex-1">
            <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      </div>
    </div>
  )

  // Verificar que el trip tenga los datos necesarios
  if (!trip) {
    return null
  }

  return (
    <>
      <div
        className={`rounded-lg overflow-hidden border ${
          isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
        } shadow-sm mb-4`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              {/* si es vendedor muestra mas datos */}
            {isSeller && (
              <div className="flex items-center mb-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                    isDarkMode ? "bg-orange-500/20" : "bg-neutral-100"
                  }`}
                >
                  <span className="text-orange-500 font-medium">{getBusCompanyInitials()}</span>
                </div>
                
                  <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  {getBusCompanyName()}
                </span>

                
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    isDarkMode ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {getBusType()}
                </span>
              </div>
            )}
            <div className="flex items-center mb-2">
                <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  {trip.status}
                </span> 
            </div> 

              <div className="flex items-center">
                <div className="text-center mr-3">
                  <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {trip.departureTime || "N/A"}
                  </div>
                  <div className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>Salida</div>
                </div>

                <div className="flex-1 px-3">
                  <div className="relative flex items-center">
                    <div className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-neutral-700" : "bg-neutral-300"}`}></div>
                    <div className={`flex-1 h-0.5 mx-1 ${isDarkMode ? "bg-neutral-700" : "bg-neutral-300"}`}></div>
                    <div className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-orange-500" : "bg-orange-500"}`}></div>
                  </div>
                  {/* separacion de origen - destino */}
                  <div className="flex justify-between gap-5 mt-1">
                    <span className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                      {trip.origin || "N/A"}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                      {trip.destination || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="text-center ml-3">
                  <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {trip.arrivalTime || "N/A"}
                  </div>
                  <div className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>Llegada</div>
                </div>
              </div>
            </div>

            {/* Botón de selección con lógica de autenticación */}
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold text-orange-500 mb-2`}>${trip.price || 0}</div>
              <Button
                className={`w-full sm:w-auto transition-colors ${
                  isAuthenticated
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
                onClick={handleSelectClick}
              >
                Seleccionar
              </Button>
            </div>
          </div>

          <div
            className={`mt-4 pt-4 border-t flex flex-wrap gap-4 ${
              isDarkMode ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            <div className="flex items-center">
              <Clock className={`h-4 w-4 mr-2 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`} />
              <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                {trip.duration && trip.duration.includes("d")
                ? `Duración: ${trip.duration}` // Muestro dias si tiene
                : trip.duration
                ? `Duración: ${trip.duration}` // Muestro horas y minutos
                : "Duración: N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <CreditCard className={`h-4 w-4 mr-2 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`} />
              <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                {trip.availableSeats || 0} asientos disponibles
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className={`h-4 w-4 mr-2 ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`} />
              <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                Capacidad: {trip.bus?.capacity || 0} asientos
              </span>
            </div>
            <div className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"} ml-auto`}>
              {trip.departureDate || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de login */}
      {showLoginModal && <LoginModal />}
    </>
  )
}
