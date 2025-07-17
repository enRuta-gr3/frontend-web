import jsPDF from "jspdf"

export class PDFStatsGenerator {
  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  generateStatsPDF(config) {
    try {
      this.resetDocument()
      this.addStatsHeader(config)
      this.addSummary(config)
      this.addChartsSection(config)
      
      this.doc.addPage()
      this.currentY = this.margin

      this.addDataTables(config)
      return this.doc.output("blob")
    } catch (error) {
      console.error("Error generando estadísticas PDF:", error)
      throw error
    }
  }

  resetDocument() {
    this.currentY = this.margin
  }

  addStatsHeader(config) {
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(`Estadísticas de ${config.title}`, this.pageWidth / 2, this.currentY, { align: "center" })

    this.currentY += 15
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Período: ${config.period || "N/A"}`, this.margin, this.currentY)
    this.doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, this.pageWidth - this.margin - 50, this.currentY)

    this.currentY += 20
    this.addLine()
  }

  addSummary(config) {
  if (!config.summary) return

  this.doc.setFontSize(14)
  this.doc.setFont("helvetica", "bold")
  this.doc.text("Resumen Ejecutivo", this.margin, this.currentY)
  this.currentY += 15

  const metrics = Object.entries(config.summary)
  const metricsPerRow = 2
  const boxWidth = (this.pageWidth - 2 * this.margin - 10) / metricsPerRow
  const boxHeight = 25
  const rowCount = Math.ceil(metrics.length / metricsPerRow)

  // Dibujar cajas
  metrics.forEach(([key, value], index) => {
    const row = Math.floor(index / metricsPerRow)
    const col = index % metricsPerRow
    const x = this.margin + col * (boxWidth + 10)
    const y = this.currentY + row * (boxHeight + 10)

    this.doc.setFillColor(245, 245, 245)
    this.doc.rect(x, y, boxWidth, boxHeight, "F")
    this.doc.rect(x, y, boxWidth, boxHeight, "S")

    this.doc.setFontSize(10).setFont("helvetica", "normal")
    this.doc.text(key, x + 5, y + 8)

    this.doc.setFontSize(14).setFont("helvetica", "bold")
    this.doc.text(String(value), x + 5, y + 18)
  })

  // Mover currentY solo una vez
  this.currentY += rowCount * (boxHeight + 10)

  this.addLine()
}

  addChartsSection(config) {
    if (!config.charts || config.charts.length === 0) return

    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Gráficos y Análisis", this.margin, this.currentY)
    this.currentY += 15

    config.charts.forEach((chart) => {
      const titleHeight = 10
      const descriptionHeight = chart.description ? 8 : 0
      const imgProps = this.doc.getImageProperties(chart.image)
      const imgWidth = chart.imageWidth || (this.pageWidth - 2 * this.margin) * 0.4
      const imgHeight = imgWidth / (imgProps.width / imgProps.height)
      const blockHeight = titleHeight + descriptionHeight + imgHeight + 10

      /* if (this.currentY + blockHeight > this.pageHeight - this.margin) {
        this.doc.addPage()
        this.currentY = this.margin
      } */

      this.doc.setFontSize(12)
      this.doc.setFont("helvetica", "bold")
      this.doc.text(chart.title, this.margin, this.currentY)
      this.currentY += titleHeight

      if (chart.description) {
        this.doc.setFontSize(10)
        this.doc.setFont("helvetica", "normal")
        this.doc.text(chart.description, this.margin, this.currentY)
        this.currentY += descriptionHeight
      }

      if (chart.image) {
        const xCentered = (this.pageWidth - imgWidth) / 2
        this.doc.addImage(chart.image, "PNG", xCentered, this.currentY, imgWidth, imgHeight)
        this.currentY += imgHeight + 10
      } else {
        this.doc.setFillColor(250, 250, 250)
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, "F")
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, "S")
        this.doc.setFontSize(10)
        this.doc.text(`[Gráfico: ${chart.title}]`, this.pageWidth / 2, this.currentY + 22, { align: "center" })
        this.currentY += 50
      }
    })

    this.addLine()
  }

  addDataTables(config) {
    if (!config.tables || config.tables.length === 0) return
  
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Datos Detallados", this.margin, this.currentY)
    this.currentY += 15

    config.tables.forEach((table) => {
      if (this.currentY > this.pageHeight - 100) {
        this.doc.addPage()
        this.currentY = this.margin
      }

      this.doc.setFontSize(12)
      this.doc.setFont("helvetica", "bold")
      this.doc.text(table.title, this.margin, this.currentY)
      this.currentY += 10

      if (table.data && table.data.length > 0) {
        const columnWidth = (this.pageWidth - 2 * this.margin) / table.columns.length
        let currentX = this.margin

        this.doc.setFontSize(9)
        this.doc.setFont("helvetica", "bold")

        table.columns.forEach((column) => {
          this.doc.setFillColor(240, 240, 240)
          this.doc.rect(currentX, this.currentY - 3, columnWidth, 10, "F")
          this.doc.text(column, currentX + 2, this.currentY + 3)
          currentX += columnWidth
        })

        this.currentY += 12
        this.doc.setFont("helvetica", "normal")

        table.data.slice(0, 10).forEach((row) => {
          currentX = this.margin
          table.columns.forEach((column) => {
            const value = row[column] || "-"
            this.doc.text(String(value), currentX + 2, this.currentY)
            currentX += columnWidth
          })
          this.currentY += 8
        })

        if (table.data.length > 10) {
          this.doc.setFont("helvetica", "italic")
          this.doc.text(`... y ${table.data.length - 10} registros más`, this.margin, this.currentY)
          this.currentY += 8
        }
      }

      this.currentY += 15
    })
  }

  addLine() {
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }
}

export const generateAndDownloadStatsPDF = (config, filename) => {
  try {
    const generator = new PDFStatsGenerator()
    const pdfBlob = generator.generateStatsPDF(config)
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `estadisticas_${config.type}_${new Date().getTime()}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error("Error generando estadísticas PDF:", error)
    return false
  }
}