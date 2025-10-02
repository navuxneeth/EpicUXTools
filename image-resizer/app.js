class ImageResizer {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.actionButtons = document.getElementById('actionButtons');
        this.statusMessage = document.getElementById('statusMessage');
        this.resizeBtn = document.getElementById('resizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.resizeModes = document.getElementsByName('resizeMode');
        this.presetOptions = document.getElementById('presetOptions');
        this.customOptions = document.getElementById('customOptions');
        this.percentageOptions = document.getElementById('percentageOptions');
        
        this.presetSize = document.getElementById('presetSize');
        this.customWidth = document.getElementById('customWidth');
        this.customHeight = document.getElementById('customHeight');
        this.maintainAspect = document.getElementById('maintainAspect');
        this.percentage = document.getElementById('percentage');
        this.percentageValue = document.getElementById('percentageValue');
        this.outputFormat = document.getElementById('outputFormat');
        
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
        this.resizeBtn.addEventListener('click', () => this.resizeImages());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Resize mode change
        this.resizeModes.forEach(radio => {
            radio.addEventListener('change', () => this.updateResizeOptions());
        });
        
        // Percentage slider
        this.percentage.addEventListener('input', (e) => {
            this.percentageValue.textContent = e.target.value + '%';
        });
        
        // Custom width/height with aspect ratio
        let lastModified = null;
        this.customWidth.addEventListener('input', () => {
            if (this.maintainAspect.checked && this.images.length > 0 && lastModified !== 'height') {
                lastModified = 'width';
                this.updateHeightFromWidth();
            }
        });
        
        this.customHeight.addEventListener('input', () => {
            if (this.maintainAspect.checked && this.images.length > 0 && lastModified !== 'width') {
                lastModified = 'height';
                this.updateWidthFromHeight();
            }
        });
    }

    updateResizeOptions() {
        const mode = Array.from(this.resizeModes).find(r => r.checked).value;
        
        this.presetOptions.style.display = mode === 'preset' ? 'block' : 'none';
        this.customOptions.style.display = mode === 'custom' ? 'block' : 'none';
        this.percentageOptions.style.display = mode === 'percentage' ? 'block' : 'none';
    }

    updateHeightFromWidth() {
        if (this.images.length === 0) return;
        const firstImage = this.images[0];
        const aspectRatio = firstImage.width / firstImage.height;
        const newWidth = parseInt(this.customWidth.value);
        if (!isNaN(newWidth)) {
            this.customHeight.value = Math.round(newWidth / aspectRatio);
        }
    }

    updateWidthFromHeight() {
        if (this.images.length === 0) return;
        const firstImage = this.images[0];
        const aspectRatio = firstImage.width / firstImage.height;
        const newHeight = parseInt(this.customHeight.value);
        if (!isNaN(newHeight)) {
            this.customWidth.value = Math.round(newHeight * aspectRatio);
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

        this.images = []; // Reset for new batch
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.images.push({
                        file: file,
                        dataURL: e.target.result,
                        name: file.name,
                        width: img.width,
                        height: img.height,
                        format: file.type
                    });
                    this.renderPreview();
                };
                img.src = e.target.result;
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
                <div class="preview-item-name">${index + 1}. ${image.name}<br>${image.width}×${image.height}</div>
                <button class="preview-remove" onclick="resizer.removeImage(${index})">✕</button>
            `;
            this.previewContainer.appendChild(item);
        });

        this.showStatus(`${this.images.length} image(s) ready to resize`, 'success');
    }

    removeImage(index) {
        this.images.splice(index, 1);
        if (this.images.length === 0) {
            this.clearAll();
        } else {
            this.renderPreview();
        }
    }

    async resizeImages() {
        if (this.images.length === 0) {
            this.showStatus('Please add images first!', 'error');
            return;
        }

        const mode = Array.from(this.resizeModes).find(r => r.checked).value;
        
        let targetWidth, targetHeight;
        
        if (mode === 'preset') {
            const [w, h] = this.presetSize.value.split('x').map(Number);
            targetWidth = w;
            targetHeight = h;
        } else if (mode === 'custom') {
            targetWidth = parseInt(this.customWidth.value);
            targetHeight = parseInt(this.customHeight.value);
            if (isNaN(targetWidth) || isNaN(targetHeight)) {
                this.showStatus('Please enter valid dimensions!', 'error');
                return;
            }
        }

        this.showStatus('Resizing images...', 'info');
        this.resizeBtn.disabled = true;

        try {
            const resizedImages = [];

            for (const image of this.images) {
                let finalWidth, finalHeight;
                
                if (mode === 'percentage') {
                    const scale = parseInt(this.percentage.value) / 100;
                    finalWidth = Math.round(image.width * scale);
                    finalHeight = Math.round(image.height * scale);
                } else if (mode === 'preset' || mode === 'custom') {
                    if (this.maintainAspect.checked && mode === 'custom') {
                        const aspectRatio = image.width / image.height;
                        const targetAspect = targetWidth / targetHeight;
                        
                        if (aspectRatio > targetAspect) {
                            finalWidth = targetWidth;
                            finalHeight = Math.round(targetWidth / aspectRatio);
                        } else {
                            finalHeight = targetHeight;
                            finalWidth = Math.round(targetHeight * aspectRatio);
                        }
                    } else {
                        finalWidth = targetWidth;
                        finalHeight = targetHeight;
                    }
                }

                const resized = await this.resizeImage(image.dataURL, finalWidth, finalHeight);
                
                // Determine output format
                let format = this.outputFormat.value === 'original' ? 
                    image.format : 
                    'image/' + this.outputFormat.value;
                
                const finalDataURL = await this.convertFormat(resized, format);
                
                resizedImages.push({
                    name: this.getNewFileName(image.name, format),
                    dataURL: finalDataURL
                });
            }

            // If single image, download directly
            if (resizedImages.length === 1) {
                const link = document.createElement('a');
                link.href = resizedImages[0].dataURL;
                link.download = resizedImages[0].name;
                link.click();
                this.showStatus('Image resized and downloaded!', 'success');
            } else {
                // Multiple images, create ZIP
                await this.downloadAsZip(resizedImages);
                this.showStatus('Images resized and downloaded as ZIP!', 'success');
            }
        } catch (error) {
            console.error(error);
            this.showStatus('Error resizing images: ' + error.message, 'error');
        } finally {
            this.resizeBtn.disabled = false;
        }
    }

    resizeImage(dataURL, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    convertFormat(dataURL, format) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // For JPEG, fill white background
                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                
                resolve(canvas.toDataURL(format, 0.9));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    getNewFileName(oldName, format) {
        const nameWithoutExt = oldName.replace(/\.[^/.]+$/, '');
        const ext = format.split('/')[1];
        return `resized_${nameWithoutExt}.${ext}`;
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
        link.download = 'resized_images.zip';
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
let resizer;
document.addEventListener('DOMContentLoaded', () => {
    resizer = new ImageResizer();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   IMAGE RESIZER v1.0                 ║');
console.log('║   Resize images to any dimension     ║');
console.log('╚═══════════════════════════════════════╝');
