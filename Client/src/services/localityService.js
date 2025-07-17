import API from "./api";

/**
 * Servicios para la gestión de localidades en el sistema.
 * Permite obtener, crear y cargar masivamente localidades.
 *
 * @namespace localityService
 */

/**
 * Devuelve todas las localidades de la base de datos, parseadas para el frontend.
 * @function
 * @async
 * @returns {Promise<Array>} Lista de localidades parseadas.
 * @throws {Error} Si ocurre un error en la petición.
 */
export const getLocalities = async () => {
  try {
    const response = await API.get("localidades/listarLocalidades");
    const rawData = response.data?.data || [];

    const parsed = rawData.map((loc) => ({
      id_localidad: loc.id_localidad,
      nombreLocalidad: loc.nombreLocalidad,
      departamento: {
        id_departamento: loc.departamento?.id_departamento,
        nombreDepartamento: loc.departamento?.nombreDepartamento,
      },
    }));
    return parsed;
  } catch (error) {
    throw new Error(error.response?.data.message);
  } 
};

/**
 * Crea una nueva localidad.
 * @function
 * @async
 * @param {Object} localitieData - Datos de la localidad a registrar.
 * @returns {Promise<Object>} Localidad creada.
 * @throws {Error} Si ocurre un error en la petición.
 */
export const createNewLocality = async (localitieData) => {
  try {
    const response = await API.post(
      "/localidades/registrarLocalidad",
      localitieData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data.message);
  } 
};

/**
 * Carga masiva de localidades.
 *
 */
export const massiveLocalities = async () => {
  try {
    const response = await API.get("/cargasMasivas/crearLocalidades")
    return response.data
  } catch (err) {
    

    let errorMessage = "Error al registrar las localidades desde el archivo"

    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err.message) {
      errorMessage = err.message
    }

    throw new Error(errorMessage)
  }
};
