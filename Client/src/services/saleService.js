
import API from "./api";

/**
 * Servicios para la venta/compra de pasajes.
 * Permite 
 * 
 * @namespace saleService
 */




/**
 * Calcula el monto total y descuentos para un conjunto de viajes.
 * @param {Array<{uuidAuth: string, viaje: {id_viaje: number, cantidad: number}}>} data - Lista de viajes a calcular.
 * @returns {Promise<{montoTotal: number, montoDescuento: number, tipoDescuento: string}>} Resultado de la simulación de venta.
 * @throws Error si la llamada falla o los datos no son válidos.
 */

/**
 *  requestBody 
 *   [  
 *      {
    *      "uuidAuth": String, //uuid
    *      "viaje": {
    *             "id_viaje": Number,
    *              "cantidad": Number,
    *      }
 *      },
 *      {
 *      "uuidAuth": String, //uuid
    *      "viaje": {
    *             "id_viaje": Number,
    *              "cantidad": Number,
    *      }
 * 
 *      }
 * 
 *  ]
 *  response:
 *  {
    "success": true,
    "message": "Procesado Correctamente",
    "errorCode": null,
    "data": {
        "montoTotal": double,
        "montoDescuento": double,
        "tipoDescuento": String
    }
}
 */


export const requestAmount = async (data) => {
    
    if(!Array.isArray(data) || data.length === 0){
        throw new Error("El parámetro 'data' debe ser un arreglo no vacío.");
    }

    try{
        
        const response = await API.post("/venta/calcularVenta",data)
        const responseData = response?.data

        if(responseData?.success){
            return responseData.data;
        }else {
            throw new Error(responseData?.message || "Error desconocido en la respuesta del servidor.");
          }
    }catch(error){
      throw new Error(error.response?.data.message);
    }
}



/**
 * Confirma una venta después del pago
 * @function
 * @async
 * @param {Object} saleConfirmationData - Datos de confirmación de venta
 * @param {number} saleConfirmationData.id_venta - ID de la venta
 * @param {Object} saleConfirmationData.pago - Información del pago
 * @param {string} saleConfirmationData.pago.estado_trx - Estado de la transacción (APROBADA, RECHAZADA, CANCELADA)
 * @returns {Promise<Object>} Respuesta del servidor con los pasajes creados
 * @throws {Error} Si ocurre un error en la petición
 * @example
 * const result = await confirmSale({
 *   id_venta: 15,
 *   pago: {
 *     estado_trx: "APROBADA"
 *   }
 * });
 */
export const confirmSale = async (saleConfirmationData) => {
    try {
      
      const response = await API.post("/venta/confirmarVenta", saleConfirmationData)
      
      return response.data
    } catch (error) {
      
      throw new Error(error.response?.data.message);
    } 
  }

/**
 *  request: {
 *    "id_venta": Number, 
 *     "id_orden": String    
 *    } 
 * 
 * confirmar venta PayPal, se llama luego de hacer el pago paypal
 */
export const confirmSalePayPal = async (saleConfirmationData) => {
  try {
    
    const response = await API.post("/venta/confirmarVentaPaypal", saleConfirmationData)
 
    return response.data
  } catch (error) {
    console.error("❌ [saleService.js - confirmSale] Error:", error.message)
    throw new Error(error.response?.data.message);
  } 
}
  