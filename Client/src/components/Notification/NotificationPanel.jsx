import { useState, useRef, useEffect } from "react"
import { Bell, X, Clock, AlertCircle } from "lucide-react"
import useNotificationWeb from "@/hooks/useNotificationWeb"

export default function NotificationPanel({ uuidAuth, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)

  const { notifications, loading, error, unreadCount, formatNotificationDate, refresh, markAsRead, markAllAsRead } = useNotificationWeb(uuidAuth)

 
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  const getNotificationIcon = (mensaje) => {
    if (mensaje.includes("devolvieron")) return "💰"
    if (mensaje.includes("cerraron")) return "🚍"
    if (mensaje.includes("viaje")) return "🚌"
    if (mensaje.includes("pasaje")) return "🎫"
    return "📢"
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 w-10 rounded-full flex items-center justify-center relative transition-colors
          ${isDarkMode ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-500 hover:bg-neutral-100"} cursor-pointer`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 max-w-sm rounded-lg shadow-lg border z-50 ${
            isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
          } flex flex-col max-h-96`}
        >
          {/* Header del panel */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between
            ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}
          >
            <div className="flex items-center space-x-2">
              <Bell className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-neutral-700"}`} />
              <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Botón refresh */}
              <button
                onClick={refresh}
                disabled={loading}
                className={`p-1 rounded-md transition-colors
                  ${isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-700" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"}
                  ${loading ? "animate-spin" : ""} cursor-pointer`}
                title="Actualizar"
              >
                <Clock className="h-4 w-4" />
              </button>

              {/* Botón marcar todas como leidas */}
              {/* {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs underline px-1 transition-colors ${
                    isDarkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"
                  }`}
                >
                  Marcar todas como leídas
                </button>
              )} */}

              {/* Botón cerrar */}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-md transition-colors
                  ${isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-700" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contenido del panel */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className={`text-sm mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                  Cargando notificaciones...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
                <button onClick={refresh} className="mt-2 text-xs text-orange-500 hover:text-orange-600 cursor-pointer">
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-6 text-center">
                <Bell className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? "text-neutral-600" : "text-neutral-400"}`} />
                <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                  No tienes notificaciones
                </p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification.id_notificacion}-${index}`}
                    onClick={() => !notification.leido && markAsRead(notification.id_notificacion)}
                    className={`p-4 transition-colors cursor-pointer
                      ${
                        !notification.leido
                          ? isDarkMode
                            ? "bg-orange-900/20 hover:bg-orange-800/30"
                            : "bg-orange-50 hover:bg-orange-100"

                          : isDarkMode
                            ? "hover:bg-neutral-700"
                            : "hover:bg-neutral-50"
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icono de la notificación */}
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">{getNotificationIcon(notification.mensaje)}</span>
                      </div>

                      {/* Contenido de la notificación */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-relaxed
                          ${isDarkMode ? "text-neutral-200" : "text-neutral-800"}
                          ${!notification.leido ? "font-medium" : ""}`}
                        >
                          {notification.mensaje}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                            {formatNotificationDate(notification.fechaEnvio)}
                          </p>

                          {!notification.leido && (
                            <div className="flex items-center space-x-1">
                              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                              <span className={`text-xs ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
                                Nueva
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del panel */}
          {!loading && !error && notifications.length > 0 && (
            <div
              className={`px-4 py-2 border-t text-center ${
                isDarkMode ? "border-neutral-700 bg-neutral-900" : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <p className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                {notifications.length} notificación{notifications.length !== 1 ? "es" : ""} total
              </p>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs mt-1 underline transition-colors ${
                    isDarkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"
                  }`}
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
