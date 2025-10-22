class FontWeightGenerator {
    constructor() {
        // DOM elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.statusMessage = document.getElementById('statusMessage');
        this.fontInfo = document.getElementById('fontInfo');
        this.fontName = document.getElementById('fontName');
        this.fontFamily = document.getElementById('fontFamily');
        this.originalWeight = document.getElementById('originalWeight');
        
        // Panels
        this.previewPanel = document.getElementById('previewPanel');
        this.controlsPanel = document.getElementById('controlsPanel');
        this.downloadPanel = document.getElementById('downloadPanel');
        
        // Preview elements
        this.previewText = document.getElementById('previewText');
        this.previewAlphabet = document.getElementById('previewAlphabet');
        
        // Controls
        this.strokeSlider = document.getElementById('strokeSlider');
        this.strokeInput = document.getElementById('strokeInput');
        this.sliderValue = document.getElementById('sliderValue');
        this.applyStroke = document.getElementById('applyStroke');
        this.resetStroke = document.getElementById('resetStroke');
        
        // Size controls
        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeValue = document.getElementById('sizeValue');
        
        // Download controls
        this.outputFormat = document.getElementById('outputFormat');
        this.customFontName = document.getElementById('customFontName');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Font data
        this.originalFont = null;
        this.modifiedFont = null;
        this.currentStrokeWidth = 0;
        this.fontFileName = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFontUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFontUpload(e.dataTransfer.files[0]);
            }
        });

        // Stroke controls
        this.strokeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.sliderValue.textContent = value;
            this.strokeInput.value = value;
            this.updateFontStroke(value);
        });

        this.strokeInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            value = Math.max(-100, Math.min(100, value));
            this.strokeSlider.value = value;
            this.sliderValue.textContent = value;
        });

        this.applyStroke.addEventListener('click', () => {
            const value = parseInt(this.strokeInput.value) || 0;
            this.updateFontStroke(value);
        });

        this.resetStroke.addEventListener('click', () => {
            this.strokeSlider.value = 0;
            this.strokeInput.value = 0;
            this.sliderValue.textContent = 0;
            this.updateFontStroke(0);
        });

        // Size controls
        this.sizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            this.sizeValue.textContent = size + 'px';
            this.previewText.style.fontSize = size + 'px';
            this.previewAlphabet.style.fontSize = (size / 2) + 'px';
        });

        // Download button
        this.downloadBtn.addEventListener('click', () => {
            this.downloadModifiedFont();
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });
    }

    handleFontUpload(file) {
        this.fontFileName = file.name;
        const reader = new FileReader();

        this.showStatus('Loading font...', 'info');

        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                this.originalFont = opentype.parse(arrayBuffer);
                this.displayFontInfo();
                this.loadFontIntoPreview();
                this.showStatus('Font loaded successfully!', 'success');
                this.showPanels();
            } catch (error) {
                this.showStatus('Error loading font: ' + error.message, 'error');
                console.error(error);
            }
        };

        reader.readAsArrayBuffer(file);
    }

    displayFontInfo() {
        const names = this.originalFont.names;
        this.fontName.textContent = names.fullName?.en || names.postScriptName?.en || 'Unknown';
        this.fontFamily.textContent = names.fontFamily?.en || 'Unknown';
        
        // Try to detect weight from font name
        const fullName = (names.fullName?.en || '').toLowerCase();
        if (fullName.includes('bold')) {
            this.originalWeight.textContent = 'Bold';
        } else if (fullName.includes('light')) {
            this.originalWeight.textContent = 'Light';
        } else if (fullName.includes('medium')) {
            this.originalWeight.textContent = 'Medium';
        } else {
            this.originalWeight.textContent = 'Regular';
        }
        
        this.fontInfo.classList.remove('hidden');
        
        // Set custom font name
        const baseName = this.fontFileName.replace(/\.[^/.]+$/, '');
        this.customFontName.value = baseName + '-Modified';
    }

    loadFontIntoPreview() {
        // Create a style element with @font-face
        const fontFace = new FontFace('CustomPreviewFont', this.getFontArrayBuffer());
        
        fontFace.load().then((loadedFace) => {
            document.fonts.add(loadedFace);
            this.previewText.style.fontFamily = 'CustomPreviewFont, VT323, monospace';
            this.previewAlphabet.style.fontFamily = 'CustomPreviewFont, VT323, monospace';
        }).catch((error) => {
            console.error('Error loading font into preview:', error);
        });
    }

    getFontArrayBuffer() {
        const buffer = this.originalFont.toArrayBuffer();
        return buffer;
    }

    updateFontStroke(strokeValue) {
        this.currentStrokeWidth = strokeValue;
        
        // Create a modified version of the font
        try {
            this.modifiedFont = this.createModifiedFont(strokeValue);
            this.updatePreview();
        } catch (error) {
            console.error('Error updating font stroke:', error);
            this.showStatus('Error modifying font: ' + error.message, 'error');
        }
    }

    createModifiedFont(strokeValue) {
        // Clone the font
        const font = new opentype.Font({
            familyName: this.originalFont.names.fontFamily?.en || 'CustomFont',
            styleName: this.getStyleName(strokeValue),
            unitsPerEm: this.originalFont.unitsPerEm,
            ascender: this.originalFont.ascender,
            descender: this.originalFont.descender,
            glyphs: []
        });

        // Copy all glyphs with modified stroke
        const strokeMultiplier = 1 + (strokeValue / 100);
        
        this.originalFont.glyphs.forEach((glyph, index) => {
            if (glyph.path) {
                const modifiedGlyph = this.modifyGlyphStroke(glyph, strokeValue);
                font.glyphs.push(modifiedGlyph);
            } else {
                // For glyphs without paths (like space), keep them as is
                font.glyphs.push(glyph);
            }
        });

        return font;
    }

    modifyGlyphStroke(glyph, strokeValue) {
        // Create a new glyph with modified path
        const strokeAmount = strokeValue * 2; // Scaling factor for effect
        
        const newGlyph = new opentype.Glyph({
            name: glyph.name,
            unicode: glyph.unicode,
            unicodes: glyph.unicodes,
            advanceWidth: glyph.advanceWidth,
            path: this.modifyPath(glyph.path, strokeAmount)
        });
        
        return newGlyph;
    }

    modifyPath(path, strokeAmount) {
        // Clone the path
        const newPath = new opentype.Path();
        
        // Apply stroke modification by offsetting commands
        for (let i = 0; i < path.commands.length; i++) {
            const cmd = path.commands[i];
            const newCmd = { ...cmd };
            
            // Apply offset to coordinates for stroke effect
            // This is a simplified approach - more sophisticated methods exist
            if (strokeAmount !== 0) {
                const offset = strokeAmount / 10; // Reduce the offset for subtlety
                
                if (cmd.x !== undefined) newCmd.x = cmd.x + offset;
                if (cmd.y !== undefined) newCmd.y = cmd.y + offset;
                if (cmd.x1 !== undefined) newCmd.x1 = cmd.x1 + offset;
                if (cmd.y1 !== undefined) newCmd.y1 = cmd.y1 + offset;
                if (cmd.x2 !== undefined) newCmd.x2 = cmd.x2 + offset;
                if (cmd.y2 !== undefined) newCmd.y2 = cmd.y2 + offset;
            }
            
            newPath.commands.push(newCmd);
        }
        
        return newPath;
    }

    getStyleName(strokeValue) {
        if (strokeValue > 50) return 'ExtraBold';
        if (strokeValue > 30) return 'Bold';
        if (strokeValue > 10) return 'SemiBold';
        if (strokeValue > -10) return 'Regular';
        if (strokeValue > -30) return 'Light';
        if (strokeValue > -50) return 'ExtraLight';
        return 'Thin';
    }

    updatePreview() {
        if (!this.modifiedFont) return;
        
        // Create font data URL for preview
        const fontBuffer = this.modifiedFont.toArrayBuffer();
        const blob = new Blob([fontBuffer], { type: 'font/ttf' });
        const url = URL.createObjectURL(blob);
        
        // Remove old font face
        const oldStyle = document.getElementById('dynamicFontStyle');
        if (oldStyle) oldStyle.remove();
        
        // Add new font face
        const style = document.createElement('style');
        style.id = 'dynamicFontStyle';
        style.textContent = `
            @font-face {
                font-family: 'ModifiedPreviewFont';
                src: url('${url}');
            }
        `;
        document.head.appendChild(style);
        
        // Update preview elements
        setTimeout(() => {
            this.previewText.style.fontFamily = 'ModifiedPreviewFont, VT323, monospace';
            this.previewAlphabet.style.fontFamily = 'ModifiedPreviewFont, VT323, monospace';
        }, 100);
    }

    downloadModifiedFont() {
        if (!this.modifiedFont) {
            this.showStatus('Please modify the font first!', 'error');
            return;
        }

        const format = this.outputFormat.value;
        let fileName = this.customFontName.value.trim() || 'modified-font';
        
        // Clean filename
        fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
        
        try {
            let blob;
            if (format === 'ttf' || format === 'otf') {
                const buffer = this.modifiedFont.toArrayBuffer();
                blob = new Blob([buffer], { type: 'font/ttf' });
            } else if (format === 'woff') {
                // For WOFF, we'll use TTF format (browser limitation)
                const buffer = this.modifiedFont.toArrayBuffer();
                blob = new Blob([buffer], { type: 'font/woff' });
            }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus(`Font downloaded as ${fileName}.${format}`, 'success');
        } catch (error) {
            this.showStatus('Error downloading font: ' + error.message, 'error');
            console.error(error);
        }
    }

    showPanels() {
        this.previewPanel.classList.remove('hidden');
        this.controlsPanel.classList.remove('hidden');
        this.downloadPanel.classList.remove('hidden');
    }

    clearAll() {
        this.originalFont = null;
        this.modifiedFont = null;
        this.currentStrokeWidth = 0;
        this.fontFileName = '';
        
        this.fileInput.value = '';
        this.strokeSlider.value = 0;
        this.strokeInput.value = 0;
        this.sliderValue.textContent = 0;
        this.sizeSlider.value = 48;
        this.sizeValue.textContent = '48px';
        
        this.previewText.style.fontFamily = 'VT323, monospace';
        this.previewAlphabet.style.fontFamily = 'VT323, monospace';
        this.previewText.style.fontSize = '48px';
        this.previewAlphabet.style.fontSize = '24px';
        
        this.fontInfo.classList.add('hidden');
        this.previewPanel.classList.add('hidden');
        this.controlsPanel.classList.add('hidden');
        this.downloadPanel.classList.add('hidden');
        
        this.statusMessage.innerHTML = '';
        
        // Remove dynamic font style
        const oldStyle = document.getElementById('dynamicFontStyle');
        if (oldStyle) oldStyle.remove();
    }

    showStatus(message, type) {
        this.statusMessage.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
        
        if (type === 'success') {
            setTimeout(() => {
                this.statusMessage.innerHTML = '';
            }, 3000);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FontWeightGenerator();
});
