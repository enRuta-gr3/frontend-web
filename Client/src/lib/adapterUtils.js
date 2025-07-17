/**
 * Función utilitaria asíncrona para ejecutar llamadas a servicios y manejar errores.
 * Puede ser utilizada por cualquier adaptador para centralizar la lógica de manejo de respuestas y errores.
 * 
 * @param {Function} serviceFunction - Función del servicio a ejecutar (puede ser login, registro, etc).
 * @param {Object} data - Datos a enviar al servicio (puede ser cualquier objeto requerido por el servicio).
 * @returns {Promise<Object>} - Respuesta del servicio.
 * @throws {Error} - Error al ejecutar el servicio.
 * @example
 *   await handleServiceCall(loginService, { email: "a@b.com", password: "123" })
 *   await handleServiceCall(registerService, { ...datosRegistro })
 */
export const handleServiceCall = async (serviceFunction, data) => {
    try {
        const response = await serviceFunction(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * response.data {
 *  DtUsuario: {..},
 *  access_token: "..."
 * }
 */