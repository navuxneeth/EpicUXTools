class ContrastChecker {
    constructor() {
        this.fgColor = '#000000';
        this.bgColor = '#FFFFFF';
        this.init();
    }

    init() {
        this.fgColorInput = document.getElementById('fgColor');
        this.bgColorInput = document.getElementById('bgColor');
        this.fgHexInput = document.getElementById('fgHex');
        this.bgHexInput = document.getElementById('bgHex');
        this.swapBtn = document.getElementById('swapBtn');
        this.previewSection = document.getElementById('previewSection');
        this.previewLarge = document.getElementById('previewLarge');
        this.previewNormal = document.getElementById('previewNormal');
        this.contrastRatioDisplay = document.getElementById('contrastRatio');
        this.normalAAResult = document.getElementById('normalAAResult');
        this.normalAAAResult = document.getElementById('normalAAAResult');
        this.largeAAResult = document.getElementById('largeAAResult');
        this.largeAAAResult = document.getElementById('largeAAAResult');

        this.setupEventListeners();
        this.updateContrast();
    }

    setupEventListeners() {
        this.fgColorInput.addEventListener('input', (e) => {
            this.fgColor = e.target.value;
            this.fgHexInput.value = this.fgColor;
            this.updateContrast();
        });

        this.bgColorInput.addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            this.bgHexInput.value = this.bgColor;
            this.updateContrast();
        });

        this.fgHexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                this.fgColor = hex;
                this.fgColorInput.value = hex;
                this.updateContrast();
            }
        });

        this.bgHexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                this.bgColor = hex;
                this.bgColorInput.value = hex;
                this.updateContrast();
            }
        });

        this.swapBtn.addEventListener('click', () => {
            [this.fgColor, this.bgColor] = [this.bgColor, this.fgColor];
            this.fgColorInput.value = this.fgColor;
            this.bgColorInput.value = this.bgColor;
            this.fgHexInput.value = this.fgColor;
            this.bgHexInput.value = this.bgColor;
            this.updateContrast();
        });
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    calculateContrast(fg, bg) {
        const fgRgb = this.hexToRgb(fg);
        const bgRgb = this.hexToRgb(bg);
        
        const fgLum = this.getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
        const bgLum = this.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
        
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    updateContrast() {
        this.previewSection.style.backgroundColor = this.bgColor;
        this.previewSection.style.color = this.fgColor;
        this.previewLarge.style.color = this.fgColor;
        this.previewNormal.style.color = this.fgColor;

        const ratio = this.calculateContrast(this.fgColor, this.bgColor);
        this.contrastRatioDisplay.textContent = `${ratio.toFixed(2)}:1`;

        // WCAG AA/AAA Standards
        // Normal text: AA = 4.5:1, AAA = 7:1
        // Large text (18pt+/14pt+ bold): AA = 3:1, AAA = 4.5:1
        
        this.updateResult(this.normalAAResult, ratio >= 4.5, 'AA Normal');
        this.updateResult(this.normalAAAResult, ratio >= 7, 'AAA Normal');
        this.updateResult(this.largeAAResult, ratio >= 3, 'AA Large');
        this.updateResult(this.largeAAAResult, ratio >= 4.5, 'AAA Large');
    }

    updateResult(element, passed, label) {
        element.textContent = passed ? `${label}: PASS` : `${label}: FAIL`;
        element.className = `result-status ${passed ? 'pass' : 'fail'}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContrastChecker();
});

console.log('CONTRAST CHECKER v1.0');
console.log('Check WCAG color contrast ratios');
