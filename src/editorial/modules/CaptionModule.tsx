import React, { useRef, useEffect } from 'react'

interface CaptionModuleProps {
  text: string
  onChange: (text: string) => void
  editable: boolean
}

/**
 * CaptionModule: Pie de foto
 *
 * Características editoriales:
 * - Tipografía pequeña
 * - Color gris
 * - Alineado al módulo de imagen
 */
function CaptionModule({ text, onChange, editable }: CaptionModuleProps) {
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
      <div className="editorial-module caption-module">
        <figcaption className="caption-text">
          {text || 'Pie de foto'}
        </figcaption>
      </div>
    )
  }

  return (
    <div className="editorial-module caption-module">
      <div
        ref={ref}
        className="caption-text caption-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder="Pie de foto"
      />
    </div>
  )
}

export default CaptionModule
