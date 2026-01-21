import React, { useMemo } from 'react'
import { GridElement } from '../types'
import ExportPDFButton from './ExportPDFButton'

interface CodePanelProps {
  showCode: boolean
  activeTab: 'html' | 'css'
  columns: number
  rows: number
  gap: number
  isNewspaperMode: boolean
  elements: GridElement[]
  onToggleCode: () => void
  onTabChange: (tab: 'html' | 'css') => void
}

function CodePanel({ showCode, activeTab, columns, rows, gap, isNewspaperMode, elements, onToggleCode, onTabChange }:CodePanelProps) {
  const htmlCode = useMemo(() => {
    let html = '<div class="grid-container">\n'
    elements.forEach(element => {
      const text = element.text || ''
      const hasImage = !!element.image

      if (isNewspaperMode) {
        if (hasImage && text) {
          // Imagen con texto overlay
          html += `  <div class="grid-item item-${element.id}">\n`
          html += `    <span class="item-text">${text.replace(/\n/g, '<br>')}</span>\n`
          html += `  </div>\n`
        } else if (text) {
          // Solo texto
          html += `  <div class="grid-item item-${element.id}">${text.replace(/\n/g, '<br>')}</div>\n`
        } else {
          // Solo imagen o vacío
          html += `  <div class="grid-item item-${element.id}"></div>\n`
        }
      } else {
        html += `  <div class="grid-item item-${element.id}">Elemento ${element.id}</div>\n`
      }
    })
    html += '</div>'
    return html
  }, [elements, isNewspaperMode])

  const cssCode = useMemo(() => {
    const gapUnit = isNewspaperMode ? 'mm' : 'px'
    const gapValue = gap
    
    let css = '.grid-container {\n'
    css += '  display: grid;\n'
    css += `  grid-template-columns: repeat(${columns}, 1fr);\n`
    css += `  grid-template-rows: repeat(${rows}, 1fr);\n`
    if (gapValue > 0) {
      css += `  gap: ${gapValue}${gapUnit};\n`
    }
    css += '}\n\n'
    css += '.grid-item {\n'
    css += '  background: #ffffff;\n'
    css += '  padding: 10px;\n'
    css += '  border: 2px solid #8b7e6a;\n'
    css += '  color: #2b2b2b;\n'
    css += '}\n'
    if (elements.length > 0) {
      css += '\n'
      elements.forEach(element => {
        css += `.item-${element.id} {\n`
        css += `  grid-column: ${element.column} / span ${element.columnSpan};\n`
        css += `  grid-row: ${element.row} / span ${element.rowSpan};\n`
        if (element.color && element.color !== '#ffffff') {
          css += `  background-color: ${element.color};\n`
        }
        if (element.image) {
          css += `  background-image: url('${element.image}');\n`
          css += `  background-size: cover;\n`
          css += `  background-position: center;\n`
        }
        css += '}\n\n'
      })

      // Agregar estilos para texto sobre imagen
      const hasElementsWithImageAndText = elements.some(el => el.image && el.text)
      if (hasElementsWithImageAndText) {
        css += `.item-text {\n`
        css += `  background: rgba(255, 255, 255, 0.85);\n`
        css += `  padding: 8px 12px;\n`
        css += `  border-radius: 4px;\n`
        css += `  display: inline-block;\n`
        css += `}\n\n`
      }
    }
    return css
  }, [columns, rows, gap, elements, isNewspaperMode])

  const handleCopyCode = () => {
    const code = activeTab === 'html' ? htmlCode : cssCode
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copy-code-btn')
      if (btn) {
        const originalText = btn.textContent
        btn.textContent = '¡Copiado!'
        setTimeout(() => {
          btn.textContent = originalText
        }, 2000)
      }
    }).catch(err => {
      alert('Error al copiar: ' + err)
    })
  }

  return (
    <div className="code-section">
      <div className="code-actions">
        <button className="toggle-code-btn" onClick={onToggleCode}>
          {showCode ? 'Ocultar Código' : 'Mostrar Código'}
        </button>
        <ExportPDFButton
          columns={columns}
          rows={rows}
          gap={gap}
          elements={elements}
          isNewspaperMode={isNewspaperMode}
        />
      </div>
      {showCode && (
        <div className="code-panel">
          <div className="code-tabs">
            <button
              className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
              onClick={() => onTabChange('html')}
            >
              HTML
            </button>
            <button
              className={`tab-btn ${activeTab === 'css' ? 'active' : ''}`}
              onClick={() => onTabChange('css')}
            >
              CSS
            </button>
          </div>
          <div className="code-content">
            <pre className={`code-block ${activeTab === 'html' ? 'active' : ''}`}>
              <code>{htmlCode}</code>
            </pre>
            <pre className={`code-block ${activeTab === 'css' ? 'active' : ''}`}>
              <code>{cssCode}</code>
            </pre>
          </div>
          <button id="copy-code-btn" className="btn-copy" onClick={handleCopyCode}>
            Copiar Código
          </button>
        </div>
      )}
    </div>
  )
}

export default CodePanel
