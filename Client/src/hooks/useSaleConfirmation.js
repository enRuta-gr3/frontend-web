
import { useState, useCallback } from "react"
import { confirmSale, confirmSalePayPal } from "@/services"

export default function useSaleConfirmation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const confirmSaleTransaction = useCallback(async (saleId, transactionStatus) => {
    try {
      setLoading(true)
      setError(null)
      console.warn("[confirmar transacion en efectivo linea 13] id_venta:  "+ saleId + " estado de trans. "+transactionStatus)
      const saleConfirmationData = {
        id_venta: saleId,
        pago: {
          estado_trx: transactionStatus, // APROBADA, RECHAZADA, CANCELADA
        },
      }

      console.log("💰 [useSaleConfirmation] Confirmando venta:", saleConfirmationData)

      const response = await confirmSale(saleConfirmationData)
      console.warn("RESPUESTA DE RESPONSE: ",JSON.stringify(response,null,2))
      if (response.success) {
        console.log("✅ [useSaleConfirmation] Venta confirmada exitosamente:", response.data.data)
        return { success: true, data: response.data, message: response.message }
      } else {
        throw new Error(response.message || "Error al confirmar la venta")
      }
    } catch (err) {
      console.error("❌ [useSaleConfirmation] Error:", err)
      const errorMessage = err.message || "Error al confirmar la venta"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])






  const confirmPayPalSaleTransaction = useCallback(async (saleId, orderId) => {
    try {
      setLoading(true)
      setError(null)
      console.log("Llega id_venta 👉 " + saleId + " id_orden 👉 " + orderId + "\n")

      const saleConfirmationData = {
        
        id_venta: Number(saleId),
        id_orden: orderId,
      }


      const response = await confirmSalePayPal(saleConfirmationData) // response.data

      console.log("response "+ response.success + "Tipo "+ typeof(response.success))
      if (response.success === true) {
        console.log("response.confirmPayPalSaleTransaction")
        return { success: true, data: response.data, message: response.message }
      } else {
       
        throw new Error(response.message || "Error al confirmar la venta PayPal - 1")
      }
    } catch (err) {
     
      const errorMessage = err.message || "Error al confirmar la venta PayPal-2🤬"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    confirmSaleTransaction,
    confirmPayPalSaleTransaction,
    clearError,
  }
}



