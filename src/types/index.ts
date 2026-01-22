// Tipos de módulos editoriales
export type ModuleType =
  | 'headline'      // Titular principal
  | 'subheadline'   // Bajada / subtítulo
  | 'body'          // Cuerpo de texto
  | 'image'         // Imagen
  | 'caption'       // Pie de foto
  | 'generic'       // Bloque genérico (compatibilidad)

// Contenido específico por tipo de módulo
export interface HeadlineContent {
  text: string
}

export interface SubheadlineContent {
  text: string
}

export interface BodyContent {
  text: string
}

export interface ImageContent {
  src: string       // Base64 o URL
  alt?: string
}

export interface CaptionContent {
  text: string
}

export interface GenericContent {
  text: string
  color: string
  image?: string
}

// Unión de contenidos
export type ModuleContent =
  | { type: 'headline'; data: HeadlineContent }
  | { type: 'subheadline'; data: SubheadlineContent }
  | { type: 'body'; data: BodyContent }
  | { type: 'image'; data: ImageContent }
  | { type: 'caption'; data: CaptionContent }
  | { type: 'generic'; data: GenericContent }

export interface GridElement {
  id: number;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
  // Campos legacy (compatibilidad)
  text: string;
  color: string;
  image?: string;
  // Campo nuevo: módulo editorial
  moduleType?: ModuleType;
  moduleContent?: ModuleContent;
}

export interface TemplateData {
  columns: number;
  rows: number;
  gap: number;
  isNewspaperMode: boolean;
  elements: GridElement[];
}

export interface GhostPosition {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  isOccupied: boolean;
}

export type PageSize = 'newspaper' | 'a4' | 'letter' | 'custom';

export interface PDFConfig {
  elements: GridElement[];
  columns: number;
  rows: number;
  gap: number;
  pageSize: PageSize;
  customSize?: { width: number; height: number };
}