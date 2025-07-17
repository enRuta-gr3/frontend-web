import { useEffect, useState } from "react"
import { Plus, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import { SellerLayout, NewCustomerForm } from "@/components"
import { DataTableCard } from "@/components/ui"
import useRegister from "@/hooks/useRegister"
import useUser from "@/hooks/useUser"
import { useSearchAndFilter } from "@/hooks/useSearchAndFilter" // Eliminar el hook useSearchAndFilter ya que DataTableCard maneja la búsqueda internamente.
import { ShowConfirm } from "@/components/Forms"

/**
 * Componente SellerUsersPage
 *
 * Página para la gestión de usuarios (clientes).
 * Permite visualizar, buscar, paginar, crear y eliminar usuarios.
 * Incluye verificación de descuentos y formularios modales para alta de clientes.
 *
 * @returns {JSX.Element}
 */
export default function SellerUsersPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const [activeTab, setActiveTab] = useState("clientes")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users, setUsers] = useState([]) // Estado para almacenar la lista de usuarios

  // Sistema de mensajes mejorado
  const [statusMessage, setStatusMessage] = useState("")
  const [messageType, setMessageType] = useState("success") // "success" | "error"
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)

  const rowsPerPage = 10

  const { handleRegister, loading, error } = useRegister()

  // hook para listar usuarios
  const {
    fetchUser, // traemos SOLO CLIENTES
    loading: userLoading,
    error: userError,
    users: hookUsers,
    validateUserDiscount,
    searchUserByCedula,
  } = useUser()

  useEffect(() => {
    loadUsers()
  }, [])

  // busqueda y filtro avanzado
  // Opciones de búsqueda
  const searchOptions = {
    caseSensitive: false,
    exactMatch: false,
    searchByWords: true,
  }

  const searchFields = [
    "nombres",
    "apellidos",
    "name", // nombre completo ya combinado
    "email",
    "ci",
  ]

  // Hook de búsqueda y filtrado
  const {
    searchQuery,
    setSearchQuery,
    filteredData: searchedUsers,
    clearSearch,
    hasActiveSearch,
    resultCount,
    originalCount,
  } = useSearchAndFilter(users, searchFields, searchOptions)

  // 🎯 CALCULAR PAGINACIÓN CORRECTAMENTE
  // ❌ ELIMINAR ESTAS LÍNEAS:
  // const totalPages = Math.ceil(searchedUsers.length / rowsPerPage)
  // const paginatedUsers = searchedUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  // const totalItems = searchedUsers.length

  // Total de items para la paginación
  const totalItems = users.length

  // 🎯 CONFIGURACIÓN DE FILTROS PARA USUARIOS
  const filterConfig = [
    {
      key: "tipo_descuento",
      label: "Tipo Descuento",
      type: "select",
      placeholder: "Todos los tipo descuento",
      options: [
        { value: "Ninguno", label: "Ninguno" },
        { value: "Estudiante", label: "Estudiante" },
        { value: "Jubilado", label: "Jubilado" },
      ],
    },
    {
      key: "estado_descuento",
      label: "Estado Descuento",
      type: "select",
      placeholder:"Todos los estados",
      options: [
        { value: "verificado", label: "Verificado" },
        { value: "no_verificado", label: "No Verificado" },
      ],
    },
  ]

  // Función para cargar usuarios tipo CLIENTE
  const loadUsers = async () => {
    try {
      console.log("🔄 [SellerUserPage] Cargando usuarios...")
      const response = await fetchUser()
      if (response && response.success && response.data) {
        // Filtrar SOLO usuarios tipo CLIENTE antes de mapear
        const transformedUsers = response.data
          .filter((user) => user.tipo_usuario === "CLIENTE")
          .map((user, index) => {
            // Determinar tipo de descuento basado en los campos booleanos
            let tipoDescuento = "Ninguno"
            if (user.esEstudiante) {
              tipoDescuento = "Estudiante"
            } else if (user.esJubilado) {
              tipoDescuento = "Jubilado"
            }

            return {
              id: user.id || `user-${index}`, // Asegurar que tenga un ID único
              nombres: user.nombres,
              apellidos: user.apellidos,
              name: `${user.nombres} ${user.apellidos}`,
              email: user.email,
              ci: user.ci?.toString() || "",
              tipo_descuento: tipoDescuento, // Calculado basado en esEstudiante/esJubilado
              activo: user.activo,
              lastAccess: "N/A", // Agregar campo faltante
              discountVerifed: user.estado_descuento || false, // Usar el estado_descuento del backend
              esEstudiante: user.esEstudiante,
              esJubilado: user.esJubilado,
            }
          })

        setUsers(transformedUsers)
        console.log("✅ [SellerUsersPage] Usuarios cargados:", transformedUsers.length)
        console.log("📋 [SellerUsersPage] Usuarios transformados:", transformedUsers)
      } else {
        console.error("❌ [SellerUsersPage] Error al cargar usuarios: Respuesta inválida")
        showMessage("Error al cargar los usuarios", "error")
      }
    } catch (error) {
      console.error("❌ [SellerUserPage] Error al cargar usuarios:", error)
      showMessage("Error al cargar los usuarios", "error")
    }
  }

  // Función para mostrar mensajes con tipo y duración específica
  const showMessage = (message, type = "success") => {
    setStatusMessage(message)
    setMessageType(type)
    // Duración según el tipo de mensaje
    const duration = type === "error" ? 10000 : 3500 // 10 segundos para errores, 3.5 para éxito
    setTimeout(() => {
      setStatusMessage("")
      setMessageType("success") // Reset al tipo por defecto
    }, duration)
  }

  const confirmDiscountVerification = (user) => {
    setPendingUser(user)
    setConfirmVisible(true)
  }

  const handleConfirmAccept = async () => {
    if (pendingUser) {
      await handleDiscountVerification(pendingUser)
      setConfirmVisible(false)
      setPendingUser(null)
    }
  }

  const handleConfirmCancel = () => {
    setConfirmVisible(false)
    setPendingUser(null)
  }

  const handleDiscountVerification = async (user) => {
    const usuario = await searchUserByCedula(user.ci)
    console.log("->", usuario)
    try {
      const result = await validateUserDiscount(usuario.data.uuidAuth)
      if (result?.success) {
        setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? { ...u, discountVerifed: true } : u)))
        showMessage(`Descuento verificado para ${user.name}`, "success")
      } else {
        showMessage(`Error al verificar el descuento de ${user.name}`, "error")
      }
    } catch (error) {
      showMessage(`Error al verificar descuento: ${error.message}`, "error")
    }
  }

  // Columnas para DataTable
  const columns = [
    {
      key: "name",
      header: "NOMBRE",
      render: (user) => (
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              isDarkMode ? "bg-neutral-700" : "bg-neutral-200"
            }`}
          >
            <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"}`}>
              {user.name.charAt(0)}
            </span>
          </div>
          <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      render: (user) => <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>{user.email}</span>,
    },
    {
      key: "ci",
      header: "CI",
      render: (user) => <span className={`${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>{user.ci}</span>,
    },
    {
      key: "tipo_descuento",
      header: "TIPO DESCUENTO",
      render: (user) => {
        const tipoDescuento = user.tipo_descuento || "Ninguno"
        return (
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                tipoDescuento === "Jubilado"
                  ? "bg-orange-100 text-orange-800"
                  : tipoDescuento === "Estudiante"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {tipoDescuento}
            </span>
          </div>
        )
      },
    },
    {
      key: "estado_descuento",
      header: "ESTADO DESCUENTO",
      render: (user) => {
        // Solo mostrar estado para usuarios con descuento
        if (user.tipo_descuento === "Jubilado" || user.tipo_descuento === "Estudiante") {
          return (
            <div className="flex items-center justify-center w-full">
              {user.discountVerifed ? (
                <div className="flex items-center text-green-600">
                  <CheckCheck className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Verificado</span>
                </div>
              ) : (
                <span className="text-xs text-red-500 font-medium">No Verificado</span>
              )}
            </div>
          )
        }
        return (
          <div className="flex justify-center w-full">
            <span className="text-xs text-gray-400">N/A</span>
          </div>
        )
      },
    },
  ]

  // ✅ Acciones para DataTable - Solo verificar descuentos
  const actions = (user) => {
    // Solo mostrar acción para usuarios con descuento
    if (user.tipo_descuento === "Jubilado" || user.tipo_descuento === "Estudiante") {
      return (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className={`cursor-pointer ${
              user.discountVerifed
                ? "text-green-500"
                : isDarkMode
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
            }`}
            onClick={() => confirmDiscountVerification(user)}
            title={user.discountVerifed ? "Descuento verificado" : "Verificar descuento"}
            disabled={user.discountVerifed} // Deshabilitar si ya está verificado
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    // Para usuarios sin descuento, mostrar placeholder
    return (
      <div className="flex items-center justify-center">
        <span className="text-xs text-gray-400">-</span>
      </div>
    )
  }

  // Log para debugging de paginación
  console.log("🔍 [SellerUsersPage] Estado de paginación:", {
    totalUsers: users.length,
    searchedUsers: users.length,
    currentPage,
    totalPages: Math.ceil(users.length / rowsPerPage),
    totalItems: users.length,
    paginatedUsersCount: users.length,
    paginatedUsers: users.map((u) => ({ name: u.name, tipo_descuento: u.tipo_descuento })),
  })

  const handleUserCreated = async (userData) => {
    // parseamos los datos del cliente
    const clientData = {
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      fecha_nacimiento: userData.fecha_nacimiento,
      ci: userData.ci,
      esJubilado: userData.esJubilado,
      esEstudiante: userData.esEstudiante,
      contraseña: userData.contraseña,
      tipo_usuario: userData.tipo_usuario, // CLIENTE
      estado_descuento: userData.esJubilado || userData.esEstudiante, // si el cliente es registrado por un vendedor y su tipo descuento es jubilado o estudiante, entonces queda verificado
    }

    // llamamos al hook de registro
    try {
      const response = await handleRegister({ ...clientData })
      if (response) {
        // si fue exitosa entonces mostramos mensaje de éxito
        console.log("✅[SellerUsersPage.jsx] Usuario creado exitosamente:", JSON.stringify(clientData, null, 2))
        setShowNewUserModal(false)
        // Recargar la lista de usuarios
        await loadUsers()
        showMessage(`Cliente ${userData.nombres} ${userData.apellidos} creado exitosamente`, "success")
      } else {
        // Error en la respuesta
        console.error("❌[SellerUsersPage.jsx] Error al crear el usuario:", response?.error)
        showMessage(`Error al crear el cliente: ${error || "Error al crear cliente"}. Inténtalo de nuevo.`, "error")
        return
      }
    } catch (error) {
      console.error("❌[SellerUsersPage.jsx] Error al crear el usuario:", error)
      let errorMessage = "Error desconocido"

      // Obtener mensaje de error del backend
      if (error?.response?.data?.data) {
        errorMessage = error.response.data.data
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      showMessage(`Error al crear el cliente: ${errorMessage}.`, "error")
    }
  }

  return (
    <SellerLayout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Gestión de Usuarios
            </h1>
            <p className={`mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Administra los clientes del sistema
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowNewUserModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Alta cliente
            </Button>
          </div>
        </div>

        {/* active tabs */}
        <div className={`mb-6 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "clientes"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveTab("clientes")}
            >
              Clientes ({users.length})
            </button>
          </div>
        </div>

        {/* Loading state */}
        {userLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>Cargando usuarios...</span>
          </div>
        )}

        {/* ✅ Tabla CON acciones (solo verificar descuentos), CON búsqueda, CON filtros */}
        {!userLoading && (
          <DataTableCard
            columns={columns}
            data={users} // ✅ PASAR TODOS LOS DATOS SIN FILTRAR
            actions={actions}
            isDarkMode={isDarkMode}
            currentPage={currentPage}
            totalPages={Math.ceil(users.length / rowsPerPage)} // Solo para referencia
            totalItems={users.length} // Solo para referencia
            onPageChange={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar usuarios por ci, nombre o email "
            statusMessage={statusMessage}
            messageType={messageType}
            hasAction={true}
            hasSearch={true}
            hasFilter={false}
            sectionFilter={true}
            filterConfig={filterConfig}
            rowsPerPage={rowsPerPage} // ✅ PASAR rowsPerPage
          />
        )}

        {/* User Form Modal */}
        {showNewUserModal && (
          <NewCustomerForm
            onCancel={() => setShowNewUserModal(false)}
            onRegister={handleUserCreated}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      <ShowConfirm
        open={confirmVisible}
        title="¿Confirmar verificación de descuento?"
        data={
          pendingUser
            ? [
                { label: "Nombre", value: pendingUser.name },
                { label: "CI", value: pendingUser.ci },
                { label: "Tipo de descuento", value: pendingUser.tipo_descuento },
              ]
            : []
        }
        onAccept={handleConfirmAccept}
        onCancel={handleConfirmCancel}
        isDarkMode={isDarkMode}
        acceptText="Verificar"
        cancelText="Cancelar"
      />
    </SellerLayout>
  )
}
