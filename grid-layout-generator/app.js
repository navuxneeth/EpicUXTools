class GridLayoutGenerator {
    constructor() {
        this.columns = 3;
        this.rows = 3;
        this.gap = 10;
        this.columnTemplate = 'equal';
        this.rowTemplate = 'equal';
        this.init();
    }

    init() {
        this.columnsInput = document.getElementById('columns');
        this.rowsInput = document.getElementById('rows');
        this.gapInput = document.getElementById('gap');
        this.columnTemplateSelect = document.getElementById('columnTemplate');
        this.rowTemplateSelect = document.getElementById('rowTemplate');
        this.gridContainer = document.getElementById('gridContainer');
        this.codeOutput = document.getElementById('codeOutput');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        this.setupEventListeners();
        this.updateGrid();
    }

    setupEventListeners() {
        this.columnsInput.addEventListener('input', (e) => {
            this.columns = parseInt(e.target.value);
            this.updateGrid();
        });

        this.rowsInput.addEventListener('input', (e) => {
            this.rows = parseInt(e.target.value);
            this.updateGrid();
        });

        this.gapInput.addEventListener('input', (e) => {
            this.gap = parseInt(e.target.value);
            this.updateGrid();
        });

        this.columnTemplateSelect.addEventListener('change', (e) => {
            this.columnTemplate = e.target.value;
            this.updateGrid();
        });

        this.rowTemplateSelect.addEventListener('change', (e) => {
            this.rowTemplate = e.target.value;
            this.updateGrid();
        });

        this.copyBtn.addEventListener('click', () => this.copyCSS());
        this.downloadBtn.addEventListener('click', () => this.downloadCSS());
    }

    getTemplateValue(type, count) {
        switch(type) {
            case 'equal':
                return `repeat(${count}, 1fr)`;
            case 'auto':
                return `repeat(${count}, auto)`;
            case 'minmax':
                return count === this.columns 
                    ? `repeat(${count}, minmax(200px, 1fr))`
                    : `repeat(${count}, minmax(100px, 1fr))`;
            case 'custom':
                return `repeat(${count}, 1fr)`;
            default:
                return `repeat(${count}, 1fr)`;
        }
    }

    updateGrid() {
        const columnValue = this.getTemplateValue(this.columnTemplate, this.columns);
        const rowValue = this.getTemplateValue(this.rowTemplate, this.rows);

        this.gridContainer.style.gridTemplateColumns = columnValue;
        this.gridContainer.style.gridTemplateRows = rowValue;
        this.gridContainer.style.gap = `${this.gap}px`;

        this.gridContainer.innerHTML = '';
        const totalItems = this.columns * this.rows;
        for (let i = 1; i <= totalItems; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.textContent = `${i}`;
            this.gridContainer.appendChild(item);
        }

        this.updateCode(columnValue, rowValue);
    }

    updateCode(columnValue, rowValue) {
        const css = `.grid-container {
  display: grid;
  grid-template-columns: ${columnValue};
  grid-template-rows: ${rowValue};
  gap: ${this.gap}px;
}

.grid-item {
  /* Your item styles here */
}`;

        this.codeOutput.textContent = css;
    }

    copyCSS() {
        navigator.clipboard.writeText(this.codeOutput.textContent).then(() => {
            alert('CSS copied to clipboard!');
        });
    }

    downloadCSS() {
        const blob = new Blob([this.codeOutput.textContent], { type: 'text/css' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'grid-layout.css';
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GridLayoutGenerator();
});

console.log('GRID LAYOUT GENERATOR v1.0');
console.log('Generate CSS Grid layouts visually');
