import { useState, useMemo, useEffect } from "react"
import { Plus, Trash, Upload, X } from "lucide-react"
import { Button } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import useRegister from "@/hooks/useRegister"
import useAuthStore from "@/store/useAuthStore"
import { AdminLayout, NewUserForm, BulkUploadForm1, ShowConfirm } from "@/components"
import { DataTableCard } from "@/components/ui"
import { useSearchAndFilter } from "@/hooks/useSearchAndFilter"


import useUser from "@/hooks/useUser" // listar usuarios

const AdminUsersPage = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const { token, role } = useAuthStore()

  const [activeTab, setActiveTab] = useState("todos")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [file, setFile] = useState(null)

  const { handleRegister, loading: registerLoading, error: registerError } = useRegister()

  // hook para listar usuarios
  const {
    fetchUser, // traemos TODOS los usuarios
    removeUser, // remover un usuario
    loading: userLoading,
    error: userError,
    users: hookUsers,
    bulkUploadAndRegisterUsers,
  } = useUser()

  // Sistema de mensajes mejorado
  const [statusMessage, setStatusMessage] = useState("")
  const [messageType, setMessageType] = useState("success")

  const rowsPerPage = 10

  // Estado local para usuarios
  const [users, setUsers] = useState([])

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  // 🎯 FUNCIÓN PARA FORMATEAR FECHA DE ÚLTIMO ACCESO
  const formatLastAccess = (lastAccess) => {
    if (!lastAccess || lastAccess === "N/A") return "Nunca"

    try {
      const date = new Date(lastAccess)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "Ayer"
      if (diffDays <= 7) return `Hace ${diffDays} días`
      if (diffDays <= 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
      if (diffDays <= 365) return `Hace ${Math.ceil(diffDays / 30)} meses`
      return `Hace ${Math.ceil(diffDays / 365)} años`
    } catch (error) {
      return "Nunca"
    }
  }


  // 🎯 CONFIGURACIÓN DE FILTROS MEJORADOS PARA USUARIOS CON ÚLTIMO ACCESO
  const filterConfig = [
    {
      key: "tipo_usuario",
      type: "select",
      label: "Tipo de Usuario",
      placeholder: "Todos los tipos",
      options: [
        { value: "ADMINISTRADOR", label: "Administradores" },
        { value: "VENDEDOR", label: "Vendedores" },
        { value: "CLIENTE", label: "Clientes" },
      ],
    },
    // {
    //   key: "ultimo_acceso_categoria",
    //   type: "select",
    //   label: "Último Acceso",
    //   placeholder: "Todos los períodos",
    //   options: [
    //     { value: "nunca", label: "Nunca accedió" },
    //     { value: "reciente", label: "Últimos 7 días" },
    //     { value: "semanal", label: "Última semana" },
    //     { value: "mensual", label: "Último mes" },
    //     { value: "antiguo", label: "Más de 1 mes" },
    //   ],
    // },
    {
      key: "email_domain",
      type: "select",
      label: "Dominio Email",
      placeholder: "Todos los dominios",
      options: [
        { value: "@gmail.com", label: "Gmail" },
        { value: "@enruta.com", label: "EnRuta" },
        { value: "@hotmail.com", label: "Hotmail" },
        { value: "@yahoo.com", label: "Yahoo" },
        { value: "otros", label: "Otros dominios" },
      ],
    },
    
  ]

  // Función para mostrar mensajes
  const showMessage = (message, type = "success") => {
    setStatusMessage(message)
    setMessageType(type)

    const duration = type === "error" ? 10000 : 3500
    setTimeout(() => {
      setStatusMessage("")
      setMessageType("success")
    }, duration)
  }

  // 🎯 FUNCIÓN PARA CATEGORIZAR ÚLTIMO ACCESO
  const categorizeLastAccess = (lastAccess) => {
    if (!lastAccess || lastAccess === "N/A") return "nunca"

    try {
      const date = new Date(lastAccess)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 1) return "reciente"
      if (diffDays <= 7) return "semanal"
      if (diffDays <= 30) return "mensual"
      return "antiguo"
    } catch (error) {
      return "nunca"
    }
  }

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      console.log("🔄 [AdminUsersPage] Cargando usuarios...")
      const response = await fetchUser() // Sin filtro, trae todos los usuarios

      if (response && response.success && response.data) {
        // Transformar los datos para que coincidan con el formato esperado
        const transformedUsers = response.data.map((user) => {
          // Calcular campos adicionales para filtros
          const fullName = `${user.nombres} ${user.apellidos}`
          const emailDomain = user.email ? user.email.substring(user.email.indexOf("@")) : ""
          const hasNumbersInName = /\d/.test(fullName)
          const nameLength = fullName.length
          const lastAccessFormatted = formatLastAccess(user.ultimo_acceso)
          const lastAccessCategory = categorizeLastAccess(user.ultimo_acceso)

          let nameLengthCategory = "medium"
          if (nameLength <= 10) nameLengthCategory = "short"
          else if (nameLength > 20) nameLengthCategory = "long"

          return {
            nombres: user.nombres,
            apellidos: user.apellidos,
            name: fullName,
            email: user.email,
            ci: user.ci?.toString() || "",
            tipo_usuario: user.tipo_usuario,
            status: user.activo ? "Activo" : "Inactivo",
            lastAccess: lastAccessFormatted,
            lastAccessRaw: user.ultimo_acceso,
            activo: user.activo,
            // Campos adicionales para filtros
            email_domain: emailDomain,
            name_length: nameLengthCategory,
            has_numbers_in_name: hasNumbersInName,
            ci_numeric: Number.parseInt(user.ci) || 0,
            ultimo_acceso_categoria: lastAccessCategory,
          }
        })

        setUsers(transformedUsers)
        console.log("✅ [AdminUsersPage] Usuarios cargados:", transformedUsers.length)
      } else {
        console.error("❌ [AdminUsersPage] Error al cargar usuarios: Respuesta inválida")
        showMessage("Error al cargar los usuarios", "error")
      }
    } catch (error) {
      console.error("❌ [AdminUsersPage] Error al cargar usuarios:", error)
      showMessage("Error al cargar los usuarios", "error")
    }
  }


  const getTemplateConfig = () => {
    const tabNames = {
      todos: "Todos los Usuarios",
      vendedores: "Vendedores",
      administradores: "Administradores",
      clientes: "Clientes",
    }

    return {
      title: `Plantilla de ${tabNames[activeTab]}`,
      type: "users-template",
      columns: [
        { key: "nombres", header: "Nombres" },
        { key: "apellidos", header: "Apellidos" },
        { key: "email", header: "Email" },
        { key: "ci", header: "Cédula" },
        { key: "tipo_usuario", header: "Tipo de Usuario" },
      ],
      sampleData: [
        { nombres: "Juan", apellidos: "Pérez", email: "juan@example.com", ci: "12345678", tipo_usuario: "VENDEDOR" },
        { nombres: "María", apellidos: "García", email: "maria@example.com", ci: "87654321", tipo_usuario: "CLIENTE" },
      ],
      requiredFields: ["nombres", "apellidos", "email", "ci", "tipo_usuario"],
    }
  }

  console.log("Tipo de usuario-> ", role)

  // Filtrar usuarios según la pestaña activa ANTES de la búsqueda
  const filteredByTab = useMemo(() => {
    if (activeTab === "vendedores") {
      return users.filter((user) => user.tipo_usuario === "VENDEDOR")
    }
    if (activeTab === "administradores") {
      return users.filter((user) => user.tipo_usuario === "ADMINISTRADOR")
    }
    if (activeTab === "clientes") {
      return users.filter((user) => user.tipo_usuario === "CLIENTE")
    }
    return users // "todos"
  }, [users, activeTab])

  // Configuración de campos de búsqueda
  const searchFields = [
    "nombres",
    "apellidos",
    "name",
    "email",
    "ci",
    // Función personalizada para buscar por tipo de usuario
    (user) => {
      if (user.tipo_usuario === "ADMINISTRADOR") return "administrador admin"
      if (user.tipo_usuario === "VENDEDOR") return "vendedor seller"
      if (user.tipo_usuario === "CLIENTE") return "cliente customer"
      return ""
    },
    // Función para buscar por estado
    (user) => (user.status === "Activo" || user.activo ? "activo active" : "inactivo inactive"),
    // Función para buscar por último acceso
    (user) => user.lastAccess || "",
  ]

  // Opciones de búsqueda
  const searchOptions = {
    caseSensitive: false,
    exactMatch: false,
    searchByWords: true,
  }

  // Hook de búsqueda y filtrado
  const {
    searchQuery,
    setSearchQuery,
    filteredData: searchedUsers,
    clearSearch,
    hasActiveSearch,
    resultCount,
    originalCount,
  } = useSearchAndFilter(filteredByTab, searchFields, searchOptions)

  // Paginación
  const totalPages = Math.ceil(searchedUsers.length / rowsPerPage)
  const paginatedUsers = searchedUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Reset página cuando cambia la búsqueda o pestaña
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  

  

  // Función para manejar la eliminación de usuario
  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  // Función para confirmar la eliminación
  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      console.log("🗑️ [AdminUsersPage] Eliminando usuario:", userToDelete)

      let userData = {}
      if (userToDelete.email) {
        console.log("🔄 Eliminando por email")
        userData = { email: userToDelete.email }
      } else if (userToDelete.ci) {
        console.log("🔄 Eliminando por cédula")
        userData = { ci: userToDelete.ci }
      } else {
        showMessage("No se puede eliminar: datos insuficientes", "error")
        return false
      }

      console.log("userData: ", userData)
      console.log("Token", token)

      const response = await removeUser(userData, token) // token del admin
      console.log("response: ", JSON.stringify(response, null, 2))
      if (response && response.success) {
        // Mostrar notificación de éxito
        const tipoTexto =
          userToDelete.tipo_usuario === "ADMINISTRADOR"
            ? "Administrador"
            : userToDelete.tipo_usuario === "VENDEDOR"
              ? "Vendedor"
              : "Cliente"

        // Recargar usuarios con un pequeño delay para asegurar que se actualice
        setTimeout(async () => {
          await loadUsers()
        }, 2000) // 2 segundos

        showMessage(`El usuario ${tipoTexto} ${userToDelete.name} se ha eliminado con éxito`, "success")

        return true
      } else {
        const errorMsg = response?.message || response?.error || "Error al eliminar el usuario"
        showMessage(errorMsg, "error")
        return false
      }
    } catch (error) {
      console.error("❌ [AdminUsersPage] Error al eliminar usuario:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido"
      showMessage(`Error al eliminar el usuario: ${errorMessage}`, "error")
      return false
    } finally {
      setShowDeleteConfirm(false)
      setUserToDelete(null)
    }
  }

  // Función para cancelar la eliminación
  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }

  // Columnas para DataTable con colores actualizados -
  const columns = [
    {
      key: "name",
      header: "NOMBRE Y APELLIDO",
      render: (user) => (
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              isDarkMode ? "bg-neutral-700" : "bg-neutral-200"
            }`}
          >
            <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-neutral-700"}`}>
              {user.name?.charAt(0) || "U"}
            </span>
          </div>
          <span className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      render: (user) => (
        <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>{user.email}</span>
      ),
    },
    {
      key: "ci",
      header: "CÉDULA",
      render: (user) => (
        <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>{user.ci}</span>
      ),
    },
    {
      key: "role",
      header: "ROL",
      render: (user) => {
        let colorClass = ""
        let roleText = ""

        if (user.tipo_usuario === "ADMINISTRADOR") {
          colorClass = isDarkMode
            ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
            : "bg-blue-50 text-blue-700 border border-blue-200"
          roleText = "Administrador"
        } else if (user.tipo_usuario === "VENDEDOR") {
          colorClass = isDarkMode
            ? "bg-orange-900/30 text-orange-300 border border-orange-700/50"
            : "bg-orange-50 text-orange-700 border border-orange-200"
          roleText = "Vendedor"
        } else if (user.tipo_usuario === "CLIENTE") {
          colorClass = isDarkMode
            ? "bg-green-900/30 text-green-300 border border-green-700/50"
            : "bg-green-50 text-green-700 border border-green-200"
          roleText = "Cliente"
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {roleText}
          </span>
        )
      },
    },
    // {
    //   key: "activo",
    //   header: "ESTADO",
    //   render: (user) => (
    //     <span
    //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    //         user.activo
    //           ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    //           : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    //       }`}
    //     >
    //       {user.activo ? "Activo" : "Inactivo"}
    //     </span>
    //   ),
    // },
    //  NUEVA COLUMNA DE ÚLTIMO ACCESO
    // {
    //   key: "lastAccess",
    //   header: "ÚLTIMO ACCESO",
    //   render: (user) => {
    //     const getAccessColor = (lastAccess) => {
    //       if (lastAccess === "Nunca") return "text-red-500 dark:text-red-400"
    //       if (lastAccess.includes("Ayer") || lastAccess.includes("días")) return "text-green-500 dark:text-green-400"
    //       if (lastAccess.includes("semanas")) return "text-yellow-500 dark:text-yellow-400"
    //       return "text-orange-500 dark:text-orange-400"
    //     }

    //     return <span className={`text-xs font-medium ${getAccessColor(user.lastAccess)}`}>{user.lastAccess}</span>
    //   },
    // },
  ]

  // Acciones para DataTable
  const actions = (user) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className={`cursor-pointer ${isDarkMode ? "text-neutral-400 hover:text-red-400" : "text-neutral-500 hover:text-red-600"}`}
        onClick={() => handleDeleteUser(user)}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )

  // Manejo de creación de usuario
  const handleUserCreated = async (userData) => {
    try {
      console.log("🎯 [AdminUsersPage] Creando usuario interno:", JSON.stringify(userData, null, 2))

      const newUser = {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        ci: userData.ci,
        tipo_usuario: userData.tipo_usuario,
        fecha_nacimiento: userData.fecha_nacimiento,
      }

      const response = await handleRegister({ ...newUser })

      if (response) {
        console.log("✅[AdminUsersPage.jsx] Usuario creado exitosamente")
        setShowNewUserModal(false)

        const tipoTexto = userData.tipo_usuario === "ADMINISTRADOR" ? "Administrador" : "Vendedor"
        showMessage(
          `Usuario ${userData.nombres} ${userData.apellidos} creado exitosamente como ${tipoTexto}`,
          "success",
        )

        // Recargar usuarios
        setTimeout(async () => {
          await loadUsers()
        }, 500)
        return true
      } else {
        showMessage("Error al crear el usuario: No se recibió respuesta del servidor", "error")
        return false
      }
    } catch (error) {
      console.error("❌ [AdminUsersPage] Error al crear usuario:", error)
      let errorMessage = "Error desconocido al crear el usuario"

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

      // Detectar errores específicos
      if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exist")) {
        errorMessage = "El email ya está registrado en el sistema"
      } else if (
        errorMessage.toLowerCase().includes("cedula") ||
        errorMessage.toLowerCase().includes("cédula") ||
        errorMessage.toLowerCase().includes("ci")
      ) {
        errorMessage = "La cédula ya está registrada en el sistema"
      }

      showMessage(`Error al crear el usuario: ${errorMessage}`, "error")
      throw error
    }
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  // Manejo de carga masiva - ARREGLADO
  const handleBulkUpload = async (file) => {
    try {
      if (!file) {
        showMessage("Por favor selecciona un archivo", "error")
        return false
      }


      const { name } = file

      if ( name !== "omnibus.csv"){
        showMessage("El nombre del archivo debe ser 'usuarios.csv' ", "error")
        setShowBulkUploadModal(false)
        return false
      }

    

      const response = await bulkUploadAndRegisterUsers(file)
      console.log("📋 [AdminUsersPage] Respuesta completa:", JSON.stringify(response, null, 2))

      if (response?.success) {
        await loadUsers()
        showMessage(response.message || "Carga masiva completada con éxito", "success")
        setShowBulkUploadModal(false)
        return true
      } else {
        showMessage(response?.error || "Error al procesar la carga masiva", "error")
        setShowBulkUploadModal(false)
        return false
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido en carga masiva"
      showMessage(`Error: ${errorMessage}`, "error")
      setShowBulkUploadModal(false)
      return false
    }
  }

  // Función para cambiar pestaña y limpiar búsqueda
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    clearSearch()
    setCurrentPage(1)
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Gestión de Usuarios Internos
            </h1>
            <p className={`mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Administra los usuarios del sistema (administradores y vendedores)
            </p>
            {/* Estadísticas de búsqueda */}
            {hasActiveSearch && (
              <p className={`text-sm mt-1 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
                Mostrando {resultCount} de {originalCount} usuarios para "{searchQuery}"
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowNewUserModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
            <Button
              variant="outline"
              className={`cursor-pointer ${isDarkMode ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}
              onClick={() => setShowBulkUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Carga Masiva
            </Button>
            
          </div>
        </div>

        {/* Pestañas activas con contador */}
        <div className={`mb-6 border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "todos"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => handleTabChange("todos")}
            >
              Todos ({users.length})
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "vendedores"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => handleTabChange("vendedores")}
            >
              Vendedores ({users.filter((u) => u.tipo_usuario === "VENDEDOR").length})
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "administradores"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => handleTabChange("administradores")}
            >
              Administradores ({users.filter((u) => u.tipo_usuario === "ADMINISTRADOR").length})
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "clientes"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => handleTabChange("clientes")}
            >
              Clientes ({users.filter((u) => u.tipo_usuario === "CLIENTE").length})
            </button>
          </div>
        </div>

        {/* Indicador de búsqueda activa */}
        {hasActiveSearch && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 rounded-lg border ${
              isDarkMode
                ? "bg-orange-900/20 border-orange-800 text-orange-300"
                : "bg-orange-50 border-orange-200 text-orange-800"
            }`}
          >
            <span className="text-sm">
              Búsqueda activa: <strong>"{searchQuery}"</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className={`h-6 w-6 p-0 ${isDarkMode ? "hover:bg-orange-800" : "hover:bg-orange-100"}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Mostrar loading mientras se cargan los usuarios */}
        {userLoading ? (
          <div className={`flex justify-center items-center py-8 ${isDarkMode ? "text-white" : "text-neutral-600"}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p>Cargando usuarios...</p>
            </div>
          </div>
        ) : (
          <DataTableCard
            columns={columns}
            data={filteredByTab} 
            actions={actions}
            isDarkMode={isDarkMode}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por nombre, email, cédula, rol, estado o último acceso..."
            statusMessage={statusMessage}
            messageType={messageType}
            totalItems={searchedUsers.length}
            hasAction={true}
            hasSearch={true}
            hasFilter={false}
            sectionFilter={true}
            filterConfig={filterConfig}
          />
        )}

        {/* Modal de confirmación para eliminar usuario */}
        {showDeleteConfirm && userToDelete && (
          <ShowConfirm
            open={showDeleteConfirm}
            title="¿Confirmar eliminación de usuario?"
            data={[
              { label: "Nombre", value: userToDelete.name },
              { label: "Email", value: userToDelete.email },
              { label: "Cédula", value: userToDelete.ci },
              { label: "Tipo", value: userToDelete.tipo_usuario },
              { label: "Estado", value: userToDelete.status },
              { label: "Último Acceso", value: userToDelete.lastAccess },
            ]}
            onAccept={confirmDeleteUser}
            onCancel={cancelDeleteUser}
            acceptText="Eliminar"
            cancelText="Cancelar"
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal de formulario de usuario */}
        {showNewUserModal && (
          <NewUserForm
            onCancel={() => setShowNewUserModal(false)}
            onRegister={handleUserCreated}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Modal de carga masiva */}
        {showBulkUploadModal && (
          <BulkUploadForm1
            title="Carga Masiva de Usuarios"
            description="Sube un archivo CSV con los usuarios a registrar"
            templateConfig={getTemplateConfig()}
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUploadModal(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage
