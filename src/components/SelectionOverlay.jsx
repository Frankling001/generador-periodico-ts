import React from 'react'

function SelectionOverlay({ isSelecting, selectionStart, selectionEnd, ghostPosition, isPositionOccupied, draggedElement, style }) {
  let overlayStyle = {}
  let isOccupied = false

  if (isSelecting && selectionStart && selectionEnd) {
    const minCol = Math.min(selectionStart.col, selectionEnd.col)
    const maxCol = Math.max(selectionStart.col, selectionEnd.col)
    const minRow = Math.min(selectionStart.row, selectionEnd.row)
    const maxRow = Math.max(selectionStart.row, selectionEnd.row)

    const colSpan = maxCol - minCol + 1
    const rowSpan = maxRow - minRow + 1

    isOccupied = isPositionOccupied(minCol, minRow, colSpan, rowSpan)

    overlayStyle = {
      '--sel-col-start': minCol,
      '--sel-col-end': maxCol + 1,
      '--sel-row-start': minRow,
      '--sel-row-end': maxRow + 1
    }
  } else if (ghostPosition) {
    // Si hay un ghostPosition, usar su estado isOccupied si está disponible
    isOccupied = ghostPosition.isOccupied || false
    
    overlayStyle = {
      '--sel-col-start': ghostPosition.col,
      '--sel-col-end': ghostPosition.col + ghostPosition.colSpan,
      '--sel-row-start': ghostPosition.row,
      '--sel-row-end': ghostPosition.row + ghostPosition.rowSpan
    }
  }

  const isActive = (isSelecting && selectionStart && selectionEnd) || ghostPosition

  return (
    <div
      className={`selection-overlay ${isActive ? 'active' : ''} ${isOccupied ? 'occupied' : ''}`}
      style={{ ...style, ...overlayStyle }}
    />
  )
}

export default SelectionOverlay
