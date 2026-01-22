import { GridElement,TemplateData } from './types'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Controls from './components/Controls'
import GridVisualizer from './components/GridVisualizer'
import CodePanel from './components/CodePanel'
import TemplatesPanel from './components/TemplatesPanel'
import EditorPage from './components/EditorPage'
import { calculateColumns, calculateRows, NEWSPAPER_CONFIG, mmToPx } from './utils/newspaperConfig'

function App() {
  // Modo periódico: calcular dimensiones automáticamente
  const initialColumns = calculateColumns()
  const initialRows = calculateRows()
  const initialGapMm = NEWSPAPER_CONFIG.columnGap

  const [columns, setColumns] = useState(initialColumns)
  const [rows, setRows] = useState(initialRows)
  const [gap, setGap] = useState(initialGapMm) // Ahora en mm
  const [elements, setElements] = useState<GridElement[]>([])
  const [elementCounter, setElementCounter] = useState(1)
  const [showCode, setShowCode] = useState(false)
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html')
  const [isNewspaperMode, setIsNewspaperMode] = useState(true)
  const [selectedElementId, setSelectedElementId] = useState<number|null>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [showGuides, setShowGuides] = useState(true);

  const updateGrid = useCallback(() => {
    // Filtrar elementos que están completamente fuera del grid
    setElements(prev => {
      const filtered = prev.filter(el => {
        return el.column <= columns && el.row <= rows
      })

      // Ajustar posición si está fuera, pero mantener el tamaño
      return filtered.map(el => {
        let newColumn = el.column
        let newRow = el.row

        if (el.column + el.columnSpan - 1 > columns) {
          newColumn = Math.max(1, columns - el.columnSpan + 1)
        }
        if (el.row + el.rowSpan - 1 > rows) {
          newRow = Math.max(1, rows - el.rowSpan + 1)
        }

        return {
          ...el,
          column: newColumn,
          row: newRow
        }
      })
    })
  }, [columns, rows])

  useEffect(() => {
    updateGrid()
  }, [columns, rows, updateGrid])

  const handleAddElement = useCallback((newElement: Omit<GridElement, 'id'|'text'|'color'>) => {
    setElements(prev => [...prev, { ...newElement, id: elementCounter, text: '', color: '#ffffff' }])
    setElementCounter(prev => prev + 1)
  }, [elementCounter])

  const handleUpdateElement = useCallback((id:number, updates:Partial<GridElement>) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ))
  }, [])

  const handleDeleteElement = useCallback((id:number) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }, [])

  const handleLoadTemplate = useCallback((templateData:TemplateData) => {
    setColumns(templateData.columns)
    setRows(templateData.rows)
    setGap(templateData.gap)
    setIsNewspaperMode(templateData.isNewspaperMode !== undefined ? templateData.isNewspaperMode : true)
    setElements((templateData.elements || []).map(el => ({
      ...el,
      color: el.color || '#ffffff'
    })))
    // Ajustar el contador para evitar conflictos de IDs
    if (templateData.elements && templateData.elements.length > 0) {
      const maxId = Math.max(...templateData.elements.map(el => el.id))
      setElementCounter(maxId + 1)
    } else {
      setElementCounter(1)
    }
  }, [])

  const handleSelectElement = useCallback((id: number | null) => {
    setSelectedElementId(id)
  }, [])

  const getCurrentTemplate = useCallback(() => {
    return {
      columns,
      rows,
      gap,
      isNewspaperMode,
      elements: elements.map(el => ({
        id: el.id,
        column: el.column,
        row: el.row,
        columnSpan: el.columnSpan,
        rowSpan: el.rowSpan,
        text: el.text || '',
        color: el.color || '#ffffff',
        image: el.image // Incluir imagen para persistencia en plantillas
      }))
    }
  }, [columns, rows, gap, elements, isNewspaperMode])

  // Calcular gap en px para visualización
  const gapPx = isNewspaperMode ? mmToPx(gap) : gap

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <button
              className={`mode-toggle-btn ${editorMode === 'edit' ? 'active' : ''}`}
              onClick={() => setEditorMode('edit')}
            >
              Editar
            </button>
            <button
              className={`mode-toggle-btn ${editorMode === 'preview' ? 'active' : ''}`}
              onClick={() => setEditorMode('preview')}
            >
              Vista Previa
            </button>
            {editorMode === 'edit' && (
              <button
                className={`guides-toggle-btn ${showGuides ? 'active' : ''}`}
                onClick={() => setShowGuides(prev => !prev)}
                title={showGuides ? 'Ocultar guías' : 'Mostrar guías'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 1h16v1H0V1zm0 4h16v1H0V5zm0 4h16v1H0V9zm0 4h16v1H0v-1z" opacity="0.5"/>
                  <path d="M1 0v16h1V0H1zm4 0v16h1V0H5zm4 0v16h1V0H9zm4 0v16h1V0h-1z" opacity="0.5"/>
                </svg>
                Guías
              </button>
            )}
          </div>
          {editorMode === 'edit' && (
            <Controls
              columns={columns}
              rows={rows}
              gap={gap}
              isNewspaperMode={isNewspaperMode}
              onColumnsChange={setColumns}
              onRowsChange={setRows}
              onGapChange={setGap}
            />
          )}
        </div>

        <EditorPage mode={editorMode}>
          <GridVisualizer
            columns={columns}
            rows={rows}
            gap={gapPx}
            gapMm={gap}
            isNewspaperMode={isNewspaperMode}
            elements={elements}
            selectedElementId={editorMode === 'edit' ? selectedElementId : null}
            onAddElement={editorMode === 'edit' ? handleAddElement : () => {}}
            onUpdateElement={editorMode === 'edit' ? handleUpdateElement : () => {}}
            onDeleteElement={editorMode === 'edit' ? handleDeleteElement : () => {}}
            onSelectElement={editorMode === 'edit' ? handleSelectElement : () => {}}
            showGuides={editorMode === 'edit' && showGuides}
            editorMode={editorMode}
          />
        </EditorPage>

        {editorMode === 'edit' && (
          <div className="container">
            <CodePanel
              showCode={showCode}
              activeTab={activeTab}
              columns={columns}
              rows={rows}
              gap={gap}
              isNewspaperMode={isNewspaperMode}
              elements={elements}
              onToggleCode={() => setShowCode(prev => !prev)}
              onTabChange={setActiveTab}
            />
          </div>
        )}
      </div>

      <TemplatesPanel
        onLoadTemplate={handleLoadTemplate}
        currentTemplate={getCurrentTemplate()}
        selectedElementId={selectedElementId}
        onUpdateElement={handleUpdateElement}
        columns={columns}
        rows={rows}
        gap={gap}
        elements={elements}
        isNewspaperMode={isNewspaperMode}
      />
    </div>
  )
}

export default App
