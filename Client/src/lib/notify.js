import { toast } from "react-toastify"

/**
 * Muestra una notificación en pantalla con opciones configurables.
 *
 * @param {string} message - Mensaje que se mostrará en la notificación.
 * @param {Object} options - Configuración personalizada para la notificación.
 * @param {string} options.type - Tipo de notificación: "success" | "error" | "info" | "warning" | "default".
 * @param {string} options.position - Posición en la pantalla: "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center".
 * @param {number} options.autoClose - Tiempo en milisegundos antes de cerrar automáticamente. Ej: 2000 = 2s.
 * @param {boolean} options.hideProgressBar - Oculta la barra de progreso si es true.
 * @param {boolean} options.closeOnClick - Permite cerrar la notificación al hacer clic.
 * @param {boolean} options.pauseOnHover - Pausa el temporizador si el mouse pasa encima.
 * @param {boolean} options.draggable - Permite arrastrar la notificación.
 * @param {string} options.className - Clase CSS personalizada para la notificación.
 * @param {string} options.bodyClassName - Clase CSS personalizada para el cuerpo del mensaje.
 * @param {string} options.progressClassName - Clase CSS personalizada para la barra de progreso.
 *
 * @example
 * notify("Sesión iniciada correctamente", { type: "success", position: "top-right", autoClose: 3000 });
 */
export const notify = (message, options = {}) => {
  // Extraer el tipo de las opciones
  const { type = "default", ...toastOptions } = options

  // Configuración por defecto
  const defaultOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...toastOptions,
  }

  // Llama al método correcto según el tipo
  switch (type) {
    case "success":
      return toast.success(message, defaultOptions)
    case "error":
      return toast.error(message, defaultOptions)
    case "info":
      return toast.info(message, defaultOptions)
    case "warning":
      return toast.warn(message, defaultOptions)
    default:
      return toast(message, defaultOptions)
  }
}

/**
 * Notifica al usuario que todavia falta confirmar su correo.
 *
 * @param {Object} userObject : Objeto de usuario con la informacion  del usuario
 * @param {Function} onClose : Funcion que se ejecuta cuando se cierra la notificacion
 * @param {number} autoClose : Tiempo en milisegundos antes de cerrar automáticamente. Ej: 2000 = 2s.
 * @description: Muestra un mensaje al usuario que todavia falta confirmar su correo.
 * @example
 * notifyEmailConfirmation(userObject);
 *
 */
export const notifyEmailConfirmation = (userObject, autoClose, onClose) => {
  notify(`Por favor confirme su email: ${userObject.email}, para poder viajar!`, {
    type: "info",
    position: "top-right",
    autoClose: autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClose: onClose,
  })
}

/**
 * Notifica al usuario que su correo fue confirmado. (se ejecuta una unica vez)
 *
 * @param {Object} userObject : Objeto de usuario con la informacion  del usuario
 * @param {Function} onClose : Funcion que se ejecuta cuando se cierra la notificacion
 * @param {number} autoClose : Tiempo en milisegundos antes de cerrar automáticamente. Ej: 2000 = 2s.
 * @description: Muestra un mensaje al usuario que su correo fue confirmado.
 * @example
 * notifyEmailConfirmated(userObject,autoClose,() => functionalidad);
 *
 */
export const notifyEmailConfirmated = (userObject, autoClose, onClose) => {
  notify(`Su correo ${userObject.email} fue confirmado!`, {
    type: "success",
    position: "top-right",
    autoClose: autoClose,
    hideProgressBar: true,
    closeOnClick: true,
    onClose: onClose,
  })
}
