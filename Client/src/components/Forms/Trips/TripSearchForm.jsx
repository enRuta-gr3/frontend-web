import { useState, useMemo, useRef, useEffect } from "react"
import { Search, MapPin, Calendar, Users, ArrowRight, ArrowLeftRight, Phone, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Card,
  CardContent,
  Input,
  LocalityDropdown,
} from "@/components"

import useThemeStore from "@/store/useThemeStore"
import useLocalities from "@/hooks/useLocalities"

const TripSearchForm = ({
  onSubmit = () => {},
  isSellerForm = false, // si panel vendedor no muestra ciertos parametos y envia los datos del formulario por onSubmit
}) => {
  const [tripType, setTripType] = useState("oneWay")
  const [originFocus, setOriginFocus] = useState(false)
  const [destinationFocus, setDestinationFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados para filtrado en tiempo real
  const [originSearchTerm, setOriginSearchTerm] = useState("")
  const [destinationSearchTerm, setDestinationSearchTerm] = useState("")

  // Referencias para los dropdowns
  const originDropdownRef = useRef(null)
  const destinationDropdownRef = useRef(null)
  const originInputRef = useRef(null)
  const destinationInputRef = useRef(null)

  const [originDropdownPos, setOriginDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [destinationDropdownPos, setDestinationDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (originInputRef.current && originFocus) {
      const rect = originInputRef.current.getBoundingClientRect()
      setOriginDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [originFocus])

  useEffect(() => {
    if (destinationInputRef.current && destinationFocus) {
      const rect = destinationInputRef.current.getBoundingClientRect()
      setDestinationDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [destinationFocus])


  const { localities, loading: localitiesLoading } = useLocalities()
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
    returnDate: "",
    passengers: "",
  })


  const processedLocalities = useMemo(() => {
    if (!localities || localities.length === 0) return []

    return localities
      .map((locality) => ({
        id: locality.id_localidad,
        name: locality.nombreLocalidad,
        department: locality.departamento?.nombreDepartamento || "Sin Departamento",
        displayName: `${locality.nombreLocalidad} (${locality.departamento?.nombreDepartamento || "Sin Departamento"})`,
      }))
      .sort((a, b) => {
        if (a.department !== b.department) {
          return a.department.localeCompare(b.department)
        }
        return a.name.localeCompare(b.name)
      })
  }, [localities])

  // Filtramos localidades de origen basado en el término de búsqueda
  const filteredOriginLocalities = useMemo(() => {
    if (!originSearchTerm.trim()) return processedLocalities

    const searchLower = originSearchTerm.toLowerCase()
    return processedLocalities.filter(
      (locality) =>
        locality.name.toLowerCase().includes(searchLower) ||
        locality.department.toLowerCase().includes(searchLower) ||
        locality.displayName.toLowerCase().includes(searchLower),
    )
  }, [processedLocalities, originSearchTerm])

  // Filtramos destinos (excluir el origen seleccionado + filtrado por búsqueda)
  const filteredDestinations = useMemo(() => {
    const excludeOrigin = processedLocalities.filter((locality) => locality.displayName !== form.origin)

    if (!destinationSearchTerm.trim()) return excludeOrigin

    const searchLower = destinationSearchTerm.toLowerCase()
    return excludeOrigin.filter(
      (locality) =>
        locality.name.toLowerCase().includes(searchLower) ||
        locality.department.toLowerCase().includes(searchLower) ||
        locality.displayName.toLowerCase().includes(searchLower),
    )
  }, [processedLocalities, form.origin, destinationSearchTerm])

  // Agrupamos localidades filtradas de origen por departamento
  const groupedOriginLocalities = useMemo(() => {
    const groups = {}
    filteredOriginLocalities.forEach((locality) => {
      if (!groups[locality.department]) {
        groups[locality.department] = []
      }
      groups[locality.department].push(locality)
    })
    return groups
  }, [filteredOriginLocalities])

  // Agrupamos destinos filtrados por departamento
  const groupedFilteredDestinations = useMemo(() => {
    const groups = {}
    filteredDestinations.forEach((locality) => {
      if (!groups[locality.department]) {
        groups[locality.department] = []
      }
      groups[locality.department].push(locality)
    })
    return groups
  }, [filteredDestinations])

  // Manejamos cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  // Manejar cambios en el campo de origen con filtrado
  const handleOriginChange = (e) => {
    const value = e.target.value
    setOriginSearchTerm(value)

    // Si el usuario está escribiendo, limpiamos la selección actual
    if (form.origin && !value.includes(form.origin.split(" (")[0])) {
      setForm((prev) => ({ ...prev, origin: "" }))
    }
  }

  // Manejamos cambios en el campo de destino con filtrado
  const handleDestinationChange = (e) => {
    const value = e.target.value
    setDestinationSearchTerm(value)

    // Si el usuario está escribiendo, limpiamos la selección actual
    if (form.destination && !value.includes(form.destination.split(" (")[0])) {
      setForm((prev) => ({ ...prev, destination: "" }))
    }
  }


  const selectOrigin = (locality) => {
    setForm((prev) => ({ ...prev, origin: locality.displayName }))
    setOriginSearchTerm(locality.name) // Mostramos solo el nombre en el input
    setOriginFocus(false)
  }

  const selectDestination = (locality) => {
    setForm((prev) => ({ ...prev, destination: locality.displayName }))
    setDestinationSearchTerm(locality.name) // Mostramos solo el nombre en el input
    setDestinationFocus(false)
  }


  const clearOrigin = () => {
    setForm((prev) => ({ ...prev, origin: "" }))
    setOriginSearchTerm("")
    originInputRef.current?.focus()
  }

  //  Limpiar campo de destino
  const clearDestination = () => {
    setForm((prev) => ({ ...prev, destination: "" }))
    setDestinationSearchTerm("")
    destinationInputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target)) {
        setOriginFocus(false)
      }
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(event.target)) {
        setDestinationFocus(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  function handleSubmit(e) {
    e.preventDefault()
    setError("")

    const { origin, destination, date, passengers, returnDate } = form

    if (!origin || !destination || !date || !passengers) {
      setError("Por favor complete todos los campos")
      return
    }
    if (origin === destination) {
      setError("El origen y el destino no pueden ser iguales")
      return
    }
    if (tripType === "roundTrip" && !returnDate) {
      setError("Por favor complete la fecha de regreso")
      return
    } else if (tripType === "roundTrip" && returnDate < date) {
      setError("La fecha de regreso no puede ser anterior a la fecha de ida")
      return
    }

    // mostrar form
    console.log("Is seller: ", isSellerForm)
    if (isSellerForm) {
     

      // Extraemos solo el nombre de la localidad para la búsqueda (igual que en el flujo normal)
      const originName = form.origin.split(" (")[0]
      const destinationName = form.destination.split(" (")[0]

      // Creamos objeto con nombres limpios de localidades
      const cleanedForm = {
        ...form,
        origin: originName,
        destination: destinationName,
      }

      onSubmit(cleanedForm)
    } else {
      //si no continua con el comportamiento por defecto

      // Extraemos solo el nombre de la localidad para la búsqueda
      const originName = form.origin.split(" (")[0]
      const destinationName = form.destination.split(" (")[0]

      setIsLoading(true)

      // Construimos los parámetros de búsqueda para la URL
      const searchParams = new URLSearchParams({
        origin: originName,
        destination: destinationName,
        date,
        passengers,
        ...(tripType === "roundTrip" && { returnDate }),
      })

      console.log("Parámetros URL:", searchParams.toString())
      console.log("URL completa:", `/search-results?${searchParams.toString()}`)

      // Redirige a la página de resultados de búsqueda con los parámetros
      setTimeout(() => {
        setIsLoading(false)
        window.location.href = `/search-results?${searchParams.toString()}`
      }, 1000)
    }
  }

  
  return (
    <Card
      className={`${
        isDarkMode ? "bg-white/10" : "bg-white/80"
      } backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden border-0`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* formulario de busqueda de pasajes */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tripType === "oneWay"
                    ? "bg-orange-500 text-white"
                    : isDarkMode
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
                onClick={() => setTripType("oneWay")}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Solo ida
              </button>
              <button
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tripType === "roundTrip"
                    ? "bg-orange-500 text-white"
                    : isDarkMode
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
                onClick={() => setTripType("roundTrip")}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Ida y vuelta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Origen con búsqueda mejorada */}
                <div className="relative" ref={originDropdownRef}>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"} mb-1`}>
                    Origen
                  </label>
                  <div className={`relative transition-all duration-300 ${originFocus ? "scale-105" : ""}`}>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-500" />
                    </div>
                    <Input
                      ref={originInputRef}
                      name="origin"
                      placeholder="Buscar origen..."
                      className={`pl-14 pr-10 h-12 ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          : "bg-white/70 border-neutral-300 text-neutral-800 placeholder:text-neutral-500/70"
                      } focus:border-orange-500 focus:ring-orange-500`}
                      onFocus={() => setOriginFocus(true)}
                      value={originSearchTerm}
                      onChange={handleOriginChange}
                      autoComplete="off"
                    />
                    {/* Botón para limpiar */}
                    {(originSearchTerm || form.origin) && (
                      <button
                        type="button"
                        onClick={clearOrigin}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                          isDarkMode
                            ? "text-neutral-400 hover:text-white hover:bg-neutral-700"
                            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Mostramos selección actual */}
                  {form.origin && !originFocus && (
                    <div className={`mt-1 text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                      ✓ Seleccionado: {form.origin}
                    </div>
                  )}

                  <LocalityDropdown
                    isDarkMode={isDarkMode}
                    isVisible={originFocus}
                    groupedLocalities={groupedOriginLocalities}
                    onSelect={selectOrigin}
                    isLoading={localitiesLoading}
                    searchTerm={originSearchTerm}
                    placeholder="No hay localidades disponibles"
                    dropdownRef={originDropdownRef}
                    top={originDropdownPos.top}
                    left={originDropdownPos.left}
                    width={originDropdownPos.width}
                  />
                </div>

                {/* Destinos con búsqueda mejorada */}
                <div className="relative" ref={destinationDropdownRef}>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"} mb-1`}>
                    Destino
                  </label>
                  <div className={`relative transition-all duration-300 ${destinationFocus ? "scale-105" : ""}`}>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-500" />
                    </div>
                    <Input
                      ref={destinationInputRef}
                      name="destination"
                      placeholder="Buscar destino..."
                      className={`pl-14 pr-10 h-12 ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          : "bg-white/70 border-neutral-300 text-neutral-800 placeholder:text-neutral-500/70"
                      } focus:border-orange-500 focus:ring-orange-500`}
                      onFocus={() => setDestinationFocus(true)}
                      value={destinationSearchTerm}
                      onChange={handleDestinationChange}
                      autoComplete="off"
                    />
                    {/*  Botón para limpiar */}
                    {(destinationSearchTerm || form.destination) && (
                      <button
                        type="button"
                        onClick={clearDestination}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                          isDarkMode
                            ? "text-neutral-400 hover:text-white hover:bg-neutral-700"
                            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/*  Mostramos selección actual */}
                  {form.destination && !destinationFocus && (
                    <div className={`mt-1 text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                      ✓ Seleccionado: {form.destination}
                    </div>
                  )}

                  <LocalityDropdown
                    isDarkMode={isDarkMode}
                    isVisible={destinationFocus}
                    groupedLocalities={groupedFilteredDestinations}
                    onSelect={selectDestination}
                    isLoading={localitiesLoading}
                    searchTerm={destinationSearchTerm}
                    placeholder={form.origin ? "No hay destinos disponibles" : "Selecciona un origen primero"}
                    dropdownRef={destinationDropdownRef}
                    top={destinationDropdownPos.top}
                    left={destinationDropdownPos.left}
                    width={destinationDropdownPos.width}
                  />
                </div>
              </div>

              <div className="space-y-6">
            
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"} mb-1`}>
                    Fecha de viaje
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-orange-500" />
                    </div>
                    <Input
                      type="date"
                      name="date"
                      className={`pl-14 h-12 ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-white/70 border-neutral-300 text-neutral-800"
                      } focus:border-orange-500 focus:ring-orange-500 cursor-pointer`}
                      value={form.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
               

                {/* Return Date - solo si se selecciono roundTrip */}
                {tripType === "roundTrip" && (
                  
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"} mb-1`}
                    >
                      Fecha de regreso
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-orange-500 " />
                      </div>
                      <Input
                        type="date"
                        name="returnDate"
                        className={`pl-14 h-12 ${
                          isDarkMode
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/70 border-neutral-300 text-neutral-800"
                        } focus:border-orange-500 focus:ring-orange-500 cursor-pointer`}
                        value={form.returnDate}
                        onChange={handleChange}
                        min={form.date}
                      />
                    </div>
                  </div>
                  
                )}
              </div>
            </div>

           
            <div className="mt-6">
            
              <label className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"} mb-1`}>
                Pasajes
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-orange-500" />
                </div>
                <Select
                  value={form.passengers}
                  onValueChange={(value) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      passengers: value,
                    }))
                  }
                >
                  <SelectTrigger
                    className={`pl-14 h-12 ${
                      isDarkMode
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/70 border-neutral-300 text-neutral-800"
                    } focus:border-orange-500 focus:ring-orange-500`}
                  >
                    <SelectValue placeholder="Número de pasajes" />
                  </SelectTrigger>
                  <SelectContent
                    className={`${
                      isDarkMode
                        ? "bg-neutral-800 border-neutral-700 text-white"
                        : "bg-white border-neutral-300 text-neutral-800"
                    }`}
                  >
                    <SelectItem value="1">1 Pasaje</SelectItem>
                    <SelectItem value="2">2 Pasajes</SelectItem>
                    <SelectItem value="3">3 Pasajes</SelectItem>
                    <SelectItem value="4">4 Pasajes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
             
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button
              className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white h-12 text-base cursor-pointer"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Buscando...</span>
                </div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Buscar viajes
                </>
              )}
            </Button>
          </div>

       
         
        </div>
      </CardContent>
    </Card>
  )
}

export default TripSearchForm
