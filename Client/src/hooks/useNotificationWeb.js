import { useState, useEffect, useCallback } from "react"
import { getNotifications, markNotificationAsRead } from "@/services"

export default function useNotificationWeb(uuidAuth) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!uuidAuth) {
      //console.warn("⚠️ [useNotificationWeb] No se proporcionó uuidAuth")
      return
    }

    setLoading(true)
    setError(null)

    try {
      
      const response = await getNotifications(uuidAuth)

      if (response?.success && Array.isArray(response.data)) {
        setNotifications(response.data)

        // Calcular notificaciones no leídas
        const unread = response.data.filter((notification) => !notification.leido).length
        setUnreadCount(unread)
      } else {
        //console.error("❌ [useNotificationWeb] Formato de respuesta inválido:", response)
        setError("Formato de respuesta inválido")
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      //console.error("❌ [useNotificationWeb] Error al cargar notificaciones:", err)
      setError(err.message || "Error al cargar notificaciones")
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [uuidAuth])

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notificacion === id ? { ...n, leido: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      console.error(`❌ No se pudo marcar como leída la notificación ${id}:`, error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.leido).map((n) => n.id_notificacion)
    try {
      await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)))
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, leido: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error("❌ No se pudieron marcar todas como leídas:", error)
    }
  }

  // Función para formatear fecha de notificación
  const formatNotificationDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Ahora"
      if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `Hace ${diffInHours}h`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `Hace ${diffInDays}d`

      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      //console.error("❌ [useNotificationWeb] Error al formatear fecha:", error)
      return "Fecha inválida"
    }
  }, [])

  // Cargar notificaciones al montar el hook o cambiar uuidAuth
  useEffect(() => {
    if (uuidAuth) {
      loadNotifications()
    }
  }, [uuidAuth, loadNotifications])

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    if (!uuidAuth) return

    const interval = setInterval(
      () => {
        loadNotifications()
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [uuidAuth, loadNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    formatNotificationDate,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  }
}
