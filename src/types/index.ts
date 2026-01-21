export interface GridElement {
  id: number;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
  text: string;
  color: string;
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