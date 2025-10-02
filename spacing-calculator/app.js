class SpacingCalculator {
    constructor() {
        this.baseValue = 8;
        this.scaleType = 'linear';
        this.multiplier = 1.5;
        this.steps = 8;
        this.init();
    }

    init() {
        this.baseValueInput = document.getElementById('baseValue');
        this.scaleTypeSelect = document.getElementById('scaleType');
        this.multiplierInput = document.getElementById('multiplier');
        this.multiplierGroup = document.getElementById('multiplierGroup');
        this.stepsInput = document.getElementById('steps');
        this.spacingPreview = document.getElementById('spacingPreview');
        this.codeOutput = document.getElementById('codeOutput');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        this.setupEventListeners();
        this.updateScale();
    }

    setupEventListeners() {
        this.baseValueInput.addEventListener('input', (e) => {
            this.baseValue = parseInt(e.target.value);
            this.updateScale();
        });

        this.scaleTypeSelect.addEventListener('change', (e) => {
            this.scaleType = e.target.value;
            this.multiplierGroup.style.display = this.scaleType === 'custom' ? 'flex' : 'none';
            this.updateScale();
        });

        this.multiplierInput.addEventListener('input', (e) => {
            this.multiplier = parseFloat(e.target.value);
            this.updateScale();
        });

        this.stepsInput.addEventListener('input', (e) => {
            this.steps = parseInt(e.target.value);
            this.updateScale();
        });

        this.copyBtn.addEventListener('click', () => this.copyCSS());
        this.downloadBtn.addEventListener('click', () => this.downloadCSS());
    }

    calculateScale() {
        const scale = [];
        
        switch(this.scaleType) {
            case 'linear':
                for (let i = 0; i < this.steps; i++) {
                    scale.push(this.baseValue * (i + 1));
                }
                break;
                
            case 'fibonacci':
                let fib = [1, 1];
                for (let i = 2; i < this.steps; i++) {
                    fib.push(fib[i-1] + fib[i-2]);
                }
                scale.push(...fib.slice(0, this.steps).map(f => f * this.baseValue));
                break;
                
            case 'golden':
                const phi = 1.618;
                for (let i = 0; i < this.steps; i++) {
                    scale.push(Math.round(this.baseValue * Math.pow(phi, i)));
                }
                break;
                
            case 'modular':
                for (let i = 0; i < this.steps; i++) {
                    scale.push(Math.round(this.baseValue * Math.pow(1.5, i)));
                }
                break;
                
            case 'custom':
                for (let i = 0; i < this.steps; i++) {
                    scale.push(Math.round(this.baseValue * Math.pow(this.multiplier, i)));
                }
                break;
        }
        
        return scale;
    }

    updateScale() {
        const scale = this.calculateScale();
        this.renderPreview(scale);
        this.generateCSS(scale);
    }

    renderPreview(scale) {
        this.spacingPreview.innerHTML = '';
        
        scale.forEach((value, index) => {
            const item = document.createElement('div');
            item.className = 'spacing-item';
            
            const label = document.createElement('div');
            label.className = 'spacing-label';
            label.textContent = `Step ${index + 1}`;
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'spacing-value';
            valueDiv.textContent = `${value}px`;
            
            const box = document.createElement('div');
            box.className = 'spacing-box';
            box.style.width = `${value}px`;
            
            item.appendChild(label);
            item.appendChild(valueDiv);
            item.appendChild(box);
            
            this.spacingPreview.appendChild(item);
        });
    }

    generateCSS(scale) {
        const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl'];
        const cssVars = scale.map((value, index) => {
            const name = names[index] || `${index + 1}xl`;
            return `  --spacing-${name}: ${value}px;`;
        }).join('\n');

        const css = `:root {\n${cssVars}\n}`;
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
        link.download = 'spacing-scale.css';
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SpacingCalculator();
});

console.log('SPACING CALCULATOR v1.0');
console.log('Calculate consistent spacing scales');
