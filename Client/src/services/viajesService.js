import API from "./api";

/**
 * Servicios para la gestión de viajes.
 * Incluye obtener la lista de viajes y registrar un nuevo viaje.
 */

/**
 * Obtiene todos los viajes.
 * @returns {Promise<Object>} Lista de viajes del backend.
 */
export const getViajes = async () => {
  try {
    const response = await API.get("/viajes/listarViajes");
    console.log("Response =>\n",JSON.stringify(response,null,2))
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener viajes:", error);
    throw error;
  }
};

/**
 * Crea un nuevo viaje.
 * @param {Object} viajeData - Datos del viaje a registrar.
 * @returns {Promise<Object>} Viaje creado.
 */
export const createNewViaje = async (viajeData) => {
  try {
    const response = await API.post("/viajes/registrarViaje", viajeData);
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear viaje:", error);
    throw error;
  }
};