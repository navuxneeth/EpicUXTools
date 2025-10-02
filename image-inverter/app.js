class ImageInverter {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewSection = document.getElementById('previewSection');
        this.statusMessage = document.getElementById('statusMessage');
        this.originalImage = document.getElementById('originalImage');
        this.invertedImage = document.getElementById('invertedImage');
        this.currentImageInfo = document.getElementById('currentImageInfo');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.downloadCurrentBtn = document.getElementById('downloadCurrentBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.images = [];
        this.currentIndex = 0;
        
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
        this.prevBtn.addEventListener('click', () => this.navigateImages(-1));
        this.nextBtn.addEventListener('click', () => this.navigateImages(1));
        this.downloadCurrentBtn.addEventListener('click', () => this.downloadCurrent());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    async handleFiles(files) {
        const validFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );

        if (validFiles.length === 0) {
            this.showStatus('Please select valid image files!', 'error');
            return;
        }

        this.showStatus(`Processing ${validFiles.length} image(s)...`, 'info');

        for (const file of validFiles) {
            try {
                const originalDataURL = await this.readFileAsDataURL(file);
                const invertedDataURL = await this.invertImage(originalDataURL);
                
                this.images.push({
                    name: file.name,
                    original: originalDataURL,
                    inverted: invertedDataURL
                });
            } catch (error) {
                console.error('Error processing', file.name, error);
            }
        }

        if (this.images.length > 0) {
            this.currentIndex = 0;
            this.showPreview();
            this.showStatus(`${this.images.length} image(s) processed successfully!`, 'success');
        }
    }

    async invertImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw original image
                ctx.drawImage(img, 0, 0);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Invert colors
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];         // Red
                    data[i + 1] = 255 - data[i + 1]; // Green
                    data[i + 2] = 255 - data[i + 2]; // Blue
                    // Alpha channel (data[i + 3]) remains unchanged
                }
                
                // Put inverted data back
                ctx.putImageData(imageData, 0, 0);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showPreview() {
        this.previewSection.classList.remove('hidden');
        this.displayCurrentImage();
    }

    displayCurrentImage() {
        const current = this.images[this.currentIndex];
        this.originalImage.src = current.original;
        this.invertedImage.src = current.inverted;
        this.currentImageInfo.textContent = `Image ${this.currentIndex + 1} of ${this.images.length}: ${current.name}`;
        
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.images.length - 1;
    }

    navigateImages(direction) {
        this.currentIndex += direction;
        if (this.currentIndex < 0) this.currentIndex = 0;
        if (this.currentIndex >= this.images.length) this.currentIndex = this.images.length - 1;
        this.displayCurrentImage();
    }

    downloadCurrent() {
        const current = this.images[this.currentIndex];
        const link = document.createElement('a');
        link.href = current.inverted;
        link.download = 'inverted_' + current.name.replace(/\.[^/.]+$/, '.png');
        link.click();
        this.showStatus('Image downloaded!', 'success');
    }

    async downloadAll() {
        if (this.images.length === 0) return;

        this.showStatus('Creating ZIP file...', 'info');

        try {
            const zip = new JSZip();
            
            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                const fileName = 'inverted_' + image.name.replace(/\.[^/.]+$/, '.png');
                
                // Convert data URL to blob
                const blob = await this.dataURLToBlob(image.inverted);
                zip.file(fileName, blob);
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'inverted_images.zip';
            link.click();
            
            this.showStatus('ZIP file downloaded!', 'success');
        } catch (error) {
            console.error(error);
            this.showStatus('Error creating ZIP file', 'error');
        }
    }

    dataURLToBlob(dataURL) {
        return fetch(dataURL).then(r => r.blob());
    }

    clearAll() {
        this.images = [];
        this.currentIndex = 0;
        this.previewSection.classList.add('hidden');
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
document.addEventListener('DOMContentLoaded', () => {
    new ImageInverter();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   IMAGE COLOR INVERTER v1.0          ║');
console.log('║   Invert colors instantly            ║');
console.log('╚═══════════════════════════════════════╝');
