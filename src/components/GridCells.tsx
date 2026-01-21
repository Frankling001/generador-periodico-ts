import React, { forwardRef } from 'react'

interface GridCellsProps {
  columns: number;
  rows: number;
  style: React.CSSProperties;

}

const GridCells = forwardRef<HTMLDivElement, GridCellsProps>(({ columns, rows, style }, ref) => {
  const cells = []
  const totalCells = columns * rows

  for (let i = 0; i < totalCells; i++) {
    const col = (i % columns) + 1
    const row = Math.floor(i / columns) + 1
    cells.push(
      <div
        key={i}
        className="grid-cell"
        data-index={i}
        data-col={col}
        data-row={row}
      >
        <span className="plus-icon">+</span>
      </div>
    )
  }

  return (
    <div ref={ref} className="grid-cells" style={style}>
      {cells}
    </div>
  )
})

GridCells.displayName = 'GridCells'

export default GridCells
