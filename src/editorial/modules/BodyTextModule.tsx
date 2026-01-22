import React, { useRef, useEffect } from 'react'

interface BodyTextModuleProps {
  text: string
  onChange: (text: string) => void
  editable: boolean
}

/**
 * BodyTextModule: Cuerpo de texto
 *
 * Características editoriales:
 * - Tipografía legible (serif para impresión)
 * - Interlineado generoso (1.6-1.8)
 * - Justificado o alineado a izquierda
 * - Párrafos con sangría o separación
 */
function BodyTextModule({ text, onChange, editable }: BodyTextModuleProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && editable) {
      ref.current.innerText = text
    }
  }, [])

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerText)
    }
  }

  if (!editable) {
    return (
      <div className="editorial-module body-module">
        <div className="body-text">
          {text || 'Cuerpo de texto. Escribe aquí el contenido del artículo.'}
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-module body-module">
      <div
        ref={ref}
        className="body-text body-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder="Cuerpo de texto..."
      />
    </div>
  )
}

export default BodyTextModule
