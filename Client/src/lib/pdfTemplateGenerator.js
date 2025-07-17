import jsPDF from "jspdf"

/**
 * Generador de PDFs para reportes de datos
 */
export class PDFTemplateGenerator {
  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  /**
   * Genera un PDF con reporte completo de datos
   * @param {Object} config - Configuración del reporte
   * @returns {Blob} - Archivo PDF como blob
   */
  generateReportPDF(config) {
    try {
      this.resetDocument()
      this.addReportHeader(config)
      this.addReportSummary(config)
      this.addCompleteDataTable(config)
      this.addReportFooter(config)

      return this.doc.output("blob")
    } catch (error) {
      console.error("Error generando reporte PDF:", error)
      throw error
    }
  }

  resetDocument() {
    this.currentY = this.margin
  }

  addReportHeader(config) {
    // Título principal
    this.doc.setFontSize(18)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(config.title, this.pageWidth / 2, this.currentY, { align: "center" })

    this.currentY += 15
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(
      `Fecha del reporte: ${config.reportDate || new Date().toLocaleDateString("es-ES")}`,
      this.margin,
      this.currentY,
    )

    this.currentY += 8
    this.doc.text(`Generado por: ${config.generatedBy || "Sistema EnRuta"}`, this.margin, this.currentY)

    this.currentY += 20
    this.addLine()
  }

  addReportSummary(config) {
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Resumen del reporte:", this.margin, this.currentY)

    this.currentY += 10
    this.doc.setFontSize(11)
    this.doc.setFont("helvetica", "normal")

    const summary = [
      `• Total de registros: ${config.totalRecords || 0}`,
      `• Filtro aplicado: ${config.activeFilter || "Ninguno"}`,
      `• Columnas incluidas: ${config.columns?.length || 0}`,
    ]

    summary.forEach((item) => {
      this.doc.text(item, this.margin, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
    this.addLine()
  }

  addCompleteDataTable(config) {
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Datos completos:", this.margin, this.currentY)

    this.currentY += 15

    // Configurar tabla
    const columnWidth = (this.pageWidth - 2 * this.margin) / config.columns.length
    const rowHeight = 12
    const headerHeight = 15

    // Headers de la tabla
    this.drawTableHeaders(config.columns, columnWidth, headerHeight)

    // USAR LOS DATOS REALES QUE SE PASAN EN LA CONFIGURACIÓN
    const allData = config.data || [] // Los datos reales filtrados por pestaña

    console.log(`📊 [PDFGenerator] Generando reporte con ${allData.length} registros`)
    console.log(`🎯 [PDFGenerator] Configuración:`, {
      useRender: config.useRender,
      disableRender: config.disableRender,
      columnsWithRender: config.columns.filter((col) => col.render).length,
    })

    allData.forEach((row, index) => {
      // Verificar si necesitamos nueva página
      if (this.currentY + rowHeight > this.pageHeight - 30) {
        this.doc.addPage()
        this.currentY = this.margin
        // Redibujar headers en nueva página
        this.drawTableHeaders(config.columns, columnWidth, headerHeight)
      }

      this.drawTableRow(row, config.columns, columnWidth, rowHeight, index % 2 === 0, config)
    })

    this.currentY += 20
  }

  drawTableHeaders(columns, columnWidth, headerHeight) {
    let currentX = this.margin

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")

    columns.forEach((column) => {
      // Fondo del header
      this.doc.setFillColor(240, 240, 240)
      this.doc.rect(currentX, this.currentY - 5, columnWidth, headerHeight, "F")

      // Borde del header
      this.doc.setDrawColor(200, 200, 200)
      this.doc.rect(currentX, this.currentY - 5, columnWidth, headerHeight)

      // Texto del header con truncado
      this.doc.setTextColor(0, 0, 0)
      const headerText = column.header || column.key
      const truncatedHeader = this.truncateText(headerText, columnWidth - 4)
      this.doc.text(truncatedHeader, currentX + 2, this.currentY + 5)
      currentX += columnWidth
    })

    this.currentY += headerHeight
  }

  drawTableRow(row, columns, columnWidth, rowHeight, isEven, config = {}) {
    let currentX = this.margin

    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    // Fondo alternado para filas
    if (isEven) {
      this.doc.setFillColor(250, 250, 250)
      this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, rowHeight, "F")
    }

    columns.forEach((column) => {
      // Borde de celda
      this.doc.setDrawColor(220, 220, 220)
      this.doc.rect(currentX, this.currentY - 2, columnWidth, rowHeight)

      // Texto de celda con manejo de texto largo
      this.doc.setTextColor(0, 0, 0)

      let value

      // 🎯 NUEVA LÓGICA MEJORADA:
      // 1. Si disableRender es true, nunca usar render
      // 2. Si la columna tiene render, usarlo (comportamiento por defecto)
      // 3. Si no tiene render, usar valor directo

      if (config.disableRender === true) {
        // Modo forzado sin render
        value = row[column.key] || "-"
        console.log(`🚫 [PDFGenerator] Render deshabilitado para ${column.key}:`, value)
      } else if (column.render && typeof column.render === "function") {
        // Usar render si está disponible (comportamiento por defecto)
        try {
          value = column.render(row)
          console.log(`🔧 [PDFGenerator] Usando render para ${column.key}:`, value)
        } catch (error) {
          console.error(`❌ [PDFGenerator] Error en render para ${column.key}:`, error)
          value = row[column.key] || "-"
        }
      } else {
        // Valor directo si no hay render
        value = row[column.key] || "-"
      }

      // Convertir a string y manejar casos especiales
      let text = String(value)

      // Manejar objetos que no se renderizaron correctamente
      if (text === "[object Object]") {
        text = row[column.key]?.nombre || row[column.key]?.nombreDepartamento || row[column.key]?.nombreLocalidad || "-"
      }

      // Manejar booleanos
      if (typeof value === "boolean") {
        text = value ? "Activo" : "Inactivo"
      }

      // Calcular el ancho disponible para el texto (menos padding)
      const availableWidth = columnWidth - 4

      // Truncar texto si es muy largo
      const truncatedText = this.truncateText(text, availableWidth)

      this.doc.text(truncatedText, currentX + 2, this.currentY + 6)
      currentX += columnWidth
    })

    this.currentY += rowHeight
  }

  /**
   * Trunca el texto si es muy largo para evitar solapamiento
   * @param {string} text - Texto a truncar
   * @param {number} maxWidth - Ancho máximo disponible
   * @returns {string} - Texto truncado
   */
  truncateText(text, maxWidth) {
    if (!text) return "-"

    const textString = String(text)

    // Calcular el ancho del texto actual
    const textWidth = this.doc.getTextWidth(textString)

    if (textWidth <= maxWidth) {
      return textString
    }

    // Si el texto es muy largo, truncarlo y agregar "..."
    let truncated = textString
    while (this.doc.getTextWidth(truncated + "...") > maxWidth && truncated.length > 1) {
      truncated = truncated.slice(0, -1)
    }

    return truncated.length < textString.length ? truncated + "..." : truncated
  }

  addReportFooter(config) {
    const footerY = this.pageHeight - 30

    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")
    this.doc.setTextColor(100, 100, 100)
    this.doc.text("EnRuta - Reporte de Datos", this.pageWidth / 2, footerY, { align: "center" })
    this.doc.text(`Generado el ${new Date().toLocaleString("es-ES")}`, this.pageWidth / 2, footerY + 8, {
      align: "center",
    })
  }

  addLine() {
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }
}

/**
 * Función helper para generar y descargar reporte PDF
 * @param {Object} config - Configuración del reporte
 * @param {string} filename - Nombre del archivo (opcional)
 */
export const generateAndDownloadReportPDF = (config, filename) => {
  try {
    const generator = new PDFTemplateGenerator()
    const pdfBlob = generator.generateReportPDF(config)

    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `reporte_${config.type}_${new Date().getTime()}.pdf`
    link.click()
    URL.revokeObjectURL(url)

    console.log(`✅ [PDFGenerator] Reporte descargado: ${filename}`)
    return true
  } catch (error) {
    console.error("❌ [PDFGenerator] Error generando reporte PDF:", error)
    return false
  }
}
