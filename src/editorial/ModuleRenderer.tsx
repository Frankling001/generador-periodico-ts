import React from 'react'
import { ModuleType, GridElement } from '../types'
import {
  HeadlineModule,
  SubheadlineModule,
  BodyTextModule,
  ImageModule,
  CaptionModule
} from './modules'

interface ModuleRendererProps {
  element: GridElement
  editable: boolean
  onUpdateContent: (updates: Partial<GridElement>) => void
}

/**
 * ModuleRenderer: Renderiza el módulo editorial según su tipo
 *
 * Actúa como factory pattern para los módulos editoriales.
 * Cada tipo de módulo tiene su propio componente con estilo editorial.
 */
function ModuleRenderer({ element, editable, onUpdateContent }: ModuleRendererProps) {
  const moduleType = element.moduleType || 'generic'

  // Extraer contenido según el tipo
  const getTextContent = (): string => {
    if (element.moduleContent) {
      const data = element.moduleContent.data as { text?: string }
      return data.text || ''
    }
    return element.text || ''
  }

  const getImageContent = (): { src: string; alt?: string } => {
    if (element.moduleContent?.type === 'image') {
      return element.moduleContent.data
    }
    return { src: element.image || '', alt: '' }
  }

  // Handlers de actualización
  const handleTextChange = (text: string) => {
    onUpdateContent({
      text,
      moduleContent: {
        type: moduleType as 'headline' | 'subheadline' | 'body' | 'caption',
        data: { text }
      }
    })
  }

  const handleImageChange = (src: string, alt?: string) => {
    onUpdateContent({
      image: src,
      moduleContent: {
        type: 'image',
        data: { src, alt }
      }
    })
  }

  // Renderizar según tipo
  switch (moduleType) {
    case 'headline':
      return (
        <HeadlineModule
          text={getTextContent()}
          onChange={handleTextChange}
          editable={editable}
        />
      )

    case 'subheadline':
      return (
        <SubheadlineModule
          text={getTextContent()}
          onChange={handleTextChange}
          editable={editable}
        />
      )

    case 'body':
      return (
        <BodyTextModule
          text={getTextContent()}
          onChange={handleTextChange}
          editable={editable}
        />
      )

    case 'image':
      const imageContent = getImageContent()
      return (
        <ImageModule
          src={imageContent.src}
          alt={imageContent.alt}
          onChange={handleImageChange}
          editable={editable}
        />
      )

    case 'caption':
      return (
        <CaptionModule
          text={getTextContent()}
          onChange={handleTextChange}
          editable={editable}
        />
      )

    case 'generic':
    default:
      // Renderizado legacy para compatibilidad
      return (
        <div className="editorial-module generic-module">
          {element.image ? (
            <div
              className="generic-image"
              style={{ backgroundImage: `url(${element.image})` }}
            />
          ) : null}
          <div className="generic-text">
            {editable ? (
              <textarea
                value={element.text || ''}
                onChange={(e) => onUpdateContent({ text: e.target.value })}
                placeholder="Contenido..."
                className="generic-textarea"
              />
            ) : (
              <span>{element.text || ''}</span>
            )}
          </div>
        </div>
      )
  }
}

export default ModuleRenderer
