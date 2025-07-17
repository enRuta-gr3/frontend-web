import API from "./api"

/**
 * Servicios para la gestión de asientos en el sistema.
 * Permite obtener asientos de un ómnibus y cambiar su estado.
 *
 * @namespace seatService
 */

/**
 * Lista los asientos de un ómnibus asociado a un viaje
 * @function
 * @async
 * @param {number} viajeId - ID del viaje
 * @returns {Promise<Object>} Respuesta del servidor con la lista de asientos.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const asientos = await listSeats(123);
 */
export const listSeats = async (viajeId) => {
  try {
    

    // Asegurar que viajeId sea un número
    const tripId = Number(viajeId)
    const requestBody = { id_viaje: tripId }

    

    const response = await API.post("/asientos/listarAsientos", requestBody)

    return response.data
  } catch (error) {
    throw error
  } 
}

/**
 * Marca asientos como ocupados cuando son seleccionados
 * @function
 * @async
 * @param {Array} seatsData - Array de asientos con la estructura completa del backend
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await changeSeatsState([
 *   {
 *     id_disAsiento: 1,
 *     asiento: { id_asiento: 51, numero_asiento: 1, id_omnibus: 2 },
 *     viaje: { id_viaje: 1, cantidad: 0, precio_viaje: 0, asientosDisponibles: 0 },
 *     estado: "BLOQUEADO",
 *     idBloqueo: "uuid-string"
 *   }
 * ]);
 */
export const changeSeatsState = async (seatsData) => {
  try {
    

    // Los datos ya vienen en el formato correcto desde useSeats
    // Es un array de asientos con la estructura completa del backend
    const requestBody = seatsData

    
    const response = await API.post("/asientos/cambiarEstado", requestBody)

  

    // Verificar si hubo algún asiento que no se pudo bloquear
    if (response.data?.success === false) {
      throw new Error(response.data.message || "Conflicto con algunos asientos")
    }

    return response.data
  } catch (error) {
    throw error
  }
}
