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
        
        // Letter spacing controls
        this.letterSpacingSlider = document.getElementById('letterSpacingSlider');
        this.letterSpacingValue = document.getElementById('letterSpacingValue');
        
        // Line height controls
        this.lineHeightSlider = document.getElementById('lineHeightSlider');
        this.lineHeightValue = document.getElementById('lineHeightValue');
        
        // Download controls
        this.outputFormat = document.getElementById('outputFormat');
        this.customFontName = document.getElementById('customFontName');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Font data
        this.fontFile = null;
        this.fontData = null;
        this.parsedFont = null;
        this.currentStrokeWidth = 0;
        this.fontFileName = '';
        this.customFontFamily = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createSVGFilters();
    }

    createSVGFilters() {
        // Create SVG filters for stroke effects
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.innerHTML = `
            <defs>
                <filter id="strokeBold" x="-50%" y="-50%" width="200%" height="200%">
                    <feMorphology operator="dilate" radius="0.5"/>
                </filter>
                <filter id="strokeBolder" x="-50%" y="-50%" width="200%" height="200%">
                    <feMorphology operator="dilate" radius="1"/>
                </filter>
                <filter id="strokeLight" x="-50%" y="-50%" width="200%" height="200%">
                    <feMorphology operator="erode" radius="0.3"/>
                </filter>
            </defs>
        `;
        document.body.appendChild(svg);
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

        // Letter spacing controls
        this.letterSpacingSlider.addEventListener('input', (e) => {
            const spacing = e.target.value;
            this.letterSpacingValue.textContent = spacing + 'px';
            this.previewText.style.letterSpacing = spacing + 'px';
            this.previewAlphabet.style.letterSpacing = spacing + 'px';
        });

        // Line height controls
        this.lineHeightSlider.addEventListener('input', (e) => {
            const lineHeight = e.target.value;
            this.lineHeightValue.textContent = lineHeight;
            this.previewText.style.lineHeight = lineHeight;
            this.previewAlphabet.style.lineHeight = lineHeight;
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
        const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!isValid) {
            this.showStatus('Please upload a valid font file (.ttf, .otf, .woff, .woff2)', 'error');
            return;
        }

        this.fontFile = file;
        this.fontFileName = file.name;
        const reader = new FileReader();

        this.showStatus('Loading font...', 'info');

        reader.onload = (e) => {
            try {
                this.fontData = e.target.result;
                // Parse font with opentype.js
                const arrayBuffer = e.target.result;
                if (typeof opentype !== 'undefined') {
                    try {
                        // Try synchronous parsing first (newer API)
                        const font = opentype.parse(arrayBuffer);
                        this.parsedFont = font;
                        this.loadFont();
                    } catch (parseError) {
                        // If synchronous fails, try callback-based approach
                        opentype.parse(arrayBuffer, (err, font) => {
                            if (err) {
                                console.error('Error parsing font:', err);
                                this.showStatus('Error parsing font: ' + err.message, 'error');
                                return;
                            }
                            this.parsedFont = font;
                            this.loadFont();
                        });
                    }
                } else {
                    this.showStatus('Font library not loaded yet, please try again.', 'error');
                }
            } catch (error) {
                this.showStatus('Error loading font: ' + error.message, 'error');
                console.error(error);
            }
        };

        reader.readAsArrayBuffer(file);
    }

    loadFont() {
        // Create a unique font family name
        const timestamp = Date.now();
        this.customFontFamily = `CustomFont${timestamp}`;
        
        // Convert ArrayBuffer to base64 for @font-face
        const uint8Array = new Uint8Array(this.fontData);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        const fontDataUrl = `data:font/ttf;base64,${base64}`;
        
        // Create @font-face rule
        const fontFace = `
            @font-face {
                font-family: '${this.customFontFamily}';
                src: url('${fontDataUrl}');
            }
        `;
        
        // Add style element
        const style = document.createElement('style');
        style.id = 'uploadedFontStyle';
        style.textContent = fontFace;
        document.head.appendChild(style);
        
        // Wait for font to load
        if (document.fonts && document.fonts.load) {
            document.fonts.load(`48px ${this.customFontFamily}`).then(() => {
                this.displayFontInfo();
                this.applyFontToPreview();
                this.showStatus('Font loaded successfully!', 'success');
                this.showPanels();
            }).catch((error) => {
                console.warn('Font loading warning:', error);
                // Still try to display even if load detection fails
                this.displayFontInfo();
                this.applyFontToPreview();
                this.showStatus('Font loaded successfully!', 'success');
                this.showPanels();
            });
        } else {
            // Fallback for older browsers
            setTimeout(() => {
                this.displayFontInfo();
                this.applyFontToPreview();
                this.showStatus('Font loaded successfully!', 'success');
                this.showPanels();
            }, 500);
        }
    }

    displayFontInfo() {
        // Extract font name from parsed font or filename
        let baseName = this.fontFileName.replace(/\.[^/.]+$/, '');
        
        if (this.parsedFont && this.parsedFont.names) {
            // Try to get font name from parsed font
            const fontNameObj = this.parsedFont.names.fontFamily;
            if (fontNameObj && fontNameObj.en) {
                baseName = fontNameObj.en;
            }
        }
        
        this.fontName.textContent = baseName;
        this.fontFamily.textContent = this.customFontFamily;
        
        // Try to detect weight from font name
        const nameLower = baseName.toLowerCase();
        if (nameLower.includes('bold')) {
            this.originalWeight.textContent = 'Bold';
        } else if (nameLower.includes('light')) {
            this.originalWeight.textContent = 'Light';
        } else if (nameLower.includes('medium')) {
            this.originalWeight.textContent = 'Medium';
        } else if (nameLower.includes('thin')) {
            this.originalWeight.textContent = 'Thin';
        } else if (nameLower.includes('black')) {
            this.originalWeight.textContent = 'Black';
        } else {
            this.originalWeight.textContent = 'Regular';
        }
        
        this.fontInfo.classList.remove('hidden');
        
        // Set custom font name for download
        this.customFontName.value = baseName + '-Modified';
    }

    applyFontToPreview() {
        this.previewText.style.fontFamily = `'${this.customFontFamily}', VT323, monospace`;
        this.previewAlphabet.style.fontFamily = `'${this.customFontFamily}', VT323, monospace`;
        
        // Reset stroke
        this.previewText.style.webkitTextStroke = '';
        this.previewAlphabet.style.webkitTextStroke = '';
        this.previewText.style.textShadow = '';
        this.previewAlphabet.style.textShadow = '';
        this.previewText.style.fontWeight = 'normal';
        this.previewAlphabet.style.fontWeight = 'normal';
    }

    updateFontStroke(strokeValue) {
        this.currentStrokeWidth = strokeValue;
        
        // Apply visual stroke effects using CSS
        const absStroke = Math.abs(strokeValue);
        const strokePx = absStroke / 20; // Convert to pixel value
        
        if (strokeValue > 0) {
            // Bold effect - use text-stroke and text-shadow for thickness
            const strokeWidth = strokePx + 'px';
            const color = getComputedStyle(this.previewText).color;
            
            // Create multiple text shadows for bold effect
            let shadows = [];
            for (let i = 1; i <= Math.ceil(strokePx); i++) {
                shadows.push(`${i}px 0 0 ${color}`);
                shadows.push(`-${i}px 0 0 ${color}`);
                shadows.push(`0 ${i}px 0 ${color}`);
                shadows.push(`0 -${i}px 0 ${color}`);
            }
            
            this.previewText.style.textShadow = shadows.join(', ');
            this.previewAlphabet.style.textShadow = shadows.join(', ');
            this.previewText.style.webkitTextStroke = '';
            this.previewAlphabet.style.webkitTextStroke = '';
            
            // Also increase font weight
            const weightValue = Math.min(900, 400 + strokeValue * 5);
            this.previewText.style.fontWeight = weightValue;
            this.previewAlphabet.style.fontWeight = weightValue;
            
        } else if (strokeValue < 0) {
            // Light effect - use lighter font weight
            const weightValue = Math.max(100, 400 + strokeValue * 3);
            this.previewText.style.fontWeight = weightValue;
            this.previewAlphabet.style.fontWeight = weightValue;
            this.previewText.style.textShadow = '';
            this.previewAlphabet.style.textShadow = '';
            this.previewText.style.webkitTextStroke = '';
            this.previewAlphabet.style.webkitTextStroke = '';
            
        } else {
            // Reset to normal
            this.previewText.style.textShadow = '';
            this.previewAlphabet.style.textShadow = '';
            this.previewText.style.webkitTextStroke = '';
            this.previewAlphabet.style.webkitTextStroke = '';
            this.previewText.style.fontWeight = 'normal';
            this.previewAlphabet.style.fontWeight = 'normal';
        }
    }

    async downloadModifiedFont() {
        if (!this.fontFile || !this.parsedFont) {
            this.showStatus('Please upload a font first!', 'error');
            return;
        }

        const fileName = this.customFontName.value.trim() || 'modified-font';
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
        const format = this.outputFormat.value;
        
        try {
            this.showStatus('Processing font modifications...', 'info');
            
            // Create a modified copy of the font
            let modifiedFont = this.parsedFont;
            
            // Apply stroke width modifications to glyphs
            if (this.currentStrokeWidth !== 0) {
                const strokeWidth = this.currentStrokeWidth * 2;
                
                // Modify each glyph's outline
                // Note: glyphs is a GlyphSet object with .length and .get(index) method
                for (let i = 0; i < modifiedFont.glyphs.length; i++) {
                    const glyph = modifiedFont.glyphs.get(i);
                    if (glyph && glyph.path && glyph.path.commands) {
                        const path = glyph.path;
                        
                        // Apply stroke by modifying the glyph path commands
                        if (this.currentStrokeWidth > 0) {
                            // For bolder effect, expand the outline
                            const newCommands = path.commands.map(cmd => {
                                const newCmd = { ...cmd };
                                if (cmd.type !== 'Z') {
                                    // Apply stroke offset to coordinates
                                    const offset = strokeWidth * 0.01;
                                    if (cmd.x !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x - centerX;
                                        newCmd.x = cmd.x + (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y - centerY;
                                        newCmd.y = cmd.y + (dy > 0 ? offset : -offset);
                                    }
                                    if (cmd.x1 !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x1 - centerX;
                                        newCmd.x1 = cmd.x1 + (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y1 !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y1 - centerY;
                                        newCmd.y1 = cmd.y1 + (dy > 0 ? offset : -offset);
                                    }
                                    if (cmd.x2 !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x2 - centerX;
                                        newCmd.x2 = cmd.x2 + (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y2 !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y2 - centerY;
                                        newCmd.y2 = cmd.y2 + (dy > 0 ? offset : -offset);
                                    }
                                }
                                return newCmd;
                            });
                            
                            path.commands = newCommands;
                        } else if (this.currentStrokeWidth < 0) {
                            // For lighter effect, shrink the outline
                            const newCommands = path.commands.map(cmd => {
                                const newCmd = { ...cmd };
                                if (cmd.type !== 'Z') {
                                    const offset = Math.abs(strokeWidth) * 0.01;
                                    if (cmd.x !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x - centerX;
                                        newCmd.x = cmd.x - (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y - centerY;
                                        newCmd.y = cmd.y - (dy > 0 ? offset : -offset);
                                    }
                                    if (cmd.x1 !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x1 - centerX;
                                        newCmd.x1 = cmd.x1 - (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y1 !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y1 - centerY;
                                        newCmd.y1 = cmd.y1 - (dy > 0 ? offset : -offset);
                                    }
                                    if (cmd.x2 !== undefined) {
                                        const centerX = glyph.advanceWidth / 2 || 0;
                                        const dx = cmd.x2 - centerX;
                                        newCmd.x2 = cmd.x2 - (dx > 0 ? offset : -offset);
                                    }
                                    if (cmd.y2 !== undefined) {
                                        const centerY = ((glyph.yMax || 0) + (glyph.yMin || 0)) / 2;
                                        const dy = cmd.y2 - centerY;
                                        newCmd.y2 = cmd.y2 - (dy > 0 ? offset : -offset);
                                    }
                                }
                                return newCmd;
                            });
                            
                            path.commands = newCommands;
                        }
                    }
                }
            }
            
            // Update font name in metadata
            if (modifiedFont.names && modifiedFont.names.fontFamily) {
                modifiedFont.names.fontFamily.en = cleanFileName;
            }
            if (modifiedFont.names && modifiedFont.names.fullName) {
                modifiedFont.names.fullName.en = cleanFileName;
            }
            
            // Convert font to ArrayBuffer
            const arrayBuffer = modifiedFont.toArrayBuffer();
            
            // Create blob with appropriate MIME type
            let mimeType = 'font/ttf';
            if (format === 'otf') {
                mimeType = 'font/otf';
            } else if (format === 'woff') {
                mimeType = 'font/woff';
            } else if (format === 'woff2') {
                mimeType = 'font/woff2';
            }
            
            const blob = new Blob([arrayBuffer], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${cleanFileName}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus(`Font downloaded as ${cleanFileName}.${format} with applied modifications!`, 'success');
        } catch (error) {
            this.showStatus('Error downloading font: ' + error.message, 'error');
            console.error('Download error:', error);
        }
    }

    showPanels() {
        this.previewPanel.classList.remove('hidden');
        this.controlsPanel.classList.remove('hidden');
        this.downloadPanel.classList.remove('hidden');
    }

    clearAll() {
        this.fontFile = null;
        this.fontData = null;
        this.parsedFont = null;
        this.currentStrokeWidth = 0;
        this.fontFileName = '';
        this.customFontFamily = '';
        
        this.fileInput.value = '';
        this.strokeSlider.value = 0;
        this.strokeInput.value = 0;
        this.sliderValue.textContent = 0;
        this.sizeSlider.value = 48;
        this.sizeValue.textContent = '48px';
        this.letterSpacingSlider.value = 0;
        this.letterSpacingValue.textContent = '0px';
        this.lineHeightSlider.value = 1.4;
        this.lineHeightValue.textContent = '1.4';
        
        this.previewText.style.fontFamily = 'VT323, monospace';
        this.previewAlphabet.style.fontFamily = 'VT323, monospace';
        this.previewText.style.fontSize = '48px';
        this.previewAlphabet.style.fontSize = '24px';
        this.previewText.style.letterSpacing = '';
        this.previewAlphabet.style.letterSpacing = '';
        this.previewText.style.lineHeight = '';
        this.previewAlphabet.style.lineHeight = '';
        this.previewText.style.textShadow = '';
        this.previewAlphabet.style.textShadow = '';
        this.previewText.style.webkitTextStroke = '';
        this.previewAlphabet.style.webkitTextStroke = '';
        this.previewText.style.fontWeight = 'normal';
        this.previewAlphabet.style.fontWeight = 'normal';
        
        this.fontInfo.classList.add('hidden');
        this.previewPanel.classList.add('hidden');
        this.controlsPanel.classList.add('hidden');
        this.downloadPanel.classList.add('hidden');
        
        this.statusMessage.innerHTML = '';
        
        // Remove uploaded font style
        const oldStyle = document.getElementById('uploadedFontStyle');
        if (oldStyle) oldStyle.remove();
    }

    showStatus(message, type) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        this.statusMessage.appendChild(statusDiv);
        
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FontWeightGenerator();
});
