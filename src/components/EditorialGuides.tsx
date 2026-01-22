import React from 'react'

interface EditorialGuidesProps {
  columns: number
  rows: number
  gap: number
  visible: boolean
}

/**
 * EditorialGuides: Overlay de guías editoriales
 *
 * Renderiza líneas sutiles que indican la retícula.
 * - No interactivo (pointer-events: none)
 * - Solo visible en modo edición cuando está activo
 * - No se exporta al PDF
 */
function EditorialGuides({ columns, rows, gap, visible }: EditorialGuidesProps) {
  if (!visible) return null

  // Generar líneas verticales (columnas)
  const verticalLines = []
  for (let i = 0; i <= columns; i++) {
    verticalLines.push(
      <div
        key={`v-${i}`}
        className="guide-line guide-vertical"
        style={{
          left: i === 0 ? '0%' : i === columns ? '100%' : `calc(${(i / columns) * 100}% - ${gap / 2}px)`,
        }}
      />
    )
  }

  // Generar líneas horizontales (filas/módulos)
  const horizontalLines = []
  for (let i = 0; i <= rows; i++) {
    horizontalLines.push(
      <div
        key={`h-${i}`}
        className="guide-line guide-horizontal"
        style={{
          top: i === 0 ? '0%' : i === rows ? '100%' : `calc(${(i / rows) * 100}% - ${gap / 2}px)`,
        }}
      />
    )
  }

  return (
    <div className="editorial-guides">
      <div className="guides-container">
        {verticalLines}
        {horizontalLines}
      </div>
    </div>
  )
}

export default EditorialGuides
