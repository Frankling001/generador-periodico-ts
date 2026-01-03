// Estado global
const state = {
    columns: 5,
    rows: 12,
    gap: 8,
    elements: [],
    elementCounter: 1
};

// Referencias DOM
const gridContainer = document.getElementById('grid-container');
const columnsValue = document.getElementById('columns-value');
const rowsValue = document.getElementById('rows-value');
const gapValue = document.getElementById('gap-value');
const columnsBtn = document.getElementById('columns-btn');
const rowsBtn = document.getElementById('rows-btn');
const gapBtn = document.getElementById('gap-btn');
const toggleCodeBtn = document.getElementById('toggle-code');
const codePanel = document.getElementById('code-panel');
const copyCodeBtn = document.getElementById('copy-code');
const tabBtns = document.querySelectorAll('.tab-btn');
const htmlCodeBlock = document.querySelector('#html-code code');
const cssCodeBlock = document.querySelector('#css-code code');

// Variables para drag & drop
let draggedElement = null;
let resizingElement = null;
let startX, startY, startCol, startRow, startColSpan, startRowSpan;

// Inicializar
function init() {
    generateGridCells();
    updateGridStyles();
    generateCode();
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    // Controles con botones +/-
    setupControlButton(columnsBtn, 'columns', 1, 24);
    setupControlButton(rowsBtn, 'rows', 1, 24);
    setupControlButton(gapBtn, 'gap', 0, 50);

    // Toggle código
    toggleCodeBtn.addEventListener('click', () => {
        const isVisible = codePanel.style.display !== 'none';
        codePanel.style.display = isVisible ? 'none' : 'block';
        toggleCodeBtn.textContent = isVisible ? 'Show Code' : 'Hide Code';
    });

    // Copiar código
    copyCodeBtn.addEventListener('click', copyCode);

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Drag & drop
    gridContainer.addEventListener('dragover', handleDragOver);
    gridContainer.addEventListener('drop', handleDrop);
}

// Configurar botón de control con +/-
function setupControlButton(btn, property, min, max) {
    const decreaseBtn = btn.querySelector('.control-decrease');
    const increaseBtn = btn.querySelector('.control-increase');
    const valueSpan = document.getElementById(`${property}-value`);

    decreaseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state[property] > min) {
            state[property]--;
            valueSpan.textContent = state[property];
            updateGrid();
        }
    });

    increaseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state[property] < max) {
            state[property]++;
            valueSpan.textContent = state[property];
            updateGrid();
        }
    });
}

// Actualizar grid
function updateGrid() {
    updateGridStyles();
    generateGridCells();
    rerenderElements();
    generateCode();
}

// Generar celdas del grid
function generateGridCells() {
    // Limpiar celdas existentes pero mantener elementos
    const existingElements = Array.from(gridContainer.querySelectorAll('.grid-item'));
    gridContainer.innerHTML = '';

    // Crear celdas con símbolo +
    const totalCells = state.columns * state.rows;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.innerHTML = '<span class="plus-icon">+</span>';

        // Evento para agregar elemento al hacer clic
        cell.addEventListener('click', () => {
            const col = (i % state.columns) + 1;
            const row = Math.floor(i / state.columns) + 1;
            addElementAt(col, row);
        });

        gridContainer.appendChild(cell);
    }

    // Re-agregar elementos existentes
    existingElements.forEach(el => gridContainer.appendChild(el));
}

// Actualizar estilos del grid
function updateGridStyles() {
    gridContainer.style.gridTemplateColumns = `repeat(${state.columns}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
    gridContainer.style.gap = `${state.gap}px`;
}

// Agregar elemento en posición específica
function addElementAt(col, row) {
    const element = {
        id: state.elementCounter++,
        column: col,
        row: row,
        columnSpan: 1,
        rowSpan: 1
    };

    state.elements.push(element);
    renderElement(element);
    generateCode();
}

// Renderizar elemento en el grid
function renderElement(element) {
    const div = document.createElement('div');
    div.className = 'grid-item';
    div.draggable = true;
    div.dataset.id = element.id;

    div.style.gridColumn = `${element.column} / span ${element.columnSpan}`;
    div.style.gridRow = `${element.row} / span ${element.rowSpan}`;

    div.innerHTML = `
        <span class="item-number">${element.id}</span>
        <button class="delete-btn">×</button>
        <div class="resize-handle"></div>
    `;

    // Event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteElement(element.id);
    });

    const resizeHandle = div.querySelector('.resize-handle');
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startResize(e, element);
    });

    gridContainer.appendChild(div);
}

// Re-renderizar todos los elementos
function rerenderElements() {
    // Eliminar elementos existentes del DOM
    const items = gridContainer.querySelectorAll('.grid-item');
    items.forEach(item => item.remove());

    // Validar y ajustar posiciones de elementos
    state.elements = state.elements.map(el => {
        return {
            ...el,
            column: Math.min(el.column, state.columns),
            row: Math.min(el.row, state.rows),
            columnSpan: Math.min(el.columnSpan, state.columns - el.column + 1),
            rowSpan: Math.min(el.rowSpan, state.rows - el.row + 1)
        };
    });

    // Renderizar cada elemento
    state.elements.forEach(element => renderElement(element));
}

// Eliminar elemento
function deleteElement(id) {
    state.elements = state.elements.filter(el => el.id !== id);
    const elementDiv = gridContainer.querySelector(`[data-id="${id}"]`);
    if (elementDiv) {
        elementDiv.remove();
    }
    generateCode();
}

// Drag & Drop
function handleDragStart(e) {
    draggedElement = e.target;
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();

    if (!draggedElement) return;

    const gridRect = gridContainer.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;

    const cellWidth = gridRect.width / state.columns;
    const cellHeight = gridRect.height / state.rows;

    const col = Math.max(1, Math.min(state.columns, Math.floor(x / cellWidth) + 1));
    const row = Math.max(1, Math.min(state.rows, Math.floor(y / cellHeight) + 1));

    const elementId = parseInt(draggedElement.dataset.id);
    const element = state.elements.find(el => el.id === elementId);

    if (element) {
        element.column = col;
        element.row = row;
        // Ajustar spans si es necesario
        element.columnSpan = Math.min(element.columnSpan, state.columns - element.column + 1);
        element.rowSpan = Math.min(element.rowSpan, state.rows - element.row + 1);

        draggedElement.style.gridColumn = `${element.column} / span ${element.columnSpan}`;
        draggedElement.style.gridRow = `${element.row} / span ${element.rowSpan}`;
        generateCode();
    }
}

// Resize
function startResize(e, element) {
    resizingElement = element;
    startX = e.clientX;
    startY = e.clientY;
    startColSpan = element.columnSpan;
    startRowSpan = element.rowSpan;

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);

    e.preventDefault();
}

function handleResize(e) {
    if (!resizingElement) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const gridRect = gridContainer.getBoundingClientRect();
    const cellWidth = gridRect.width / state.columns;
    const cellHeight = gridRect.height / state.rows;

    const colChange = Math.round(deltaX / cellWidth);
    const rowChange = Math.round(deltaY / cellHeight);

    const maxColSpan = state.columns - resizingElement.column + 1;
    const maxRowSpan = state.rows - resizingElement.row + 1;

    const newColSpan = Math.max(1, Math.min(maxColSpan, startColSpan + colChange));
    const newRowSpan = Math.max(1, Math.min(maxRowSpan, startRowSpan + rowChange));

    resizingElement.columnSpan = newColSpan;
    resizingElement.rowSpan = newRowSpan;

    const elementDiv = gridContainer.querySelector(`[data-id="${resizingElement.id}"]`);
    if (elementDiv) {
        elementDiv.style.gridColumn = `${resizingElement.column} / span ${resizingElement.columnSpan}`;
        elementDiv.style.gridRow = `${resizingElement.row} / span ${resizingElement.rowSpan}`;
    }

    generateCode();
}

function stopResize() {
    resizingElement = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

// Generar código
function generateCode() {
    generateHTML();
    generateCSS();
}

function generateHTML() {
    let html = '<div class="grid-container">\n';

    state.elements.forEach(element => {
        html += `  <div class="grid-item item-${element.id}">Element ${element.id}</div>\n`;
    });

    html += '</div>';

    htmlCodeBlock.textContent = html;
}

function generateCSS() {
    let css = '.grid-container {\n';
    css += '  display: grid;\n';
    css += `  grid-template-columns: repeat(${state.columns}, 1fr);\n`;
    css += `  grid-template-rows: repeat(${state.rows}, 1fr);\n`;

    if (state.gap > 0) {
        css += `  gap: ${state.gap}px;\n`;
    }

    css += '}\n\n';

    css += '.grid-item {\n';
    css += '  background: #8b7e6a;\n';
    css += '  padding: 20px;\n';
    css += '  border-radius: 10px;\n';
    css += '  color: white;\n';
    css += '  display: flex;\n';
    css += '  align-items: center;\n';
    css += '  justify-content: center;\n';
    css += '}\n';

    if (state.elements.length > 0) {
        css += '\n';
        state.elements.forEach(element => {
            css += `.item-${element.id} {\n`;
            css += `  grid-column: ${element.column} / span ${element.columnSpan};\n`;
            css += `  grid-row: ${element.row} / span ${element.rowSpan};\n`;
            css += '}\n\n';
        });
    }

    cssCodeBlock.textContent = css;
}

// Copiar código
function copyCode() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    const code = activeTab === 'html' ? htmlCodeBlock.textContent : cssCodeBlock.textContent;

    navigator.clipboard.writeText(code).then(() => {
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = 'Copied!';

        setTimeout(() => {
            copyCodeBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        alert('Error copying: ' + err);
    });
}

// Cambiar tab
function switchTab(tab) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.code-block').forEach(block => {
        block.classList.remove('active');
    });

    document.getElementById(`${tab}-code`).classList.add('active');
}

// Iniciar aplicación
init();
