
/**
 *  Muestra un mensaje de los errores en la authenticacion
 * 
 *  @param {object} error: Objeto con los errores encontrados
 *  @param {function} setError: Funcion que setea el estado del error
 *  @description: Este metodo muestra un mensaje de los errores encontrados en la authenticacion
 *  @returns {void}
 *  
 *  @example: handleAuthErrors({ response: { status: 400, data: { message: "Error en el servidor" } } }, setError) => "Error 400: Error en el servidor"
 *
 */



export const handleAuthErrors = (error, setError) => {
    if (error.response) {

      const statusCode = error.response.status;
      const rawData = error.response.data;
  
      let errorMessage;
  
      if (typeof rawData === 'string') {
        errorMessage = rawData;
      } else if (Array.isArray(rawData.errors)) {
        // Concatenar todos los mensajes si vienen en array
        errorMessage = rawData.errors.map(e => `${e.field}: ${e.message}`).join(" | ");
      } else {
        errorMessage = rawData?.message || "Error desconocido del servidor";
      }
  
      console.error("Error de autenticación [authUtils.js - handleAuthErrors]", errorMessage);
      setError(`Error ${statusCode}: ${errorMessage}`);
    } else {
      setError("Error de conexión con el servidor");
    }
  };


/**
 *  Configuracion de notificaciones de autenticacion
 *  @param {string} position: Posicion de la notificacion
 *  @param {number} autoClose: Tiempo en milisegundos que tarda en cerrarse la notificacion
 *  @param {boolean} hideProgressBar: Si se muestra la barra de progreso
 *  @param {boolean} closeOnClick: Si se cierra al hacer click
 *  @param {boolean} pauseOnHover: Si se pausa al pasar el mouse por encima
 *  @param {boolean} draggable: Si se puede arrastrar
 *  @returns {object}
 */
export const AUTH_NOTIFICATION_CONFIG = {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
}