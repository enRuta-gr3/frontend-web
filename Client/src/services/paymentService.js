import API from "./api"

/**
 * Servicios para la gestión de pagos en el sistema.
 * Permite solicitar parámetros y medios de pago de Mercado Pago.
 *
 * @namespace paymentService
 */

/**
 * Solicita los parámetros necesarios para Mercado Pago
 * @function
 * @async
 * @param {Object} paymentData - Datos del pago
 * @returns {Promise<Object>} Respuesta del servidor con los parámetros de Mercado Pago.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const parametros = await requestMercadoPagoParams({
 *   amount: 1500,
 *   description: "Pasaje de bus"
 * });
 */
export const requestMercadoPagoParams = async (paymentData) => {
  try {
    //console.log("💳 [paymentService.js - requestMercadoPagoParams] Solicitando parámetros MP:", paymentData)

    const response = await API.post("/pagos/solicitarParametrosMercadoPago", paymentData)

    //console.log("✅ [paymentService.js] Parámetros MP obtenidos:", response.data)

    return response.data  // ultimo cambio 7:28 8 de junio
  } catch (error) {
    //console.error("❌ [paymentService.js - requestMercadoPagoParams] Error:", error)
    throw new Error(error.response?.data.message);
  } 
}

/**
 * Solicita los medios de pago disponibles para el usuario
 * @function
 * @async
 * @param {Object} paymentData - Datos para solicitar medios de pago
 * @param {Object} paymentData.vendedor - Datos del vendedor
 * @param {string} paymentData.vendedor.uuIdAuth - UUID de autenticación del vendedor
 * @param {Object} paymentData.cliente - Datos del cliente
 * @param {string} paymentData.cliente.uuIdAuth - UUID de autenticación del cliente
 * @returns {Promise<Object>} Respuesta del servidor con los medios de pago.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * const mediosPago = await requestPaymentMethods({
 *   vendedor: { uuidAuth: "845ee83b-c598-4233-92db-d6e78f55cb47" },
 *   cliente: { uuidAuth: "191eacdd-7597-4e41-9082-fbd7ae41c510" }
 * });
 */
export const requestPaymentMethods = async (paymentData) => {
  try {
   

    const response = await API.post("/pagos/solicitarMediosDePago", paymentData)
   
    return response.data
  } catch (error) {
    throw new Error(error.response?.data.message);
  } 
}

/**
 * Solicita los parámetros necesarios para procesar un pago
 * @example
 * Desde compra online
 * const parametros = await requestPaymentParams({
 *   pago: {
 *     medio_de_pago: {
 *       id_medio_de_pago: 3,
 *       nombre: "PayPal"
 *     }
 *   },
 *   pasajes: [
 *     {
 *       uuidAuth: "191eacdd-7597-4e41-9082-fbd7ae41c510",
 *       viaje: { id_viaje: 1, cantidad: 2 }
 *     }
 *   ]
 * });
 * Desde compra por mostrador
 * {
"pago":{
"medio_de_pago":{
		"id_medio_de_pago": 2,
		"nombre": "Mercado Pago"
	}	
},
"vendedor":{
	"uuidAuth": "845ee83b-c598-4233-92db-d6e78f55cb47"
	},
"pasajes":[
  {
	"uuidAuth": "191eacdd-7597-4e41-9082-fbd7ae41c510",
	"viaje": { "id_viaje": 1, "cantidad": 2 }
  },
  {
	"uuidAuth": "191eacdd-7597-4e41-9082-fbd7ae41c510",
	"viaje": { "id_viaje": 2, "cantidad": 2 }
  }
]
}
 *  {
  "success": true,
  "message": "Datos obtenidos correctamente",
  "errorCode": null,
  "data": {
    "id_venta": 23,
    "urlPago": "https://www.sandbox.paypal.com/checkoutnow?token=9KX48224BH727662X",
    "id_orden": "9KX48224BH727662X"
  }
}
 */
export const requestPaymentParams = async (paymentData) => {
  try {
   

    const response = await API.post("/pagos/solicitarParametrosPago", paymentData)

    return response
  } catch (error) {
    
    throw new Error(error.response?.data.message);
  } 
}
