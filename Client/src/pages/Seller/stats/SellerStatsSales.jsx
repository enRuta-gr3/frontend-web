import { useState, useMemo, useRef } from "react"
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
import { Ticket, RefreshCw, TrendingUp, FileText, Download, AlertCircle } from "lucide-react"
import { useSoldTicketsByMonth, useReturnedTicketsByMonth } from "@/hooks/stats/useSalesStats"
import { generateAndDownloadStatsPDF } from "@/lib/pdfStatsGenerator"
import { exportToCSV } from "@/lib/csvGenerator"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

export default function SellerStatsSales() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const chartRef = useRef(null)
  const exportChartRef = useRef(null)

  const [activeView, setActiveView] = useState("sold")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [error, setError] = useState("")

  const { soldTicketsByMonth, loading: loadingSold, error: errorSold } = useSoldTicketsByMonth()

  const { ticketsByMonth, loading: loadingReturned, error: errorReturned } = useReturnedTicketsByMonth()

  const stats = useMemo(() => {
    const returned = Array.isArray(ticketsByMonth) ? ticketsByMonth : []
    const sold = Array.isArray(soldTicketsByMonth) ? soldTicketsByMonth : []

    const sortByMonth = (a, b) => Number.parseInt(a.mes, 10) - Number.parseInt(b.mes, 10)
    const returnedSorted = returned.slice().sort(sortByMonth)
    const soldSorted = sold.slice().sort(sortByMonth)

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    const returnedDetails = returnedSorted.map((item) => ({
      month: monthNames[Number.parseInt(item.mes, 10) - 1],
      count: item.cantidad,
    }))

    const soldDetails = soldSorted.map((item) => ({
      month: monthNames[Number.parseInt(item.mes, 10) - 1],
      count: item.cantidad,
    }))

    const totalSold = soldDetails.reduce((sum, d) => sum + d.count, 0)
    const totalReturned = returnedDetails.reduce((sum, d) => sum + d.count, 0)
    const returnRate = totalSold === 0 ? 0 : (totalReturned / totalSold) * 100

    return {
      totalSold,
      totalReturned,
      returnRate: returnRate.toFixed(1),
      returnedDetails,
      soldDetails,
    }
  }, [ticketsByMonth, soldTicketsByMonth])

  const ticketsSoldData = {
    labels: stats.soldDetails.map((d) => d.month.slice(0, 3)),
    datasets: [
      {
        label: "Pasajes vendidos",
        data: stats.soldDetails.map((d) => d.count),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const ticketsReturnedData = {
    labels: stats.returnedDetails.map((d) => d.month.slice(0, 3)),
    datasets: [
      {
        label: "Pasajes devueltos",
        data: stats.returnedDetails.map((d) => d.count),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

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

  const handleDownloadPDF = () => {
    if (!exportChartRef.current?.toBase64Image) {
      alert("El gráfico no está listo para exportar.")
      return
    }

    const dateStr = new Date().toISOString().split("T")[0]
    const isSold = activeView === "sold"
    const chartImage = exportChartRef.current.toBase64Image()

    const config = {
      title: isSold ? "Pasajes Vendidos por Mes" : "Pasajes Devueltos por Mes",
      period: `Año ${selectedYear}`,
      type: "pasajes",
      generatedBy: "Administrador",
      summary: {
        "Pasajes Vendidos": stats.totalSold,
        "Pasajes Devueltos": stats.totalReturned,
        "Tasa de Devolución": `${stats.returnRate}%`,
      },
      charts: [
        {
          title: isSold ? "Distribución de Ventas Mensuales" : "Distribución de Devoluciones Mensuales",
          description: isSold ? "Cantidad de pasajes vendidos por mes." : "Cantidad de pasajes devueltos por mes.",
          image: chartImage,
          imageWidth: 85,
          centered: true,
        },
      ],
      tables: [
        {
          title: "Detalle por Mes",
          columns: ["Mes", "Cantidad"],
          data: (isSold ? stats.soldDetails : stats.returnedDetails).map((item) => ({
            Mes: item.month,
            Cantidad: item.count,
          })),
        },
      ],
    }

    const filename = isSold
      ? `pasajes_vendidos_${selectedYear}_${dateStr}.pdf`
      : `pasajes_devueltos_${selectedYear}_${dateStr}.pdf`

    generateAndDownloadStatsPDF(config, filename)
  }

  const handleDownloadCSV = () => {
    const dateStr = new Date().toISOString().split("T")[0]
    const isSoldView = activeView === "sold"

    const resumenRows = [
      ["Total de Vendidos", stats.totalSold],
      ["Total de Devueltos", stats.totalReturned],
      ["Tasa de Devolucion", `${stats.returnRate}%`],
      [],
      ["Mes", "Cantidad"],
    ]

    const detalleRows = (isSoldView ? stats.soldDetails : stats.returnedDetails).map((item) => [item.month, item.count])

    const rows = [...resumenRows, ...detalleRows]
    const filename = isSoldView
      ? `pasajes_vendidos_${selectedYear}_${dateStr}.csv`
      : `pasajes_devueltos_${selectedYear}_${dateStr}.csv`

    exportToCSV(filename, rows)
  }

  if (loadingSold || loadingReturned) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
            Cargando estadísticas de pasajes...
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
              Estadísticas de Pasajes
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
              Análisis de ventas y devoluciones de pasajes
            </p>
          </div>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-8 text-center">
              <AlertCircle
                className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}
              />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                {activeView === "sold"
                  ? "No se obtuvieron datos para generar el gráfico"
                  : "No hay datos disponibles para este periodo"}
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                {activeView === "sold"
                  ? "No se encontraron registros de pasajes para mostrar."
                  : "No se encontraron registros de pasajes devueltos."}
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

  const hasSoldData = stats.soldDetails.length > 0
  const hasReturnedData = stats.returnedDetails.length > 0
  const hasData = activeView === "sold" ? hasSoldData : hasReturnedData

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            Estadísticas de Pasajes
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
            Análisis de ventas y devoluciones de pasajes
          </p>
        </div>

        <div className={`border-b ${isDarkMode ? "border-neutral-700" : "border-neutral-200"}`}>
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "sold"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveView("sold")}
            >
              Cantidad de pasajes vendidos por mes
            </button>
            <button
              className={`pb-4 px-1 cursor-pointer ${
                activeView === "returned"
                  ? `text-orange-500 border-b-2 border-orange-500 font-medium`
                  : `${isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-700"}`
              }`}
              onClick={() => setActiveView("returned")}
            >
              Cantidad de pasajes con devolución por mes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Pasajes Vendidos
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {stats.totalSold ?? "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Pasajes Devueltos
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {stats.totalReturned ?? "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                    Tasa Devolución
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {stats.returnRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {hasData ? (
            <>
              <div className="lg:col-span-2">
                <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {activeView === "sold" ? "Pasajes Vendidos por Mes" : "Pasajes Devueltos por Mes"}
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

                    <div className="h-96">
                      <Bar
                        data={activeView === "sold" ? ticketsSoldData : ticketsReturnedData}
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className={isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}>
                  <CardContent className="p-6">
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                      Detalle por Mes
                    </h3>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-3">
                        {(activeView === "sold" ? stats.soldDetails : stats.returnedDetails).map((month, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${isDarkMode ? "border-neutral-700 bg-neutral-800" : "border-neutral-200 bg-neutral-50"}`}
                          >
                            <div className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                              {month.month}
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${activeView === "sold" ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span className={`text-sm ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                                {activeView === "sold" ? "Vendidos" : "Devueltos"}: {month.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="col-span-3 flex justify-center items-center h-96">
              <p className={`text-lg font-medium ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                No hay datos disponibles para mostrar.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "absolute", left: "-9999px", width: "400px", height: "400px" }}>
        <Bar
          ref={exportChartRef}
          data={activeView === "sold" ? ticketsSoldData : ticketsReturnedData}
          options={{
            ...chartOptions,
            responsive: false,
            maintainAspectRatio: false,
          }}
          width={400}
          height={400}
          redraw
        />
      </div>
    </SellerLayout>
  )
}
