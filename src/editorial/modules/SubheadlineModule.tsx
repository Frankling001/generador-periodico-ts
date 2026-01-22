import React, { useRef, useEffect } from 'react'

interface SubheadlineModuleProps {
  text: string
  onChange: (text: string) => void
  editable: boolean
}

/**
 * SubheadlineModule: Bajada / Subtítulo
 *
 * Características editoriales:
 * - Tipografía más pequeña que titular
 * - Color gris oscuro
 * - Complementa al titular
 */
function SubheadlineModule({ text, onChange, editable }: SubheadlineModuleProps) {
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
      <div className="editorial-module subheadline-module">
        <h2 className="subheadline-text">{text || 'Bajada del titular'}</h2>
      </div>
    )
  }

  return (
    <div className="editorial-module subheadline-module">
      <div
        ref={ref}
        className="subheadline-text subheadline-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder="Bajada del titular"
      />
    </div>
  )
}

export default SubheadlineModule
