import React, { useRef, useEffect } from 'react'

interface HeadlineModuleProps {
  text: string
  onChange: (text: string) => void
  editable: boolean
}

/**
 * HeadlineModule: Titular principal
 *
 * Características editoriales:
 * - Tipografía serif o sans bold, grande
 * - Sin decoración
 * - Jerarquía visual máxima
 */
function HeadlineModule({ text, onChange, editable }: HeadlineModuleProps) {
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
      <div className="editorial-module headline-module">
        <h1 className="headline-text">{text || 'Titular'}</h1>
      </div>
    )
  }

  return (
    <div className="editorial-module headline-module">
      <div
        ref={ref}
        className="headline-text headline-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder="Titular"
      />
    </div>
  )
}

export default HeadlineModule
