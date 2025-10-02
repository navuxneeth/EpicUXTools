class ColorPaletteGenerator {
    constructor() {
        this.baseColor = '#6AB0A2';
        this.currentScheme = 'monochromatic';
        this.init();
    }

    init() {
        this.baseColorInput = document.getElementById('baseColor');
        this.paletteGrid = document.getElementById('paletteGrid');
        this.randomBtn = document.getElementById('randomBtn');
        this.schemeButtons = document.querySelectorAll('.scheme-btn');
        this.exportBtn = document.getElementById('exportBtn');
        this.copyAllBtn = document.getElementById('copyAllBtn');

        this.setupEventListeners();
        this.generatePalette('monochromatic');
    }

    setupEventListeners() {
        this.baseColorInput.addEventListener('input', (e) => {
            this.baseColor = e.target.value;
            this.generatePalette(this.currentScheme);
        });

        this.randomBtn.addEventListener('click', () => {
            this.baseColor = this.randomColor();
            this.baseColorInput.value = this.baseColor;
            this.generatePalette(this.currentScheme);
        });

        this.schemeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentScheme = e.target.dataset.scheme;
                this.generatePalette(this.currentScheme);
            });
        });

        this.exportBtn.addEventListener('click', () => this.exportPalette());
        this.copyAllBtn.addEventListener('click', () => this.copyAllHex());
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return this.rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    generatePalette(scheme) {
        let colors = [];
        const hsl = this.hexToHsl(this.baseColor);

        switch(scheme) {
            case 'monochromatic':
                colors = this.generateMonochromatic(hsl);
                break;
            case 'analogous':
                colors = this.generateAnalogous(hsl);
                break;
            case 'complementary':
                colors = this.generateComplementary(hsl);
                break;
            case 'triadic':
                colors = this.generateTriadic(hsl);
                break;
            case 'tetradic':
                colors = this.generateTetradic(hsl);
                break;
        }

        this.renderPalette(colors);
    }

    generateMonochromatic(hsl) {
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const l = 20 + (i * 15);
            colors.push(this.hslToHex(hsl.h, hsl.s, l));
        }
        return colors;
    }

    generateAnalogous(hsl) {
        const colors = [];
        for (let i = -2; i <= 2; i++) {
            const h = (hsl.h + (i * 30) + 360) % 360;
            colors.push(this.hslToHex(h, hsl.s, hsl.l));
        }
        return colors;
    }

    generateComplementary(hsl) {
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l - 20),
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l - 20),
            this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l + 20)
        ];
    }

    generateTriadic(hsl) {
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
            this.hslToHex(hsl.h, hsl.s, hsl.l - 20),
            this.hslToHex(hsl.h, hsl.s, hsl.l + 20)
        ];
    }

    generateTetradic(hsl) {
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
            this.hslToHex(hsl.h, hsl.s * 0.5, hsl.l)
        ];
    }

    renderPalette(colors) {
        this.paletteGrid.innerHTML = '';
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <div class="color-preview" style="background-color: ${color};"></div>
                <div class="color-hex" onclick="navigator.clipboard.writeText('${color}').then(() => alert('Copied: ${color}'))">${color.toUpperCase()}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-dim);">Click to copy</div>
            `;
            this.paletteGrid.appendChild(swatch);
        });
    }

    exportPalette() {
        const colors = Array.from(this.paletteGrid.querySelectorAll('.color-hex')).map(el => el.textContent);
        const cssVars = colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');
        const css = `:root {\n${cssVars}\n}`;
        
        const blob = new Blob([css], { type: 'text/css' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'palette.css';
        link.click();
    }

    copyAllHex() {
        const colors = Array.from(this.paletteGrid.querySelectorAll('.color-hex')).map(el => el.textContent);
        navigator.clipboard.writeText(colors.join(', ')).then(() => {
            alert('All colors copied to clipboard!');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteGenerator();
});

console.log('COLOR PALETTE GENERATOR v1.0');
console.log('Generate harmonious color schemes');
