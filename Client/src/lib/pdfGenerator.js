import jsPDF from "jspdf"

/**
 * Generador de PDFs para comprobantes de pasajes
 */
export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  // generador de pasajes en pdf
  /**
   * Genera un PDF con los datos de los pasajes
   * @param {Object} data - Datos del comprobante
   * @returns {Blob} - Archivo PDF como blob
   */
  generateTicketPDF(data) {
    try {
      this.addHeader(data)
      this.addPaymentInfo(data)
      this.addTicketsInfo(data.tickets)
      this.addFooter(data)

      return this.doc.output("blob")
    } catch (error) {
      console.error("Error generando PDF:", error)
      throw error
    }
  }

  addHeader(data) {
    // Logo y título
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("EnRuta - Comprobante de Pasajes", this.pageWidth / 2, this.currentY, { align: "center" })

    this.currentY += 15
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, this.margin, this.currentY)
    this.doc.text(`ID Venta: ${data.saleId}`, this.pageWidth - this.margin - 50, this.currentY)

    this.currentY += 20
    this.addLine()
  }

  addPaymentInfo(data) {
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Información del Pago", this.margin, this.currentY)

    this.currentY += 10
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    const paymentInfo = [`Método de pago: ${data.paymentDetails?.method === "paypal" ? "PayPal" : "Efectivo"}`]

    // Agregar desglose de precios
    if (data.originalSubtotal && data.originalSubtotal > 0) {
      paymentInfo.push(`Subtotal original: $${data.originalSubtotal.toFixed(2)}`)
    }

    if (data.discountAmount && data.discountAmount > 0) {
      paymentInfo.push(`Descuento aplicado: -$${data.discountAmount.toFixed(2)}`)
    }

    if (data.ticketsTotal && data.ticketsTotal > 0) {
      paymentInfo.push(`Total a pagar: $${data.ticketsTotal.toFixed(2)}`)
    }

    if (data.paymentDetails?.method === "efectivo") {
      paymentInfo.push(`Monto recibido: $${data.paymentDetails?.cashAmount?.toFixed(2) || "0.00"}`)
      paymentInfo.push(`Vuelto: $${data.paymentDetails?.change?.toFixed(2) || "0.00"}`)
    }

    if (data.paymentDetails?.method === "paypal" && data.paymentDetails?.orderId) {
      paymentInfo.push(`ID Orden PayPal: ${data.paymentDetails.orderId}`)
    }

    paymentInfo.forEach((info) => {
      this.doc.text(info, this.margin, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
    this.addLine()
  }

  addTicketsInfo(tickets) {
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(`Pasajes (${tickets?.length || 0})`, this.margin, this.currentY)

    this.currentY += 15

    if (!tickets || tickets.length === 0) {
      this.doc.setFontSize(10)
      this.doc.text("No hay pasajes para mostrar", this.margin, this.currentY)
      return
    }

    tickets.forEach((ticket, index) => {
      this.addTicket(ticket, index + 1)
      this.currentY += 10
    })
  }

  addTicket(ticket, number) {
    // Verificar si necesitamos una nueva página
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage()
      this.currentY = this.margin
    }

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(`Pasaje #${number} - ID: ${ticket.id_pasaje}`, this.margin, this.currentY)

    this.currentY += 8
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    const ticketInfo = []

    // Mostrar información de precios con descuentos si aplica
    if (ticket.originalPrice && ticket.discountApplied && ticket.discountApplied > 0) {
      ticketInfo.push(`Precio original: $${ticket.originalPrice.toFixed(2)}`)
      ticketInfo.push(`Descuento aplicado: -$${ticket.discountApplied.toFixed(2)}`)
      ticketInfo.push(`Precio final: $${ticket.precio}`)
    } else {
      ticketInfo.push(`Precio: $${ticket.precio}`)
    }

    ticketInfo.push(`Asiento: ${ticket.asiento?.numero_asiento || "N/A"}`)
    ticketInfo.push(
      `Origen: ${ticket.viaje?.localidadOrigen?.nombreLocalidad || "N/A"} (${ticket.viaje?.localidadOrigen?.departamento?.nombreDepartamento || "N/A"})`,
    )
    ticketInfo.push(
      `Destino: ${ticket.viaje?.localidadDestino?.nombreLocalidad || "N/A"} (${ticket.viaje?.localidadDestino?.departamento?.nombreDepartamento || "N/A"})`,
    )
    ticketInfo.push(`Fecha salida: ${ticket.viaje?.fecha_partida || "N/A"} - ${ticket.viaje?.hora_partida || "N/A"}`)
    ticketInfo.push(`Fecha llegada: ${ticket.viaje?.fecha_llegada || "N/A"} - ${ticket.viaje?.hora_llegada || "N/A"}`)

    ticketInfo.forEach((info) => {
      this.doc.text(info, this.margin + 10, this.currentY)
      this.currentY += 6
    })

    this.currentY += 5
    this.addLine()
  }

  // DATOS MOSTRADOS EN EL PIE DE Página 
  addFooter(data) {
    const footerStartY = this.pageHeight - 50 // Más espacio para el footer
    let footerY = footerStartY

    // Título principal centrado
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("EnRuta - Sistema de Gestión de Pasajes", this.pageWidth / 2, footerY, { align: "center" })

    footerY += 8

    // Fecha de generación centrada
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Generado el ${new Date().toLocaleString("es-ES")}`, this.pageWidth / 2, footerY, {
      align: "center",
    })

    footerY += 12

    // Información del cliente y vendedor en líneas separadas
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")

    // Cliente en la izquierda
    if (data.customerData) {
      this.doc.text(`Cliente: ${data.customerData.nombres} ${data.customerData.apellidos}`, this.margin, footerY)
    }

    footerY += 8

    // Vendedor en la izquierda, línea siguiente
    if (data.sellerData) {
      this.doc.text(`Vendedor: ${data.sellerData.nombres} ${data.sellerData.apellidos}`, this.margin, footerY)
    }
  }

  addLine() {
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }
}

/**
 * Función helper para generar y descargar PDF
 * @param {Object} ticketData - Datos del comprobante
 * @param {string} filename - Nombre del archivo (opcional)
 */
export const generateAndDownloadPDF = (ticketData, filename) => {
  try {
    const generator = new PDFGenerator()
    const pdfBlob = generator.generateTicketPDF(ticketData)

    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `comprobante_${ticketData.saleId}_${new Date().getTime()}.pdf`
    link.click()
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error generando PDF:", error)
    return false
  }
}
