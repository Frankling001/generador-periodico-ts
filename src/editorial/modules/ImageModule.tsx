import React, { useRef, useCallback } from 'react'

interface ImageModuleProps {
  src: string
  alt?: string
  onChange: (src: string, alt?: string) => void
  editable: boolean
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * ImageModule: Imagen editorial
 *
 * Características editoriales:
 * - Sin bordes ni sombras
 * - Ocupa todo el espacio del módulo
 * - object-fit: cover para mantener proporción
 */
function ImageModule({ src, alt, onChange, editable }: ImageModuleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE) {
      alert('La imagen es demasiado grande. El límite es 2MB.')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Usa JPG, PNG, GIF o WebP.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      onChange(event.target?.result as string, alt)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [onChange, alt])

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (!src) {
    return (
      <div className="editorial-module image-module image-placeholder" onClick={handleClick}>
        {editable && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
            />
            <div className="image-placeholder-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span>Agregar imagen</span>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="editorial-module image-module" onClick={handleClick}>
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
        />
      )}
      <img
        src={src}
        alt={alt || ''}
        className="editorial-image"
      />
    </div>
  )
}

export default ImageModule
