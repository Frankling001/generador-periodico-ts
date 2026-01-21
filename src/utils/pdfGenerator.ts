import { jsPDF } from 'jspdf'
import { PDFConfig, PageSize } from '../types'

// Tamaños de página predefinidos en mm
const PAGE_SIZES: Record<Exclude<PageSize, 'custom'>, { width: number; height: number; label: string }> = {
  newspaper: { width: 255, height: 355, label: 'Periódico (255×355mm)' },
  a4: { width: 210, height: 297, label: 'A4 (210×297mm)' },
  letter: { width: 216, height: 279, label: 'Carta (216×279mm)' }
}

export const PAGE_SIZE_OPTIONS = PAGE_SIZES

const MARGIN = 15 // mm en todos los lados

interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
  image?: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }
  return { r: 255, g: 255, b: 255 }
}

function getPageDimensions(pageSize: PageSize, customSize?: { width: number; height: number }) {
  if (pageSize === 'custom' && customSize) {
    return customSize
  }
  return PAGE_SIZES[pageSize as Exclude<PageSize, 'custom'>]
}

function calculateElementPositions(config: PDFConfig): ElementPosition[] {
  const { elements, columns, rows, gap, pageSize, customSize } = config
  const pageDims = getPageDimensions(pageSize, customSize)

  // Área útil (descontando márgenes)
  const usableWidth = pageDims.width - (MARGIN * 2)
  const usableHeight = pageDims.height - (MARGIN * 2)

  // Calcular tamaño de cada celda
  const totalGapWidth = (columns - 1) * gap
  const totalGapHeight = (rows - 1) * gap
  const cellWidth = (usableWidth - totalGapWidth) / columns
  const cellHeight = (usableHeight - totalGapHeight) / rows

  return elements.map(element => {
    // Posición X: margen + (columna - 1) * (ancho celda + gap)
    const x = MARGIN + (element.column - 1) * (cellWidth + gap)

    // Posición Y: margen + (fila - 1) * (alto celda + gap)
    const y = MARGIN + (element.row - 1) * (cellHeight + gap)

    // Ancho: columnSpan celdas + (columnSpan - 1) gaps
    const width = element.columnSpan * cellWidth + (element.columnSpan - 1) * gap

    // Alto: rowSpan celdas + (rowSpan - 1) gaps
    const height = element.rowSpan * cellHeight + (element.rowSpan - 1) * gap

    return {
      x,
      y,
      width,
      height,
      text: element.text || '',
      color: element.color || '#ffffff',
      image: element.image
    }
  })
}

export function generateGridPDF(config: PDFConfig): void {
  const pageDims = getPageDimensions(config.pageSize, config.customSize)

  // Crear documento PDF con orientación vertical
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageDims.width, pageDims.height]
  })

  // Calcular posiciones de todos los elementos
  const positions = calculateElementPositions(config)

  // Dibujar cada elemento
  positions.forEach(pos => {
    // Color de fondo
    const rgb = hexToRgb(pos.color)
    doc.setFillColor(rgb.r, rgb.g, rgb.b)

    // Borde
    doc.setDrawColor(139, 126, 106) // #8b7e6a
    doc.setLineWidth(0.5)

    // Dibujar rectángulo con fondo y borde
    doc.roundedRect(pos.x, pos.y, pos.width, pos.height, 2, 2, 'FD')

    // Renderizar imagen si existe
    if (pos.image) {
      try {
        // Determinar formato de imagen desde base64
        let format: 'JPEG' | 'PNG' | 'GIF' | 'WEBP' = 'JPEG'
        if (pos.image.includes('data:image/png')) {
          format = 'PNG'
        } else if (pos.image.includes('data:image/gif')) {
          format = 'GIF'
        } else if (pos.image.includes('data:image/webp')) {
          format = 'PNG' // jsPDF no soporta webp nativo, pero la conversión a PNG funciona
        }

        // Agregar imagen que cubre todo el elemento (cover effect)
        doc.addImage(pos.image, format, pos.x, pos.y, pos.width, pos.height)

        // Re-dibujar borde sobre la imagen
        doc.setDrawColor(139, 126, 106)
        doc.setLineWidth(0.5)
        doc.roundedRect(pos.x, pos.y, pos.width, pos.height, 2, 2, 'S')
      } catch (e) {
        console.error('Error adding image to PDF:', e)
      }
    }

    // Renderizar texto si existe
    if (pos.text.trim()) {
      doc.setTextColor(43, 43, 43) // #2b2b2b

      // Calcular tamaño de fuente basado en el tamaño del elemento
      const baseFontSize = Math.min(pos.width / 10, pos.height / 3, 12)
      const fontSize = Math.max(6, Math.min(baseFontSize, 14))
      doc.setFontSize(fontSize)

      // Padding interno
      const padding = 3
      const textX = pos.x + padding
      const textY = pos.y + padding + fontSize * 0.35
      const maxWidth = pos.width - (padding * 2)

      // Si hay imagen, agregar fondo semi-transparente para el texto
      if (pos.image) {
        const lines = doc.splitTextToSize(pos.text, maxWidth)
        const lineHeight = fontSize * 0.4
        const availableHeight = pos.height - (padding * 2)
        const maxLines = Math.floor(availableHeight / lineHeight)
        const visibleLines = lines.slice(0, maxLines)
        const textBlockHeight = visibleLines.length * lineHeight + padding

        // Fondo blanco semi-transparente para legibilidad
        doc.setFillColor(255, 255, 255)
        doc.setGState(doc.GState({ opacity: 0.85 }))
        doc.roundedRect(textX - 2, pos.y + padding - 2, maxWidth + 4, textBlockHeight + 2, 1, 1, 'F')
        doc.setGState(doc.GState({ opacity: 1 }))

        visibleLines.forEach((line: string, index: number) => {
          doc.text(line, textX, textY + (index * lineHeight))
        })
      } else {
        // Dividir texto en líneas si es necesario
        const lines = doc.splitTextToSize(pos.text, maxWidth)
        const lineHeight = fontSize * 0.4

        // Calcular cuántas líneas caben
        const availableHeight = pos.height - (padding * 2)
        const maxLines = Math.floor(availableHeight / lineHeight)
        const visibleLines = lines.slice(0, maxLines)

        visibleLines.forEach((line: string, index: number) => {
          doc.text(line, textX, textY + (index * lineHeight))
        })
      }
    }
  })

  // Descargar el PDF
  const timestamp = new Date().toISOString().slice(0, 10)
  doc.save(`grid-${config.pageSize}-${timestamp}.pdf`)
}
