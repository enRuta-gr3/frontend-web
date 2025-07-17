import API from "./api"

/**
 * Servicios para la gestión de notificaciones del sistema.
 * Permite obtener y gestionar notificaciones de usuarios.
 *
 * @namespace notificationService
 */

/**
 * Obtiene las notificaciones de un usuario específico
 * @function
 * @async
 * @param {string} uuidAuth - UUID de autenticación del usuario
 * @returns {Promise<Object>} Respuesta del servidor con las notificaciones.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const notifications = await getNotifications("1e59a69b-e33a-446c-a441-532f46764708");
 */
export const getNotifications = async (uuidAuth) => {
  try {
    // Validar parámetro
    if (!uuidAuth) {
      throw new Error("UUID de autenticación es requerido")
    }

    const response = await API.post("/usuarios/listarNotificaciones", {
      uuidAuth: uuidAuth,
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    //console.error("❌ [notificationService] Error al obtener notificaciones:", error)

    // Manejo específico de errores HTTP
    if (error.response) {
      // Error 403 - Sin permisos
      if (error.response.status === 403) {
        throw new Error("No tienes permisos para acceder a estas notificaciones")
      }

      // Error 404 - Usuario no encontrado
      if (error.response.status === 404) {
        throw new Error("Usuario no encontrado")
      }

      // Error 400 - Bad Request
      if (error.response.status === 400) {
        throw new Error(error.response.data?.message || "Datos inválidos")
      }
    }

    throw error
  }
}

/**
 * Marca una notificación como leída
 * @function
 * @async
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await markAsRead(123);
 * 
 * 
 * response {
  "success": true,
  "message": "Notificacion marcada como leida correctamente.",
  "errorCode": null,
  "data": {
    "id_notificacion": 4,
    "buzonNotificacion": 11,
    "leido": true,
    "mensaje": "Se devolvieron los pasajes Nro. 27 y 28 para el viaje hacia Juan Lacaze, del día 10/07/2025, hora 10:00. Por un monto total de $1800.0.",
    "fechaEnvio": "2025-06-22T04:17:53.678-03:00"
  }
}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log("📖 [notificationService] Marcando notificación como leída:", notificationId)

    if (!notificationId) {
      throw new Error("ID de notificación es requerido")
    }

    const response = await API.post(`/usuarios/marcarNotificacionLeida?idNotificacion=${notificationId}`)

    console.log("✅ [notificationService] Notificación marcada como leída")

    return response.data
  } catch (error) {
    console.error("❌ [notificationService] Error al marcar notificación como leída:", error)
    throw new Error(error.response?.data.message);
  }
}

/**
 * Marca todas las notificaciones como leídas para un usuario
 * @function
 * @async
 * @param {string} uuidAuth - UUID de autenticación del usuario
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await markAllAsRead("1e59a69b-e33a-446c-a441-532f46764708");
 */
export const markAllAsRead = async (uuidAuth) => {
  try {
    if (!uuidAuth) {
      throw new Error("UUID de autenticación es requerido")
    }

    const response = await API.post("/usuarios/marcarTodasNotificacionesLeidas", {
      uuidAuth: uuidAuth,
    })
    return response.data
  } catch (error) {
    console.error("❌ [notificationService] Error al marcar todas las notificaciones como leídas:", error)
    throw new Error(error.response?.data.message);
  }
}
