import { useState, useEffect, useRef } from "react"
import { SellerLayout } from "@/components"
import { Card, CardContent } from "@/components/ui"
import { Button } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { MapPin, TrendingUp, Calendar, Route, FileText, Download, AlertCircle } from "lucide-react"
import { getTripsByMonth, getTripsByLocation } from "@/services"
import { generateAndDownloadStatsPDF } from "@/lib/pdfStatsGenerator"
import { exportToCSV } from "@/lib/csvGenerator"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

export default function SellerStatsTrips() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const currentYear = new Date().getFullYear()
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")
  const chartRef = useRef(null)
  const exportChartRef = useRef(null)

  const [activeView, setActiveView] = useState("monthly")
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState(null)
  const [details, setDetails] = useState([])
  const [summaryStats, setSummaryStats] = useState({ total: 0, promedio: 0, pico: "" })

  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i
    return { value: String(year), label: String(year) }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#e5e5e5" : "#374151",
          font: { size: 12 },
        },
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
        grid: { color: isDarkMode ? "#374151" : "#e5e7eb" },
      },
      x: {
        ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
        grid: { color: isDarkMode ? "#374151" : "#e5e7eb" },
      },
    },
  }

  const handleGenerateStats = async () => {
    try {
      setLoading(true)
      setError("")

      if (activeView === "monthly") {
        const monthlyData = await getTripsByMonth(selectedYear)
        const sorted = [...monthlyData]
          .sort((a, b) => b.cantidad - a.cantidad)
          .map((item) => ({
            mes: months.find((m) => m.value === item.mes)?.label || item.mes,
            cantidad: item.cantidad,
          }))

        setChartData({
          labels: sorted.map((item) => item.mes),
          datasets: [
            {
              label: "Viajes Registrados",
              data: sorted.map((item) => item.cantidad),
              backgroundColor: "rgba(249, 115, 22, 0.8)",
              borderColor: "rgba(249, 115, 22, 1)",
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        })

        setDetails(sorted)
        const total = sorted.reduce((sum, item) => sum + item.cantidad, 0)
        const promedio = Math.round(total / 12)
        const top = sorted[0]

        setSummaryStats({ total, promedio, pico: top.mes })
      } else if (activeView === "location") {
        const locationData = await getTripsByLocation(selectedYear, selectedMonth)
        const sorted = [...locationData]
          .sort((a, b) => b.cantidad - a.cantidad)
          .map((item) => ({
            localidad: item.localidadOrigen.nombreLocalidad,
            cantidad: item.cantidad,
          }))

        const yearData = await getTripsByMonth(selectedYear)
        const total = yearData.reduce((sum, item) => sum + item.cantidad, 0)
        const promedio = Math.round(total / 12)
        const top = sorted[0]?.localidad ?? "—"

        setSummaryStats({ total, promedio, pico: top })

        setChartData({
          labels: sorted.map((item) => item.localidad),
          datasets: [
            {
              label: "Viajes por Localidad",
              data: sorted.map((item) => item.cantidad),
              backgroundColor: sorted.map(
                (_, i) =>
                  ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ec4899", "#22c55e", "#ef4444", "#9ca3af"][i % 8],
              ),
              borderColor: sorted.map(
                (_, i) =>
                  ["#2563eb", "#059669", "#ea580c", "#9333ea", "#db2777", "#16a34a", "#dc2626", "#6b7280"][i % 8],
              ),
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        })

        setDetails(sorted)
      }
    } catch (err) {
      setError("No se pudieron obtener los datos. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if ((activeView === "monthly" && selectedYear) || (activeView === "location" && selectedYear && selectedMonth)) {
      handleGenerateStats()
    }
  }, [activeView])

  const handleDownloadPDF = () => {
    if (!exportChartRef.current?.toBase64Image) {
      alert("El gráfico no está listo para exportar.")
      return
    }

    const chartImage = exportChartRef.current.toBase64Image()
    const today = new Date()
    const formattedDate = today.toLocaleDateString("es-ES")
    const isMonthly = activeView === "monthly"

    const config = {
      title: isMonthly ? "Viajes por Mes" : "Viajes por Localidad",
      period: isMonthly
        ? `Año ${selectedYear}`
        : `${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`,
      type: "viajes",
      generatedBy: "Administrador",
      summary: {
        "Total de Viajes": summaryStats.total,
        "Promedio Mensual": summaryStats.promedio,
        [isMonthly ? "Mes Pico" : "Localidad Top"]: summaryStats.pico,
      },
      charts: [
        {
          title: isMonthly ? "Distribución Mensual de Viajes" : "Distribución de Viajes por Localidad",
          description: isMonthly
            ? "Cantidad de viajes registrados por cada mes del año."
            : "Cantidad de viajes registrados por localidad en el mes seleccionado.",
          image: chartImage,
          imageWidth: 80,
          centered: true,
        },
      ],
      tables: [
        {
          title: "Detalle Ordenado (Mayor a Menor)",
          columns: [isMonthly ? "Mes" : "Localidad", "Cantidad"],
          data: details.map((item) => ({
            [isMonthly ? "Mes" : "Localidad"]: item.mes || item.localidad,
            Cantidad: item.cantidad,
          })),
        },
      ],
    }

    generateAndDownloadStatsPDF(config, `viajes_${formattedDate.replace(/\//g, "-")}.pdf`)
  }

  const handleDownloadCSV = () => {
    const dateStr = new Date().toISOString().split("T")[0]
    const isMonthly = activeView === "monthly"
    const dataLabel = isMonthly ? "Mes" : "Localidad"
    const resumenRows = [
      ["Total de Viajes", summaryStats.total],
      ["Promedio Mensual", summaryStats.promedio],
      [isMonthly ? "Mes Pico" : "Localidad Top", summaryStats.pico],
      [],
      [dataLabel, "Cantidad"],
    ]

    const detalleRows = details.map((item) => [item.mes || item.localidad, item.cantidad])
    const rows = [...resumenRows, ...detalleRows]
    const filename = isMonthly
      ? `viajes_por_mes_${selectedYear}_${dateStr}.csv`
      : `viajes_por_localidad_${selectedMonth}_${selectedYear}_${dateStr}.csv`

    exportToCSV(filename, rows)
  }

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
            Cargando estadísticas de viajes...
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
              Estadísticas de Viajes
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Análisis de la actividad de viajes y destinos
            </p>
          </div>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-8 text-center">
              <AlertCircle
                className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
              />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                No se obtuvieron datos para generar el gráfico
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                No se encontraron registros de viajes para el periodo seleccionado.
              </p>
              <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white">
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
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            Estadísticas de Viajes
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
            Análisis de la actividad de viajes y destinos más populares
          </p>
        </div>

        <div className={`border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "monthly"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => {
                setActiveView("monthly")
                setSelectedMonth("")
              }}
            >
              Cantidad de viajes por mes
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "location"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => {
                setActiveView("location")
                setSelectedMonth(currentMonth)
              }}
            >
              Cantidad de viajes por localidad
            </button>
          </div>
        </div>

        <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
          <CardContent className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Filtros de Búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {activeView === "location" && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                  >
                    Mes
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-neutral-800 border-neutral-700 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                >
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode
                      ? "bg-neutral-800 border-neutral-700 text-white"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                >
                  {years.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Button onClick={handleGenerateStats} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Generar estadística
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          className={`grid grid-cols-1 gap-6 ${
            activeView === "monthly"
              ? "md:grid-cols-3"
              : "md:grid-cols-4"
          }`}
        >
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Route className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Total Viajes
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {summaryStats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Promedio Mensual
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {summaryStats.promedio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeView === "location" && (
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                      Este Mes
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      {details.reduce((sum, item) => sum + item.cantidad, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    {activeView === "monthly" ? "Mes Pico" : "Localidad Top"}
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {summaryStats.pico}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {activeView === "monthly"
                      ? `Viajes por Mes - Año ${selectedYear}`
                      : `Viajes por Localidad - ${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`}
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
                <div className="h-96">{chartData && <Bar data={chartData} options={chartOptions} />}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  Detalle Ordenado (Mayor a Menor)
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {details.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                              {activeView === "monthly" ? item.mes : item.localidad}
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                              <span className={`text-sm ${isDarkMode ? "text-white" : ""}`}>
                                {item.cantidad} viajes
                              </span>
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
      </div>

      {chartData && (
        <div style={{ position: "absolute", left: "-9999px", width: "200px", height: "200px" }}>
          <Bar
            ref={exportChartRef}
            data={chartData}
            options={{
              ...chartOptions,
              responsive: false,
              maintainAspectRatio: false,
            }}
            width={200}
            height={200}
            redraw
          />
        </div>
      )}
    </SellerLayout>
  )
}
