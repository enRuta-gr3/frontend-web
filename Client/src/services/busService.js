
import API from "./api";

/**
 * Servicios para la gestión de ómnibus en el sistema.
 * Permite obtener, crear y cargar masivamente ómnibus.
 * 
 * @namespace busService
 */

/**
 * Devuelve todos los ómnibus de la base de datos.
 * @function
 * @async
 * @returns {Promise<Object>} Respuesta del servidor con la lista de ómnibus.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const buses = await getBus();
 */
export const getBuses = async () => {
    try{
        const response = await API.get("/omnibus/listar");
        return response.data;
    }catch(error){
        throw error
    }
}

export const getAvailableBuses = async (tripData) => {
    try{
        console.log("Trip data: ->>" ,tripData)
        const response = await API.post("/omnibus/listarOmibusDisponiblesCreacion", tripData);
        console.log("Response data: ->>", response.data)
        return response.data;
    }catch(error){
        throw error
    }
}

/**
 * Crea un nuevo ómnibus.
 * @function
 * @async
 * @param {Object} busData - Datos del ómnibus a registrar.
 * @returns {Promise<Object>} Respuesta del servidor con el ómnibus creado.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await createBus({ numero: "B1", capacidad: 45, localidad: "Montevideo" });
 */
export const createNewBus = async (busData) => {
    try{
        const response = await API.post("/omnibus/registrar", busData);
        return response.data;
    }catch(err){
        throw err 
    }
}


export const massiveBusUpload = async () => {
    try {
        const response = await API.get("/cargasMasivas/crearOmnibus")
        return response.data
      } catch (err) {
        let errorMessage = "Error al registrar los buses desde el archivo"
    
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.message) {
          errorMessage = err.message
        }
    
        throw new Error(errorMessage)
      }
}


export const changeStatusBus = async (busData) => {
    try{
        const response = await API.post("/omnibus/cambiarEstado", busData);
        console.log("Respuesta de cambio de estado => ",JSON.stringify(response,null,2))
        return response.data;
    }catch(error){
        throw error
    }
}

