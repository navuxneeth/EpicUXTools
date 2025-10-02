class BackgroundRemover {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewSection = document.getElementById('previewSection');
        this.statusMessage = document.getElementById('statusMessage');
        this.originalImage = document.getElementById('originalImage');
        this.processedImage = document.getElementById('processedImage');
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
            file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'
        );

        if (validFiles.length === 0) {
            this.showStatus('Please select valid image files (PNG, JPG)!', 'error');
            return;
        }

        this.showStatus(`Processing ${validFiles.length} image(s)... Please wait.`, 'info');

        for (const file of validFiles) {
            try {
                const originalDataURL = await this.readFileAsDataURL(file);
                
                this.showStatus(`Processing ${file.name}...`, 'info');
                
                // Remove background using the library
                const blob = await this.removeBackground(file);
                const processedDataURL = await this.blobToDataURL(blob);
                
                this.images.push({
                    name: file.name,
                    original: originalDataURL,
                    processed: processedDataURL,
                    blob: blob
                });
            } catch (error) {
                console.error('Error processing', file.name, error);
                this.showStatus(`Error processing ${file.name}`, 'error');
            }
        }

        if (this.images.length > 0) {
            this.currentIndex = 0;
            this.showPreview();
            this.showStatus(`${this.images.length} image(s) processed successfully!`, 'success');
        }
    }

    async removeBackground(file) {
        try {
            // Use the imglyRemoveBackground library
            const blob = await imglyRemoveBackground(file);
            return blob;
        } catch (error) {
            console.error('Background removal error:', error);
            throw error;
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    showPreview() {
        this.previewSection.classList.remove('hidden');
        this.displayCurrentImage();
    }

    displayCurrentImage() {
        const current = this.images[this.currentIndex];
        this.originalImage.src = current.original;
        this.processedImage.src = current.processed;
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
        link.href = current.processed;
        link.download = 'no_bg_' + current.name.replace(/\.[^/.]+$/, '.png');
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
                const fileName = 'no_bg_' + image.name.replace(/\.[^/.]+$/, '.png');
                zip.file(fileName, image.blob);
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'background_removed_images.zip';
            link.click();
            
            this.showStatus('ZIP file downloaded!', 'success');
        } catch (error) {
            console.error(error);
            this.showStatus('Error creating ZIP file', 'error');
        }
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
    new BackgroundRemover();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   BACKGROUND REMOVER v1.0            ║');
console.log('║   Remove backgrounds with AI         ║');
console.log('╚═══════════════════════════════════════╝');
