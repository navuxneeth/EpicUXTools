class TypographyTester {
    constructor() {
        this.fonts = [
            { name: 'Courier New', family: '"Courier New", Courier, monospace' },
            { name: 'Arial', family: 'Arial, sans-serif' },
            { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
            { name: 'Georgia', family: 'Georgia, serif' },
            { name: 'Roboto', family: '"Roboto", sans-serif' },
            { name: 'Open Sans', family: '"Open Sans", sans-serif' },
            { name: 'Lato', family: '"Lato", sans-serif' },
            { name: 'Montserrat', family: '"Montserrat", sans-serif' },
            { name: 'Playfair Display', family: '"Playfair Display", serif' }
        ];
        
        this.currentFont = this.fonts[4]; // Roboto default
        this.fontSize = 16;
        this.fontWeight = 400;
        this.lineHeight = 1.6;
        this.letterSpacing = 0;
        this.customText = 'The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
        
        this.init();
    }

    init() {
        this.fontSamplesContainer = document.getElementById('fontSamples');
        this.fontSizeInput = document.getElementById('fontSize');
        this.fontWeightSelect = document.getElementById('fontWeight');
        this.lineHeightInput = document.getElementById('lineHeight');
        this.letterSpacingInput = document.getElementById('letterSpacing');
        this.customTextInput = document.getElementById('customText');
        this.previewText = document.getElementById('previewText');
        this.copyBtn = document.getElementById('copyBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.renderFontSamples();
        this.setupEventListeners();
        this.updatePreview();
    }

    renderFontSamples() {
        this.fontSamplesContainer.innerHTML = '';
        this.fonts.forEach((font, index) => {
            const sample = document.createElement('div');
            sample.className = 'font-sample' + (font === this.currentFont ? ' active' : '');
            sample.style.fontFamily = font.family;
            sample.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; font-family: 'Courier New', monospace;">${font.name}</div>
                <div style="font-size: 1.2rem;">Aa Bb Cc</div>
                <div style="font-size: 0.9rem; margin-top: 4px;">The quick brown fox</div>
            `;
            sample.addEventListener('click', () => {
                this.currentFont = font;
                this.renderFontSamples();
                this.updatePreview();
            });
            this.fontSamplesContainer.appendChild(sample);
        });
    }

    setupEventListeners() {
        this.fontSizeInput.addEventListener('input', (e) => {
            this.fontSize = parseInt(e.target.value);
            this.updatePreview();
        });

        this.fontWeightSelect.addEventListener('change', (e) => {
            this.fontWeight = parseInt(e.target.value);
            this.updatePreview();
        });

        this.lineHeightInput.addEventListener('input', (e) => {
            this.lineHeight = parseFloat(e.target.value);
            this.updatePreview();
        });

        this.letterSpacingInput.addEventListener('input', (e) => {
            this.letterSpacing = parseFloat(e.target.value);
            this.updatePreview();
        });

        this.customTextInput.addEventListener('input', (e) => {
            this.customText = e.target.value || 'The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
            this.updatePreview();
        });

        this.copyBtn.addEventListener('click', () => this.copyCSS());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    updatePreview() {
        this.previewText.style.fontFamily = this.currentFont.family;
        this.previewText.style.fontSize = `${this.fontSize}px`;
        this.previewText.style.fontWeight = this.fontWeight;
        this.previewText.style.lineHeight = this.lineHeight;
        this.previewText.style.letterSpacing = `${this.letterSpacing}px`;
        this.previewText.textContent = this.customText;
    }

    copyCSS() {
        const css = `font-family: ${this.currentFont.family};
font-size: ${this.fontSize}px;
font-weight: ${this.fontWeight};
line-height: ${this.lineHeight};
letter-spacing: ${this.letterSpacing}px;`;

        navigator.clipboard.writeText(css).then(() => {
            alert('CSS copied to clipboard!');
        });
    }

    reset() {
        this.currentFont = this.fonts[4];
        this.fontSize = 16;
        this.fontWeight = 400;
        this.lineHeight = 1.6;
        this.letterSpacing = 0;
        this.customText = 'The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
        
        this.fontSizeInput.value = this.fontSize;
        this.fontWeightSelect.value = this.fontWeight;
        this.lineHeightInput.value = this.lineHeight;
        this.letterSpacingInput.value = this.letterSpacing;
        this.customTextInput.value = this.customText;
        
        this.renderFontSamples();
        this.updatePreview();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TypographyTester();
});

console.log('TYPOGRAPHY TESTER v1.0');
console.log('Test and preview font styles');
