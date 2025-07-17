import API from "./api"

/**
 * Servicios para la gestión de viajes del sistema.
 * Permite buscar, obtener y crear viajes.
 *
 * @namespace travelService
 */


/**
 * Devuelve todos los viajes disponibles
 * @function
 * @async
 * @returns {Promise<Object>} Respuesta del servidor con la lista de viajes.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const viajes = await getTravels();
 */
export const getTravels = async () => {
  try {
  
    const response = await API.get("/viajes/listarViajes")

    //console.log("✅ [travelService.js] Total de viajes obtenidos:", response.data?.length || 0)

    return response.data
  } catch (error) {
    throw error
  }
}



/**
 * Crea un nuevo viaje y asigna un ómnibus
 * @function
 * @async
 * @param {Object} travelData - Datos del viaje a registrar
 * @returns {Promise<Object>} Respuesta del servidor con el viaje creado y el ómnibus asignado.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await createTravelAndAssignBus({
 *   origen: 1,
 *   destino: 2,
 *   fechaSalida: "2025-06-10",
 *   horaSalida: "08:00",
 *   omnibusId: 5
 * });
 */
export const createTravelAndAssignBus = async (travelData) => {
  try {
    //console.log("🚌 [travelService.js - createTravelAndAssignBus] Creando viaje:", travelData)

    const response = await API.post("/viajes/registrarViaje", travelData)

    //console.log("✅ [travelService.js] Viaje creado exitosamente:", response.data)

    return response.data
  } catch (error) {
    throw error
  } 
}



/**
 * Calcula el precio de una venta
 * @function
 * @async
 * @param {Object} saleData - Datos para calcular la venta
 * @param {number} saleData.viajeId - ID del viaje
 * @param {number} saleData.cantidadPasajeros - Cantidad de pasajeros
 * @param {Array} [saleData.asientosSeleccionados] - Asientos seleccionados
 * @returns {Promise<Object>} Respuesta del servidor con el cálculo de la venta.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const calculo = await calculateSale({
 *   viajeId: 123,
 *   cantidadPasajeros: 2,
 *   asientosSeleccionados: [1, 2]
 * });
 */
export const calculateSale = async (saleData) => {
  try {
    //console.log("💰 [travelService.js - calculateSale] Calculando venta:", saleData)

    const response = await API.post("/api/venta/calcularVenta", saleData)

    //console.log("✅ [travelService.js] Cálculo de venta realizado:", response.data)

    return response.data
  } catch (error) {
    throw error
  } 
}



/**
 * Listar viajes por ómnibus (placeholder para futura implementación)
 * @param {number} id_omnibus - ID del ómnibus
 * @returns {Promise} Response con los viajes del ómnibus
 * 
 * 
 * GET /api/viajes/listarPorOmnibus?idOmnibus=[id_omnibus]
 */
export const getTripsByBus = async (id_omnibus) => {
  try {
    

    // TODO: Implementar cuando esté disponible el endpoint
    const response = await API.get(`/viajes/listarPorOmnibus?idOmnibus=${id_omnibus}`)

    
    return response.data
  } catch (error) {
    throw error
  }
}




//  POST /api/viajes/reasignarViaje?idViaje=[id_viaje]&idOmnibus=[id_omnibus]
export const reasignTrip = async (id_viaje,id_omnibus) => {
  try{
    
    
    const response = await API.get(`/viajes/reasignarViaje?idViaje=${id_viaje}&idOmnibus=${id_omnibus}`)
    return response.data
  }catch(error){
    throw error
  }
}

// GET /api/omnibus/listarOmibusDisponiblesViaje?idViaje=[id_viaje]
export const availableBusForTrip = async (id_viaje) => {
  try{
    const response = await API.get(`/omnibus/listarOmibusDisponiblesViaje?idViaje=${id_viaje}`)
    return response.data
  }catch(error){
    throw error
  }
}