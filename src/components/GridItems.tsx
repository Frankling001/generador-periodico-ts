import React, { useEffect, useRef, useCallback } from 'react'
import { DEFAULT_COLOR } from '../utils/colors'
import { GridElement } from '../types'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

interface GridItemsProps {
  elements: GridElement[];
  draggedElement: { element: GridElement; elementId: number } | null
  dragOffset: { x: number; y: number }
  onDeleteElement: (id: number) => void
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>, element: GridElement) => void
  onUpdateElement: (id: number, updates: Partial<GridElement>) => void
  selectedElementId: number | null
  columns: number
  rows: number
  gap: number
  isNewspaperMode: boolean
  style: React.CSSProperties
}

function GridItems({ elements, draggedElement, dragOffset, onDeleteElement, onResizeStart, onUpdateElement, selectedElementId, columns, rows, gap, isNewspaperMode, style }:GridItemsProps) {
  const itemRefs = useRef<Record<number, HTMLDivElement|null>>({})
  const dragDimensionsRef = useRef({ width: 0, height: 0 })
  const fileInputRefs = useRef<Record<number, HTMLInputElement|null>>({})

  const handleImageUpload = useCallback((elementId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    if (file.size > MAX_IMAGE_SIZE) {
      alert('La imagen es demasiado grande. El límite es 2MB.')
      return
    }

    // Validar formato
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Usa JPG, PNG, GIF o WebP.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      onUpdateElement(elementId, { image: event.target?.result as string })
    }
    reader.readAsDataURL(file)

    // Limpiar input para permitir subir la misma imagen de nuevo
    e.target.value = ''
  }, [onUpdateElement])

  const handleRemoveImage = useCallback((elementId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateElement(elementId, { image: undefined })
  }, [onUpdateElement])

  const triggerImageUpload = useCallback((elementId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRefs.current[elementId]?.click()
  }, [])

  useEffect(() => {
    if (draggedElement) {
      const elementId = draggedElement.elementId
      const item = itemRefs.current[elementId]
      if (item) {
        const element = draggedElement.element
        
        // Capturar dimensiones ANTES de cambiar a position: fixed
        const rect = item.getBoundingClientRect()
        const originalWidth = rect.width
        const originalHeight = rect.height
        
        // Guardar dimensiones para uso posterior
        dragDimensionsRef.current = {
          width: originalWidth,
          height: originalHeight
        }
        
        // Aplicar estilos de dragging
        item.classList.add('dragging')
        item.style.position = 'fixed'
        item.style.left = `${rect.left}px`
        item.style.top = `${rect.top}px`
        item.style.width = `${originalWidth}px`
        item.style.height = `${originalHeight}px`
        item.style.margin = '0'
        item.style.zIndex = '1000'
        // Asegurar que mantenga sus dimensiones
        item.style.minWidth = `${originalWidth}px`
        item.style.minHeight = `${originalHeight}px`
        item.style.maxWidth = `${originalWidth}px`
        item.style.maxHeight = `${originalHeight}px`
      }
    } else {
      Object.values(itemRefs.current).forEach(item => {
        if (item) {
          item.classList.remove('dragging')
          item.style.position = ''
          item.style.left = ''
          item.style.top = ''
          item.style.width = ''
          item.style.height = ''
          item.style.margin = ''
          item.style.zIndex = ''
          item.style.minWidth = ''
          item.style.minHeight = ''
          item.style.maxWidth = ''
          item.style.maxHeight = ''
        }
      })
      dragDimensionsRef.current = { width: 0, height: 0 }
    }
  }, [draggedElement])

  useEffect(() => {
    const handleMouseMove = (e:MouseEvent) => {
      if (draggedElement) {
        const elementId = draggedElement.elementId
        const item = itemRefs.current[elementId]
        if (item) {
          // Mantener las dimensiones originales durante el arrastre
          const { width, height } = dragDimensionsRef.current
          item.style.left = `${e.clientX - dragOffset.x}px`
          item.style.top = `${e.clientY - dragOffset.y}px`
          // Asegurar que las dimensiones se mantengan
          if (width > 0 && height > 0) {
            item.style.width = `${width}px`
            item.style.height = `${height}px`
          }
        }
      }
    }

    if (draggedElement) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [draggedElement, dragOffset])


  return (
    <div className="grid-items" style={style}>
      {elements.map(element => (
        <div
          key={element.id}
          ref={el => itemRefs.current[element.id] = el}
          className={`grid-item${element.image ? ' has-image' : ''}`}
          data-id={element.id}
          style={{
            gridColumn: `${element.column} / span ${element.columnSpan}`,
            gridRow: `${element.row} / span ${element.rowSpan}`,
            backgroundColor: element.color || DEFAULT_COLOR,
            backgroundImage: element.image ? `url(${element.image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            outline: selectedElementId === element.id && draggedElement?.elementId !== element.id ? '3px solid #2b2b2b' : 'none',
            outlineOffset: '-2px'
          }}
        >
          {/* Input oculto para subir imagen */}
          <input
            type="file"
            ref={el => fileInputRefs.current[element.id] = el}
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleImageUpload(element.id, e)}
          />

          {isNewspaperMode ? (
            <>
              <textarea
                className="grid-item-text"
                value={element.text || ''}
                onChange={(e) => {
                  e.stopPropagation()
                  onUpdateElement(element.id, { text: e.target.value })
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                placeholder="Escribe tu contenido aquí..."
                onClick={(e) => e.stopPropagation()}
              />
              {/* Botón de imagen */}
              {element.image ? (
                <button
                  className="image-btn remove-image-btn"
                  onClick={(e) => handleRemoveImage(element.id, e)}
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              ) : (
                <button
                  className="image-btn"
                  onClick={(e) => triggerImageUpload(element.id, e)}
                  title="Agregar imagen"
                >
                  🖼️
                </button>
              )}
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteElement(element.id)
                }}
              >
                ×
              </button>
              <div
                className="resize-handle"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onResizeStart(e, element)
                }}
              ></div>
            </>
          ) : (
            <>
              <span className="item-number">{element.id}</span>
              {/* Botón de imagen en modo no-periódico */}
              {element.image ? (
                <button
                  className="image-btn remove-image-btn"
                  onClick={(e) => handleRemoveImage(element.id, e)}
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              ) : (
                <button
                  className="image-btn"
                  onClick={(e) => triggerImageUpload(element.id, e)}
                  title="Agregar imagen"
                >
                  🖼️
                </button>
              )}
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteElement(element.id)
                }}
              >
                ×
              </button>
              <div
                className="resize-handle"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onResizeStart(e, element)
                }}
              ></div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default GridItems
