import React, { useState } from 'react'
import { GridElement, PageSize } from '../types'
import { generateGridPDF, PAGE_SIZE_OPTIONS } from '../utils/pdfGenerator'

interface ExportPDFButtonProps {
  columns: number
  rows: number
  gap: number
  elements: GridElement[]
  isNewspaperMode: boolean
}

function ExportPDFButton({ columns, rows, gap, elements, isNewspaperMode }: ExportPDFButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [pageSize, setPageSize] = useState<PageSize>(isNewspaperMode ? 'newspaper' : 'a4')
  const [customWidth, setCustomWidth] = useState(255)
  const [customHeight, setCustomHeight] = useState(355)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    if (elements.length === 0) {
      alert('No hay elementos para exportar. Agrega elementos al grid primero.')
      return
    }

    setIsExporting(true)

    try {
      generateGridPDF({
        elements,
        columns,
        rows,
        gap,
        pageSize,
        customSize: pageSize === 'custom' ? { width: customWidth, height: customHeight } : undefined
      })
      setShowModal(false)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenModal = () => {
    setPageSize(isNewspaperMode ? 'newspaper' : 'a4')
    setShowModal(true)
  }

  return (
    <>
      <button className="export-pdf-btn" onClick={handleOpenModal}>
        Exportar PDF
      </button>

      {showModal && (
        <div className="pdf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>Exportar como PDF</h3>
              <button className="pdf-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="pdf-modal-content">
              <div className="pdf-option-group">
                <label>Tamaño de página</label>
                <div className="pdf-size-options">
                  {(Object.entries(PAGE_SIZE_OPTIONS) as [Exclude<PageSize, 'custom'>, { label: string }][]).map(([key, value]) => (
                    <label key={key} className="pdf-size-option">
                      <input
                        type="radio"
                        name="pageSize"
                        value={key}
                        checked={pageSize === key}
                        onChange={() => setPageSize(key)}
                      />
                      <span>{value.label}</span>
                    </label>
                  ))}
                  <label className="pdf-size-option">
                    <input
                      type="radio"
                      name="pageSize"
                      value="custom"
                      checked={pageSize === 'custom'}
                      onChange={() => setPageSize('custom')}
                    />
                    <span>Personalizado</span>
                  </label>
                </div>
              </div>

              {pageSize === 'custom' && (
                <div className="pdf-custom-size">
                  <div className="pdf-custom-input">
                    <label>Ancho (mm)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(50, parseInt(e.target.value) || 50))}
                      min={50}
                      max={600}
                    />
                  </div>
                  <span className="pdf-custom-separator">×</span>
                  <div className="pdf-custom-input">
                    <label>Alto (mm)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(50, parseInt(e.target.value) || 50))}
                      min={50}
                      max={800}
                    />
                  </div>
                </div>
              )}

              <div className="pdf-info">
                <p>Se exportará el grid actual con {elements.length} elementos.</p>
                <p className="pdf-info-hint">Configuración: {columns}×{rows} celdas, gap: {gap}mm</p>
              </div>
            </div>

            <div className="pdf-modal-footer">
              <button className="pdf-cancel-btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="pdf-export-btn"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExportPDFButton
