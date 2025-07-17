import { useState, useRef, useEffect } from "react"
import { AdminLayout } from "@/components"
import { Card, CardContent } from "@/components/ui"
import { Button } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Pie } from "react-chartjs-2"
import { Users, UserCheck, UserX, AlertCircle, FileText, Download } from "lucide-react"
import useUserStats from "@/hooks/stats/useUserStats"
import { exportToCSV } from "@/lib/csvGenerator"
import { generateAndDownloadStatsPDF } from "@/lib/pdfStatsGenerator"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function AdminStatsUsers() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const chartRef = useRef(null)
  const exportBarRef = useRef(null)
  const exportPieRef = useRef(null)

  const [activeView, setActiveView] = useState("purchaseAverage")

  const { loading, error, cantidadUsuarios, actividadUsuarios, promedioCompras, refreshAllStats } = useUserStats()

  useEffect(() => {
    refreshAllStats()
  }, [refreshAllStats])

  const purchaseAverageData = (promedioCompras || [])
    .filter((user) => user.promedio > 0)
    .sort((a, b) => b.promedio - a.promedio)

  const chartData = {
    labels: purchaseAverageData.map((u) => u.nombre),
    datasets: [
      {
        label: "Promedio de Compra (UYU)",
        data: purchaseAverageData.map((u) => u.promedio),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderRadius: 8,
      },
    ],
  }

  const barOptions = {
    maintainAspectRatio: false,
    indexAxis: "x",
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: isDarkMode ? "#e5e5e5" : "#374151" },
        grid: { color: isDarkMode ? "#374151" : "#e5e7eb" },
      },
      y: {
        ticks: { color: isDarkMode ? "#e5e5e5" : "#374151" },
        grid: { display: false },
      },
    },
  }

  const activeUsersData = {
    labels: ["Usuarios Activos", "Usuarios Inactivos"],
    datasets: [
      {
        data: [actividadUsuarios?.totalActivos ?? 0, actividadUsuarios?.totalInactivos ?? 0],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: [isDarkMode ? "#1f2937" : "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const usersByRoleData = {
    labels: ["Clientes", "Vendedores", "Administradores"],
    datasets: [
      {
        data: [
          cantidadUsuarios?.totalClientes ?? 0,
          cantidadUsuarios?.totalVendedores ?? 0,
          cantidadUsuarios?.totalAdministradores ?? 0,
        ],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(249, 115, 22, 0.8)", "rgba(168, 85, 247, 0.8)"],
        borderColor: [isDarkMode ? "#1f2937" : "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDarkMode ? "#e5e5e5" : "#374151",
          font: { size: 12 },
          padding: 20,
        },
      },
    },
  }

  const exportBarOptions = {
    ...barOptions,
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    scales: {
      x: {
        ...barOptions.scales.x,
        ticks: { color: "#374151" }, // gris oscuro
        grid: { color: "#e5e7eb" },
      },
      y: {
        ...barOptions.scales.y,
        ticks: { color: "#374151" },
      },
    },
  }

  const exportPieOptions = {
    ...pieOptions,
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151", // gris oscuro
          font: { size: 12 },
          padding: 20,
        },
      },
    },
  }

  const handleDownloadPDF = () => {
    const today = new Date()
    const formattedDateForFile = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`

    const chartImage = 
    activeView === "purchaseAverage"
      ? exportBarRef.current?.toBase64Image()
      : exportPieRef.current?.toBase64Image()

    let config = {}

    if (activeView === "purchaseAverage") {
      const topUser = purchaseAverageData.length > 0 ? purchaseAverageData[0] : null
      config = {
        title: "Promedio de Compras por Usuario",
        period: `${today.getFullYear()}`,
        summary: { 
          "Total de usuarios con compras": purchaseAverageData.length,
          "Promedio general": (purchaseAverageData.reduce((acc, user) => acc + user.promedio, 0) / (purchaseAverageData.length || 1)).toFixed(2),
          "Mejor cliente": topUser?.nombre ?? "N/A"
        },
        charts: [
          {
            title: "Top Usuarios por Promedio de Compra",
            image: chartImage,
            imageWidth: 130,
            imageHeigth: 500,
          },
        ],
        tables: [
          {
            title: "Detalle de Promedio de Compras",
            columns: ["Usuario", "Promedio (UYU)"],
            data: purchaseAverageData.map((u) => ({ Usuario: u.nombre, "Promedio (UYU)": u.promedio.toFixed(2) })),
          },
        ],
      }
    } else if (activeView === "activeStatus") {
      config = {
        title: "Usuarios Activos/Inactivos",
        summary: {
          "Total Usuarios": cantidadUsuarios?.total ?? 0,
          "Usuarios activos": actividadUsuarios?.totalActivos ?? 0,
          "Usuarios inactivos": actividadUsuarios?.totalInactivos ?? 0,
        },
        charts: [
          { title: "Estado de los usuarios", 
            image: chartImage,
            imageWidth: 100,
          }
        ],
        tables: [
          {
            title: "Estado de usuarios",
            columns: ["Estado", "Cantidad"],
            data: [
              { Estado: "Activos", Cantidad: actividadUsuarios?.totalActivos ?? 0 },
              { Estado: "Inactivos", Cantidad: actividadUsuarios?.totalInactivos ?? 0 },
            ],
          },
        ],
      }
    } else if (activeView === "userRoles") {
      config = {
        title: "Usuarios por Rol",
        summary: {
          "Total Usuarios": cantidadUsuarios?.total ?? 0,
          "Total Clientes": cantidadUsuarios?.totalClientes ?? 0,
          "Total Vendedores": cantidadUsuarios?.totalVendedores ?? 0,
          "Total Administradores": cantidadUsuarios?.totalAdministradores ?? 0,
        },
        charts: [
          { title: "Distribución por rol", 
            image: chartImage, 
            imageWidth: 100,
          }
        ],
        tables: [
          {
            title: "Distribución por rol",
            columns: ["Rol", "Cantidad"],
            data: [
              { Rol: "Clientes", Cantidad: cantidadUsuarios?.totalClientes ?? 0 },
              { Rol: "Vendedores", Cantidad: cantidadUsuarios?.totalVendedores ?? 0 },
              { Rol: "Administradores", Cantidad: cantidadUsuarios?.totalAdministradores ?? 0 },
            ],
          },
        ],
      }
    }

    generateAndDownloadStatsPDF(config, `estadisticas_${activeView}_${formattedDateForFile}.pdf`)
  }

  const handleDownloadCSV = () => {
    const dateStr = new Date().toISOString().split("T")[0]
    let rows = []
    let filename = "estadisticas.csv"

    if (activeView === "purchaseAverage" && purchaseAverageData.length > 0) {
      rows = purchaseAverageData.map((user) => ({
        Usuario: user.nombre,
        "Promedio de Compra (UYU)": user.promedio,
      }))
      filename = `promedio_compras_usuario_${dateStr}.csv`
    } else if (activeView === "userRoles" && cantidadUsuarios) {
      rows = [
        { Rol: "Clientes", Cantidad: cantidadUsuarios.totalClientes ?? 0 },
        { Rol: "Vendedores", Cantidad: cantidadUsuarios.totalVendedores ?? 0 },
        { Rol: "Administradores", Cantidad: cantidadUsuarios.totalAdministradores ?? 0 },
      ]
      filename = `usuarios_por_rol_${dateStr}.csv`
    } else if (activeView === "activeStatus" && actividadUsuarios) {
      rows = [
        { Estado: "Activos", Cantidad: actividadUsuarios.totalActivos ?? 0 },
        { Estado: "Inactivos", Cantidad: actividadUsuarios.totalInactivos ?? 0 },
      ]
      filename = `usuarios_activos_vs_inactivos_${dateStr}.csv`
    } else {
      alert("No hay datos para exportar.")
      return
    }

    exportToCSV(filename, rows)
  }

  const getCurrentChartComponent = () => {
    if (activeView === "purchaseAverage") {
      return <Bar ref={chartRef} data={chartData} options={barOptions} />
    }
    const data = activeView === "activeStatus" ? activeUsersData : usersByRoleData
    return <Pie ref={chartRef} data={data} options={pieOptions} />
  }

  const getCurrentDetails = () => {
    switch (activeView) {
      case "purchaseAverage":
        const totalAverage =
          purchaseAverageData.reduce((acc, user) => acc + user.promedio, 0) / (purchaseAverageData.length || 1)
        const topUser = purchaseAverageData.length > 0 ? purchaseAverageData[0] : null
        return {
          title: "Detalles de Promedio de Compras",
          items: [
            {
              label: "Usuarios con compras",
              value: purchaseAverageData.length,
              description: "Total de usuarios con al menos una compra.",
            },
            {
              label: "Promedio general",
              value: `UYU ${totalAverage.toFixed(2)}`,
              description: "Gasto promedio entre los usuarios que compran.",
            },
            {
              label: "Usuario con mayor promedio",
              value: topUser?.nombre ?? "N/A",
              description: `Con un promedio de UYU ${topUser?.promedio.toFixed(2) ?? 0}`,
            },
          ],
        }
      case "activeStatus":
        return {
          title: "Detalles de Estado de Usuarios",
          items: [
            {
              label: "Total de usuarios activos",
              value: actividadUsuarios?.totalActivos ?? 0,
              description: "Usuarios con actividad reciente.",
            },
            {
              label: "Total de usuarios inactivos",
              value: actividadUsuarios?.totalInactivos ?? 0,
              description: "Usuarios sin actividad reciente.",
            },
          ],
        }
      case "userRoles":
        return {
          title: "Detalles de Usuarios por Rol",
          items: [
            { label: "Total de clientes", value: cantidadUsuarios?.totalClientes ?? 0, description: "" },
            { label: "Total de vendedores", value: cantidadUsuarios?.totalVendedores ?? 0, description: "" },
            { label: "Total de administradores", value: cantidadUsuarios?.totalAdministradores ?? 0, description: "" },
          ],
        }
      default:
        return { title: "", items: [] }
    }
  }

  if (loading && !promedioCompras) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
            Cargando estadísticas de usuarios...
          </span>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Estadísticas de Usuarios
            </h1>
          </div>
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-8 text-center">
              <AlertCircle
                className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
              />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                No hay datos disponibles
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>{error}</p>
              <Button onClick={refreshAllStats} className="bg-orange-500 hover:bg-orange-600 text-white">
                Intentar nuevamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            Estadísticas de Usuarios
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
            Análisis detallado de la actividad y distribución de usuarios en la plataforma
          </p>
        </div>

        <div className={`border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "purchaseAverage"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveView("purchaseAverage")}
            >
              Promedio de compras
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "activeStatus"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveView("activeStatus")}
            >
              Actividad de usuarios
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "userRoles"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveView("userRoles")}
            >
              Usuarios por rol
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeView === "activeStatus" && (
            <>
              <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      Total Usuarios
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {cantidadUsuarios?.total ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      Usuarios Activos
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {actividadUsuarios?.totalActivos ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      Usuarios Inactivos
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {actividadUsuarios?.totalInactivos ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
          )}
          

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {activeView === "purchaseAverage" && "Promedio de Compras por Usuario"}
                    {activeView === "activeStatus" && "Estado de Usuarios"}
                    {activeView === "userRoles" && "Distribución de Usuarios por Rol"}
                  </h3>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      size="sm"
                      className={`${
                        isDarkMode
                          ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button
                      onClick={handleDownloadCSV}
                      variant="outline"
                      size="sm"
                      className={`${
                        isDarkMode
                          ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar CSV
                    </Button>
                  </div>
                </div>

                <div className="h-96 relative">{getCurrentChartComponent()}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  {getCurrentDetails().title}
                </h3>
                <div className="space-y-4">
                  {getCurrentDetails().items.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? "border-neutral-700 bg-neutral-800" : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <div className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {item.label}
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className={`text-2xl font-bold ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
                          {item.value}
                        </span>
                        {item.description && (
                          <span className={`text-xs text-right mt-1 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "-9999px" }}>
      {/* Export - Gráfico de Barras para Promedio de Compra */}
      {activeView === "purchaseAverage" && purchaseAverageData.length > 0 && (
        <div style={{ width: "800px", height: "600px" }}>
          <Bar
            ref={exportBarRef}
            data={chartData}
            options={{barOptions}}
            width={800}
            height={600}
            redraw
          />
        </div>
      )}

      {/* Export - Gráfico Pie (Usuarios Activos o Roles) */}
      {(activeView === "activeStatus" || activeView === "userRoles") && (actividadUsuarios || cantidadUsuarios) && (
        <div style={{ width: "600px", height: "600px" }}>
          <Pie
            ref={exportPieRef}
            data={activeView === "activeStatus" ? activeUsersData : usersByRoleData}
            options={{exportPieOptions}}
            width={600}
            height={600}
            redraw
          />
        </div>
      )}
    </div>
    </AdminLayout>
  )
}