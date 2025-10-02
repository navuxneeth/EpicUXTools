class ImageToPDFConverter {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.actionButtons = document.getElementById('actionButtons');
        this.statusMessage = document.getElementById('statusMessage');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.pageSize = document.getElementById('pageSize');
        this.orientation = document.getElementById('orientation');
        this.imagePerPage = document.getElementById('imagePerPage');
        
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
        this.convertBtn.addEventListener('click', () => this.convertToPDF());
        this.clearBtn.addEventListener('click', () => this.clearAll());
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

    async convertToPDF() {
        if (this.images.length === 0) {
            this.showStatus('Please add images first!', 'error');
            return;
        }

        this.showStatus('Converting to PDF...', 'info');
        this.convertBtn.disabled = true;

        try {
            const { jsPDF } = window.jspdf;
            
            // Page dimensions in mm
            const pageSizes = {
                'a4': { width: 210, height: 297 },
                'letter': { width: 216, height: 279 },
                'legal': { width: 216, height: 356 },
                'a3': { width: 297, height: 420 }
            };

            const size = pageSizes[this.pageSize.value];
            const isPortrait = this.orientation.value === 'portrait';
            const width = isPortrait ? size.width : size.height;
            const height = isPortrait ? size.height : size.width;
            const imagesPerPage = parseInt(this.imagePerPage.value);

            const pdf = new jsPDF({
                orientation: this.orientation.value,
                unit: 'mm',
                format: [width, height]
            });

            const margin = 10;
            const usableWidth = width - (2 * margin);
            const usableHeight = height - (2 * margin);

            // Calculate grid layout
            let cols, rows;
            if (imagesPerPage === 1) {
                cols = 1;
                rows = 1;
            } else if (imagesPerPage === 2) {
                cols = 1;
                rows = 2;
            } else { // 4
                cols = 2;
                rows = 2;
            }

            const cellWidth = usableWidth / cols;
            const cellHeight = usableHeight / rows;

            for (let i = 0; i < this.images.length; i++) {
                const posInPage = i % imagesPerPage;
                
                if (i > 0 && posInPage === 0) {
                    pdf.addPage();
                }

                const row = Math.floor(posInPage / cols);
                const col = posInPage % cols;

                const x = margin + (col * cellWidth);
                const y = margin + (row * cellHeight);

                // Load image and get dimensions
                const img = await this.loadImage(this.images[i].dataURL);
                const imgRatio = img.width / img.height;
                const cellRatio = cellWidth / cellHeight;

                let imgWidth, imgHeight, imgX, imgY;

                // Fit image in cell maintaining aspect ratio
                if (imgRatio > cellRatio) {
                    imgWidth = cellWidth - 10;
                    imgHeight = imgWidth / imgRatio;
                } else {
                    imgHeight = cellHeight - 10;
                    imgWidth = imgHeight * imgRatio;
                }

                // Center image in cell
                imgX = x + (cellWidth - imgWidth) / 2;
                imgY = y + (cellHeight - imgHeight) / 2;

                pdf.addImage(this.images[i].dataURL, 'JPEG', imgX, imgY, imgWidth, imgHeight);
            }

            pdf.save('images_combined.pdf');
            this.showStatus('PDF created successfully!', 'success');
        } catch (error) {
            console.error(error);
            this.showStatus('Error creating PDF: ' + error.message, 'error');
        } finally {
            this.convertBtn.disabled = false;
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
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
    converter = new ImageToPDFConverter();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   IMAGE TO PDF CONVERTER v1.0        ║');
console.log('║   Batch convert images to PDF        ║');
console.log('╚═══════════════════════════════════════╝');
