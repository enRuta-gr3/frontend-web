// servicio responsable del historial de pasajes

import API from './api'


/**
 *  api -> /pasajes/solicitarHistorialPasajes
 *  request {
 *  "uuidAuth": String  -> uuidAuth del cliente
 *  }
 *  {
  "success": true,
  "data": [
    {
      "id_pasaje": 4,
       "precio": 900,
      "viaje": {
        "id_viaje": 0,
        "fecha_partida": "20/06/2025",
        "hora_partida": "10:00",
        "fecha_llegada": "20/06/2025",
        "hora_llegada": "12:00",
        "localidadOrigen": {
          "nombreLocalidad": "Montevideo"
        },
        "localidadDestino": {
          "nombreLocalidad": "Juan Lacaze"
        }
      }
    },
  ]
}
 */
export const getUserTicketHistory = async (data) => {
  try {
    const response = await API.post('/pasajes/solicitarHistorialPasajes', data); // POST con el cuerpo { uuidAuth: uuidAuth }
    return response.data; 
  } catch (err) {
   
    throw err
  }
};

//

/**
 * Listar pasajeros por viaje
 * @param {number} id_viaje - ID del viaje
 * @returns {Promise} Response con los pasajeros del viaje
 */
export const getTicketsByTrip = async (id_viaje) => {
  try {
    

    const response = await API.post("/pasajes/listarPasajesPorViaje", {
      id_viaje: id_viaje,
    })

    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * 
 */

/**
 * Obtener pasajes por ID de venta
 * @param {number} id_venta - ID de la venta
 * @returns {Promise} Response con los pasajes de la venta
 * Tipo: GET url: http://localhost:8080/api/pasajes/listarPasajesPorVenta?idVenta=[id_venta]
 */
export const getTicketsBySale = async (id_venta) => {
  try {
    
    
    if (!id_venta) {
      throw new Error("ID de venta es requerido")
    }

    const ventaId = Number(id_venta)
    if (isNaN(ventaId)) {
      throw new Error("El ID de la venta debe ser un número válido")
    }

    const response = await API.get(`/pasajes/listarPasajesPorVenta?idVenta=${ventaId}`)
    return response.data
  } catch (error) {
  
    throw error
  }
}


