import { useState, useCallback } from "react";
import { requestAmount } from "@/services";


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

export default function useSale(){

    const [montoTotal,setMontoTotal] = useState(null)
    const [montoDescuento, setMontoDescuento] = useState(null)
    const [tipoDescuento, setTipoDescuento] = useState("")
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saleCalculate = useCallback( async(viajesRaw) => {
        setLoading(true)
        setError("")

        // transformamos los datos para enviar al servicio de solicitarMonto
        try{
            const requestBody = viajesRaw.map(({uuidAuth,id_viaje,cantidad})=>(
                {
                    uuidAuth,
                    viaje: {
                        id_viaje,
                        cantidad,
                    }
                }
            ))
           
            // enviamos requestBody al servicio usando requestAmount
            const response = await requestAmount(requestBody) 
            /**
             *  response {
             *      "montoTotal",
             *      "montoDescuento",
             *      "tipoDescuento" 
             * }
             */
           
            setMontoTotal(response.montoTotal)
            setMontoDescuento(response.montoDescuento)
            setTipoDescuento(response.tipoDescuento)
            return response
        }catch(error){
            console.log("❌[useSale-55linea]: Error: ",error.message)
            setError(error.message)
        }finally{
            setLoading(false)
        }
    },[])

    return {
        montoTotal,
        montoDescuento,
        tipoDescuento,
        loading,
        error,
        saleCalculate,
    }

}