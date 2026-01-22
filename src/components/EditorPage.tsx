import React, { ReactNode } from 'react'

interface EditorPageProps {
  children: ReactNode
  mode?: 'edit' | 'preview'
}

/**
 * EditorPage: Contenedor que representa la "hoja de papel"
 *
 * Filosofía editorial:
 * - La página es un objeto físico sobre una mesa de trabajo
 * - El fondo gris simula la superficie de trabajo
 * - La página blanca "flota" con sombra sutil
 * - Proporción vertical tipo tabloide
 */
function EditorPage({ children, mode = 'edit' }: EditorPageProps) {
  return (
    <div className="editor-canvas">
      <div className={`page-container ${mode === 'preview' ? 'preview-mode' : ''}`}>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default EditorPage
