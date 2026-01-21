export interface GridElement {
  id: number;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
  text: string;
  color: string;
  image?: string;  // Base64 data URL
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