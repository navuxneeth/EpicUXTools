class FormatConverter {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.actionButtons = document.getElementById('actionButtons');
        this.statusMessage = document.getElementById('statusMessage');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.outputFormat = document.getElementById('outputFormat');
        this.quality = document.getElementById('quality');
        this.qualityValue = document.getElementById('qualityValue');
        this.qualityOption = document.getElementById('qualityOption');
        
        this.images = [];
        
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
            this.handleFiles(e.target.files);
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
            this.handleFiles(e.dataTransfer.files);
        });

        // Buttons
        this.convertBtn.addEventListener('click', () => this.convertImages());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Output format change
        this.outputFormat.addEventListener('change', () => {
            this.updateQualityVisibility();
        });
        
        // Quality slider
        this.quality.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value + '%';
        });
        
        this.updateQualityVisibility();
    }

    updateQualityVisibility() {
        const format = this.outputFormat.value;
        if (format === 'jpeg' || format === 'webp') {
            this.qualityOption.style.display = 'block';
        } else {
            this.qualityOption.style.display = 'none';
        }
    }

    handleFiles(files) {
        const validFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );

        if (validFiles.length === 0) {
            this.showStatus('Please select valid image files!', 'error');
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.images.push({
                    file: file,
                    dataURL: e.target.result,
                    name: file.name
                });
                this.renderPreview();
            };
            reader.readAsDataURL(file);
        });

        this.showStatus(`Loading ${validFiles.length} image(s)...`, 'info');
    }

    renderPreview() {
        this.previewContainer.innerHTML = '';
        this.previewContainer.classList.remove('hidden');
        this.actionButtons.classList.remove('hidden');

        this.images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'preview-item';
            item.innerHTML = `
                <img src="${image.dataURL}" alt="${image.name}">
                <div class="preview-item-name">${index + 1}. ${image.name}</div>
                <button class="preview-remove" onclick="converter.removeImage(${index})">✕</button>
            `;
            this.previewContainer.appendChild(item);
        });

        this.showStatus(`${this.images.length} image(s) ready to convert`, 'success');
    }

    removeImage(index) {
        this.images.splice(index, 1);
        if (this.images.length === 0) {
            this.clearAll();
        } else {
            this.renderPreview();
        }
    }

    async convertImages() {
        if (this.images.length === 0) {
            this.showStatus('Please add images first!', 'error');
            return;
        }

        this.showStatus('Converting images...', 'info');
        this.convertBtn.disabled = true;

        try {
            const format = this.outputFormat.value;
            const quality = parseInt(this.quality.value) / 100;
            const convertedImages = [];

            for (const image of this.images) {
                const converted = await this.convertImage(image.dataURL, format, quality);
                convertedImages.push({
                    name: this.getNewFileName(image.name, format),
                    dataURL: converted
                });
            }

            // If single image, download directly
            if (convertedImages.length === 1) {
                const link = document.createElement('a');
                link.href = convertedImages[0].dataURL;
                link.download = convertedImages[0].name;
                link.click();
                this.showStatus('Image converted and downloaded!', 'success');
            } else {
                // Multiple images, create ZIP
                await this.downloadAsZip(convertedImages);
                this.showStatus('Images converted and downloaded as ZIP!', 'success');
            }
        } catch (error) {
            console.error(error);
            this.showStatus('Error converting images: ' + error.message, 'error');
        } finally {
            this.convertBtn.disabled = false;
        }
    }

    convertImage(dataURL, format, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // For JPEG, fill white background
                if (format === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                
                const mimeType = format === 'png' ? 'image/png' : 
                                format === 'jpeg' ? 'image/jpeg' : 'image/webp';
                
                resolve(canvas.toDataURL(mimeType, quality));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    getNewFileName(oldName, format) {
        const nameWithoutExt = oldName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}.${format}`;
    }

    async downloadAsZip(images) {
        const zip = new JSZip();
        
        for (const image of images) {
            const blob = await fetch(image.dataURL).then(r => r.blob());
            zip.file(image.name, blob);
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'converted_images.zip';
        link.click();
    }

    clearAll() {
        this.images = [];
        this.previewContainer.innerHTML = '';
        this.previewContainer.classList.add('hidden');
        this.actionButtons.classList.add('hidden');
        this.fileInput.value = '';
        this.statusMessage.innerHTML = '';
    }

    showStatus(message, type) {
        this.statusMessage.innerHTML = `
            <div class="status-message status-${type}">
                ${message}
            </div>
        `;
    }
}

// Initialize
let converter;
document.addEventListener('DOMContentLoaded', () => {
    converter = new FormatConverter();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   FORMAT CONVERTER v1.0              ║');
console.log('║   Convert image formats              ║');
console.log('╚═══════════════════════════════════════╝');
