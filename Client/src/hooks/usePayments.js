
import { useState, useCallback } from "react"
import { requestMercadoPagoParams, requestPaymentMethods, requestPaymentParams } from "@/services/"

export default function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])



  const getPaymentMethods = useCallback(async (isSellerForm = false, paymentData = null) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 [usePayment] Solicitando métodos de pago:", { isSellerForm, paymentData })

      const response = await requestPaymentMethods(paymentData)  // response = response.data

      if (response.success && response.data) {
        let availableMethods = response.data

        // Si no es del vendedor, filtrar solo métodos online (no efectivo)
        if (!isSellerForm) {
          availableMethods = response.data.filter((method) => method.nombre.toLowerCase() !== "efectivo")
        }

        setPaymentMethods(availableMethods)
        console.log("✅ [usePayment] Métodos de pago filtrados:", availableMethods)
        return { success: true, data: availableMethods }
      } else {
        throw new Error(response.message || "Error al obtener métodos de pago")
      }
    } catch (err) {
      console.error("❌ [usePayment] Error fetching payment methods:", err)
      setError("Error al obtener los métodos de pago")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const initiateMercadoPagoPayment = async (paymentData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await requestMercadoPagoParams(paymentData)
      return response
    } catch (err) {
      console.error("Error initiating Mercado Pago payment:", err)
      setError("Error al iniciar el pago con Mercado Pago")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const requestPaymentParameters = async (paymentData) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 [usePayment] Solicitando parámetros de pago:", paymentData)
      const response = await requestPaymentParams(paymentData)
      console.warn("✅ [usePayment - requestPaymentParameters] Parámetros de pago recibidos:", response)
      console.info("😎 Response.data: ",response.data)
      return response.data
    } catch (err) {
      console.error("❌ [usePayment] Error al solicitar parámetros de pago:", err)
      setError("Error al solicitar parámetros de pago")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    paymentMethods,
    getPaymentMethods,
    initiateMercadoPagoPayment,
    requestPaymentParameters,
  }
}
