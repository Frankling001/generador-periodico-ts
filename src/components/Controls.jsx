import React from 'react'

function Controls({ columns, rows, gap, onColumnsChange, onRowsChange, onGapChange }) {
  const handleDecrease = (property, min, onChange) => {
    const currentValue = property === 'columns' ? columns : property === 'rows' ? rows : gap
    if (currentValue > min) {
      onChange(currentValue - 1)
    }
  }

  const handleIncrease = (property, max, onChange) => {
    const currentValue = property === 'columns' ? columns : property === 'rows' ? rows : gap
    if (currentValue < max) {
      onChange(currentValue + 1)
    }
  }

  const ControlButton = ({ label, value, property, min, max, onChange }) => {
    const handleDecreaseClick = (e) => {
      e.stopPropagation()
      handleDecrease(property, min, onChange)
    }

    const handleIncreaseClick = (e) => {
      e.stopPropagation()
      handleIncrease(property, max, onChange)
    }

    return (
      <div className="control-item">
        <label>{label}</label>
        <button className="control-btn">
          <span className="control-decrease" onClick={handleDecreaseClick}>−</span>
          <span>{value}</span>
          <span className="control-increase" onClick={handleIncreaseClick}>+</span>
        </button>
      </div>
    )
  }

  return (
    <div className="controls-horizontal">
      <ControlButton
        label="Columns"
        value={columns}
        property="columns"
        min={1}
        max={24}
        onChange={onColumnsChange}
      />
      <ControlButton
        label="Rows"
        value={rows}
        property="rows"
        min={1}
        max={24}
        onChange={onRowsChange}
      />
      <ControlButton
        label="Gap(px)"
        value={gap}
        property="gap"
        min={0}
        max={50}
        onChange={onGapChange}
      />
    </div>
  )
}

export default Controls
