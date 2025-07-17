import { useState, useRef, useEffect } from "react"
import { SellerLayout } from "@/components"
import { Card, CardContent } from "@/components/ui"
import { Button } from "@/components/ui"
import { Bar } from "react-chartjs-2"
import useThemeStore from "@/store/useThemeStore"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { Bus, CheckCircle, XCircle, Download, FileText, AlertCircle } from "lucide-react"
import useBusStats from "@/hooks/stats/useBusStats"
import { generateAndDownloadStatsPDF } from "@/lib/pdfStatsGenerator"
import { exportToCSV } from "@/lib/csvGenerator"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function SellerStatsBuses() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const chartRef = useRef(null)
  const exportBarRef = useRef(null)
  const exportChartRef = useRef(null)
  const [setLoading] = useState()
  const [setError] = useState("")
  const [activeTab, setActiveTab] = useState("actual") // "actual" | "mensual"

   // Refrescar mensual al cambiar de pestaña
  useEffect(() => {
    if (activeTab === "mensual") loadMonthly(true)
  }, [activeTab])

  const {
    currentStats, loading, error,
    monthlyStats, loadingMonthly, errorMonthly, loadMonthly,
  } = useBusStats()

  const currentBusStatusData = currentStats
    ? {
        labels: ["Asignados", "No Asignados"],
        datasets: [
          {
            data: [currentStats.asignados, currentStats.noAsignados],
            backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
            borderWidth: 2,
          },
        ],
      }
    : null

  console.log("Current: ", currentStats)
  const doughnutOptions = {
    responsive: true,
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

  const chartOptions = {
    ...doughnutOptions,
    scales: {
      x: {
        ticks: { color: isDarkMode ? "#e5e5e5" : "#374151" },
      },
      y: {
        ticks: { color: isDarkMode ? "#e5e5e5" : "#374151" },
      },
    },
  }

  const handleDownloadPDF = () => {
    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`
    const chartImage =
      activeTab === "mensual"
        ? exportBarRef.current?.toBase64Image()
        : exportChartRef.current?.toBase64Image()

    const config =
      activeTab === "actual"
        ? {
            title: "Estado de la Flota",
            period: `${today.getFullYear()}`,
            type: "busStatus",
            generatedBy: "Administrador",
            summary: {
              "Total de Ómnibus": currentStats?.totalOmnibus ?? 0,
              "Asignados": currentStats?.asignados ?? 0,
              "No Asignados": currentStats?.noAsignados ?? 0,
              "Porcentaje Asignados": `${currentStats?.porcentajeAsignados ?? 0}%`,
            },
            charts: [
              {
                title: "Distribución de Asignación de Flota",
                description: "Cantidad de ómnibus asignados frente a no asignados.",
                image: chartImage,
                imageWidth: 150,
                centered: true,
              },
            ],
            tables: [
              {
                title: "Detalle de asignacion",
                columns: ["Tipo", "Cantidad"],
                data: [
                  { Tipo: "Asignados", Cantidad: currentStats?.asignados ?? 0 },
                  { Tipo: "No Asignados", Cantidad: currentStats?.noAsignados ?? 0 },
                ],
              },
            ],
          }
        : {
            title: "Estados de Ómnibus por Mes",
            period: `${today.getFullYear()}`,
            type: "busStatusByMonth",
            generatedBy: "Administrador",
            summary: {
              "Total de Ómnibus": currentStats?.totalOmnibus ?? 0,
            },
            charts: [
              {
                title: "Comparativa de Ómnibus Activos e Inactivos",
                description: "Estados mensuales acumulados por tipo de flota.",
                image: chartImage,
                imageWidth: 100,
                centered: true,
              },
            ],
            tables: [
              {
                title: "Detalle Ordenado Activos (Mayor a Menor)",
                columns: ["Mes", "Cantidad"],
                data: monthlyStats
                  .map((item) => ({
                    Mes: `${item.mes}/${item.anio}`,
                    Cantidad: Number(item.cantidadActivos),
                  }))
              },
              {
                title: "Detalle Ordenado Inactivos (Mayor a Menor)",
                columns: ["Mes", "Cantidad"],
                data: monthlyStats
                  .map((item) => ({
                    Mes: `${item.mes}/${item.anio}`,
                    Cantidad: Number(item.cantidadInactivos),
                  }))
              },
            ],
          }

    generateAndDownloadStatsPDF(config, `estado_omnibus_${activeTab}_${formattedDate}.pdf`)
  }

  const handleDownloadCSV = () => {
    const dateStr = new Date().toISOString().split("T")[0]

    const rows =
      activeTab === "actual"
        ? [
            { Estado: "Total", Cantidad: currentStats?.totalOmnibus ?? 0 },
            { Estado: "Asignados", Cantidad: currentStats?.asignados ?? 0 },
            { Estado: "No Asignados", Cantidad: currentStats?.noAsignados ?? 0 },
            { Estado: "Porcentaje Asignados", Cantidad: `${currentStats?.porcentajeAsignados ?? 0}%` },
          ]
        : monthlyStats.map((item) => ({
            Mes: `${item.mes}/${item.anio}`,
            Activos: item.cantidadActivos,
            Inactivos: item.cantidadInactivos,
            Total: Number(item.cantidadActivos) + Number(item.cantidadInactivos),
          }))

    exportToCSV(`estado_omnibus_${activeTab}_${dateStr}.csv`, rows)
  }

  const monthlySummarySorted = [...monthlyStats]
    .map(({ mes, anio, cantidadActivos, cantidadInactivos }) => ({
      mes,
      anio,
      activos: Number(cantidadActivos),
      inactivos: Number(cantidadInactivos),
      total: Number(cantidadActivos) + Number(cantidadInactivos),
    }))
    .sort((a, b) => b.total - a.total)

  const refresh = () => loadAssignedOmnibusPercentage(true)

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
            Cargando estadísticas de ómnibus...
          </span>
        </div>
      </SellerLayout>
    )
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Estadísticas de Ómnibus
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Estado de la flota de ómnibus en el último año
            </p>
          </div>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-8 text-center">
              <AlertCircle
                className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
              />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                No hay datos disponibles para esta estadística
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                No se encontraron registros de estado de ómnibus para el periodo solicitado.
              </p>
              <Button onClick={refresh} className="bg-orange-500 hover:bg-orange-600 text-white">
                Intentar nuevamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            Estadísticas de Ómnibus
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
            Estado de la flota y evolución mensual
          </p>
        </div>

        {/* Pestañas */}
        <div className={`border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "actual"
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : isDarkMode
                    ? "text-neutral-400 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-700"
              }`}
              onClick={() => setActiveTab("actual")}
            >
              Estado actual de la flota
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeTab === "mensual"
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : isDarkMode
                    ? "text-neutral-400 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-700"
              }`}
              onClick={() => setActiveTab("mensual")}
            >
              Estados de ómnibus por mes
            </button>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === "actual" ? (
          <>
            {/* Cards de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Total Flota
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {currentStats?.totalOmnibus ?? "--"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Ómnibus Asignados
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {currentStats?.asignados ?? "--"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Ómnibus No Asignados
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {currentStats?.noAsignados ?? "--"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        Porcentaje Asignados
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {currentStats?.porcentajeAsignados != null ? `${currentStats.porcentajeAsignados}%` : "--"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Doughnut + Botones de export */}
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    Estado Actual de la Flota
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
                <div className="h-80">
                  {currentBusStatusData ? (
                    <Doughnut ref={chartRef} data={currentBusStatusData} options={doughnutOptions} />
                  ) : (
                    <p className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>
                      No hay datos para mostrar el gráfico.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Canvas oculto para exportar */}
            {currentBusStatusData && (
              <div style={{ position: "absolute", left: "-9999px", width: "600px", height: "400px" }}>
                <Doughnut
                  ref={exportChartRef}
                  data={currentBusStatusData}
                  options={{ ...doughnutOptions, responsive: false, maintainAspectRatio: false }}
                  width={600}
                  height={400}
                  redraw
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vista “Estados de ómnibus por mes” */}
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  Ómnibus Activos vs Inactivos por Mes
                </h3>

                {loading ? (
                  <p className={isDarkMode ? "text-neutral-400" : "text-neutral-600"}>
                    Cargando datos mensuales…
                  </p>
                ) : error ? (
                  <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico y botones export */}
                    <div className="lg:col-span-2">
                      <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                              Estado por Mes (Últimos 12 meses)
                            </h3>
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleDownloadPDF}
                                variant="outline"
                                size="sm"
                                className={`${isDarkMode
                                  ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"}`}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Descargar PDF
                              </Button>
                              <Button
                                onClick={handleDownloadCSV}
                                variant="outline"
                                size="sm"
                                className={`${isDarkMode
                                  ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar CSV
                              </Button>
                            </div>
                          </div>
                          <div className="h-96">
                             <Bar
                              data={{
                                labels: monthlyStats.map((d) => `${d.mes}/${d.anio}`),
                                datasets: [
                                  {
                                    label: "Activos",
                                    data: monthlyStats.map((d) => +d.cantidadActivos),
                                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                                  },
                                  {
                                    label: "Inactivos",
                                    data: monthlyStats.map((d) => +d.cantidadInactivos),
                                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                                  },
                                ],
                              }}
                              options={chartOptions} 
                              />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {activeTab === "mensual" && monthlyStats.length > 0 && (
                      <div style={{ position: "absolute", left: "-9999px", width: "600px", height: "400px" }}>
                        <Bar
                          ref={exportBarRef}
                          data={{
                            labels: monthlyStats.map((d) => `${d.mes}/${d.anio}`),
                            datasets: [
                              {
                                label: "Activos",
                                data: monthlyStats.map((d) => +d.cantidadActivos),
                                backgroundColor: "rgba(34, 197, 94, 0.8)",
                              },
                              {
                                label: "Inactivos",
                                data: monthlyStats.map((d) => +d.cantidadInactivos),
                                backgroundColor: "rgba(239, 68, 68, 0.8)",
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            responsive: false,
                            maintainAspectRatio: false,
                          }}
                          width={600}
                          height={400}
                          redraw
                        />
                      </div>
                    )}

                    {/* Lista lateral de resumen */}
                    <div>
                      <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                        <CardContent className="p-6">
                          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                            Detalle Ordenado (Mayor a Menor)
                          </h3>
                          <div className="max-h-96 overflow-y-auto">
                            <div className="space-y-3">
                              {monthlyStats
                                .map((item) => ({
                                  ...item,
                                  total: Number(item.cantidadActivos) + Number(item.cantidadInactivos),
                                }))
                                .sort((a, b) => b.total - a.total)
                                .map((item, index) => (
                                  <div
                                    key={`${item.mes}-${item.anio}`}
                                    className={`p-3 rounded-lg border ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                                          {item.mes}/{item.anio}
                                        </div>
                                        <div className="flex items-center mt-1 space-x-4 text-sm">
                                          <span className="text-green-500">✔ {item.cantidadActivos}</span>
                                          <span className="text-red-500">✖ {item.cantidadInactivos}</span>
                                        </div>
                                      </div>
                                      <div className="text-lg font-bold text-orange-600">#{index + 1}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SellerLayout>
  )
}
