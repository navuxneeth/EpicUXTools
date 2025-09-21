class Real3DApp {
    constructor() {
        this.leftImage = null;
        this.rightImage = null;
        this.currentMode = 'reald_sbs';
        this.settings = {
            horizontalShift: 0,
            verticalShift: 0,
            rotation: 0,
            convergence: 0,
            parallax: 0,
            depthIntensity: 100,
            brightness: 0,
            contrast: 100
        };

        this.viewingModes = {
            reald_sbs: {
                name: "Real3D Side-by-Side",
                description: "Standard format for Real3D polarized glasses",
                instructions: "View with Real3D circular polarized glasses"
            },
            cross_eyed: {
                name: "Cross-Eyed Viewing", 
                description: "For free viewing without glasses",
                instructions: "Cross your eyes until images merge in the center"
            },
            parallel: {
                name: "Parallel Viewing",
                description: "Relaxed eye viewing method", 
                instructions: "Relax your eyes as if looking through the screen"
            },
            anaglyph: {
                name: "Red-Cyan Anaglyph",
                description: "For red-cyan 3D glasses testing",
                instructions: "Use red-cyan anaglyph glasses"
            }
        };

        this.resolutionPresets = {
            hd: {width: 1920, height: 1080, name: "Full HD"},
            qhd: {width: 2560, height: 1440, name: "QHD"},
            "4k": {width: 3840, height: 2160, name: "4K UHD"},
            original: {width: 0, height: 0, name: "Original Size"}
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupSliders();
        // Show controls section for testing purposes
        this.showControlsForTesting();
    }

    showControlsForTesting() {
        // Make controls visible for testing even without images
        document.getElementById('controlsSection').style.display = 'block';
        document.getElementById('previewSection').style.display = 'block';
        
        // Create dummy canvas for preview
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 400;
        
        // Draw placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 800, 400);
        ctx.fillStyle = '#666';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Upload images to see stereoscopic preview', 400, 200);
    }

    setupEventListeners() {
        // File upload buttons - Fixed click handlers
        const leftUpload = document.getElementById('leftUpload');
        const rightUpload = document.getElementById('rightUpload');
        const leftFile = document.getElementById('leftFile');
        const rightFile = document.getElementById('rightFile');

        leftUpload.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            leftFile.click();
        });

        rightUpload.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            rightFile.click();
        });

        // File inputs - Fixed change handlers
        leftFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileUpload(e, 'left');
            }
        });

        rightFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileUpload(e, 'right');
            }
        });

        // Remove buttons
        document.getElementById('removeLeft').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage('left');
        });
        document.getElementById('removeRight').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage('right');
        });

        // Viewing mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchViewingMode(btn.dataset.mode);
            });
        });

        // Export and fullscreen buttons
        document.getElementById('exportBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showExportModal();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.enterFullscreen();
        });

        // Modal controls
        document.getElementById('closeExportModal').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideExportModal();
        });
        
        document.getElementById('cancelExport').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideExportModal();
        });
        
        document.getElementById('confirmExport').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportImage();
        });

        // Fullscreen controls
        document.getElementById('exitFullscreen').addEventListener('click', (e) => {
            e.preventDefault();
            this.exitFullscreen();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.exitFullscreen();
                this.hideExportModal();
            }
            if (e.key === 'f' || e.key === 'F') {
                if (this.leftImage && this.rightImage) {
                    this.enterFullscreen();
                }
            }
        });

        // Click outside modal to close
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                this.hideExportModal();
            }
        });
    }

    setupDragAndDrop() {
        const leftUpload = document.getElementById('leftUpload');
        const rightUpload = document.getElementById('rightUpload');

        [leftUpload, rightUpload].forEach((area, index) => {
            const side = index === 0 ? 'left' : 'right';

            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                area.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload({target: {files}}, side);
                }
            });
        });

        // Prevent default drag behaviors on document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
    }

    setupSliders() {
        const sliders = [
            'horizontalShift', 'verticalShift', 'rotation', 
            'convergence', 'parallax', 'depthIntensity', 
            'brightness', 'contrast'
        ];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (!slider) return;
            
            const valueSpan = slider.nextElementSibling;

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.settings[sliderId] = value;
                this.updateSliderValue(sliderId, value);
                this.updatePreview();
            });

            // Initialize slider value display
            this.updateSliderValue(sliderId, parseFloat(slider.value));
        });
    }

    updateSliderValue(sliderId, value) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const valueSpan = slider.nextElementSibling;
        if (!valueSpan) return;
        
        let displayValue = value;
        let unit = '';

        switch(sliderId) {
            case 'horizontalShift':
            case 'verticalShift':
                unit = 'px';
                break;
            case 'rotation':
                unit = '°';
                displayValue = value.toFixed(1);
                break;
            case 'depthIntensity':
            case 'contrast':
                unit = '%';
                break;
        }

        valueSpan.textContent = displayValue + unit;
    }

    handleFileUpload(event, side) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.validateImageFile(file)) {
            alert('Please select a valid image file (JPEG, PNG, WebP, GIF, BMP)');
            return;
        }

        this.showProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.setImage(side, img, file);
                this.showProcessing(false);
            };
            img.onerror = () => {
                alert('Error loading image');
                this.showProcessing(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    setImage(side, img, file) {
        if (side === 'left') {
            this.leftImage = img;
        } else {
            this.rightImage = img;
        }

        // Update UI
        const preview = document.getElementById(`${side}Preview`);
        const uploadContent = document.querySelector(`#${side}Upload .upload-content`);
        const imgElement = document.getElementById(`${side}Img`);
        const dimensions = document.getElementById(`${side}Dimensions`);

        imgElement.src = img.src;
        dimensions.textContent = `${img.width} × ${img.height}`;
        
        preview.style.display = 'block';
        uploadContent.style.display = 'none';

        // Always show controls and preview
        document.getElementById('controlsSection').style.display = 'block';
        document.getElementById('previewSection').style.display = 'block';
        
        this.updatePreview();
    }

    removeImage(side) {
        if (side === 'left') {
            this.leftImage = null;
        } else {
            this.rightImage = null;
        }

        // Update UI
        const preview = document.getElementById(`${side}Preview`);
        const uploadContent = document.querySelector(`#${side}Upload .upload-content`);
        const fileInput = document.getElementById(`${side}File`);

        preview.style.display = 'none';
        uploadContent.style.display = 'flex';
        fileInput.value = '';

        this.updatePreview();
    }

    switchViewingMode(mode) {
        this.currentMode = mode;

        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update instructions
        const instructions = document.getElementById('modeInstructions');
        if (instructions && this.viewingModes[mode]) {
            instructions.textContent = this.viewingModes[mode].instructions;
        }

        this.updatePreview();
    }

    updatePreview() {
        const canvas = document.getElementById('previewCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');

        if (!this.leftImage || !this.rightImage) {
            // Show placeholder when no images
            canvas.width = 800;
            canvas.height = 400;
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 800, 400);
            ctx.fillStyle = '#666';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Upload left and right images to see preview', 400, 200);
            return;
        }

        // Calculate canvas size
        const maxWidth = canvas.parentElement.clientWidth;
        const maxHeight = 500;
        
        const leftAspect = this.leftImage.width / this.leftImage.height;
        const rightAspect = this.rightImage.width / this.rightImage.height;
        const avgAspect = (leftAspect + rightAspect) / 2;

        let canvasWidth, canvasHeight;
        
        if (this.currentMode === 'reald_sbs' || this.currentMode === 'cross_eyed' || this.currentMode === 'parallel') {
            // Side-by-side format
            canvasWidth = Math.min(maxWidth, maxHeight * avgAspect * 2);
            canvasHeight = canvasWidth / (avgAspect * 2);
        } else {
            // Anaglyph format
            canvasWidth = Math.min(maxWidth, maxHeight * avgAspect);
            canvasHeight = canvasWidth / avgAspect;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        this.renderStereoscopicImage(ctx, canvasWidth, canvasHeight);
    }

    renderStereoscopicImage(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);

        if (this.currentMode === 'anaglyph') {
            this.renderAnaglyph(ctx, width, height);
        } else {
            this.renderSideBySide(ctx, width, height);
        }
    }

    renderSideBySide(ctx, width, height) {
        const halfWidth = width / 2;
        
        // Apply settings and render left image
        ctx.save();
        this.applyImageTransforms(ctx, 'left', 0, 0, halfWidth, height);
        ctx.drawImage(this.leftImage, 0, 0, halfWidth, height);
        ctx.restore();

        // Apply settings and render right image
        ctx.save();
        this.applyImageTransforms(ctx, 'right', halfWidth, 0, halfWidth, height);
        
        if (this.currentMode === 'cross_eyed') {
            // Swap left and right for cross-eyed viewing
            ctx.drawImage(this.leftImage, halfWidth, 0, halfWidth, height);
        } else {
            ctx.drawImage(this.rightImage, halfWidth, 0, halfWidth, height);
        }
        ctx.restore();

        // Draw center divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(halfWidth, 0);
        ctx.lineTo(halfWidth, height);
        ctx.stroke();
    }

    renderAnaglyph(ctx, width, height) {
        // Create temporary canvases for red and cyan channels
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // Render left image (red channel)
        tempCtx.save();
        this.applyImageTransforms(tempCtx, 'left', 0, 0, width, height);
        tempCtx.drawImage(this.leftImage, 0, 0, width, height);
        const leftImageData = tempCtx.getImageData(0, 0, width, height);
        tempCtx.restore();

        // Render right image (cyan channel)
        tempCtx.clearRect(0, 0, width, height);
        tempCtx.save();
        this.applyImageTransforms(tempCtx, 'right', 0, 0, width, height);
        tempCtx.drawImage(this.rightImage, 0, 0, width, height);
        const rightImageData = tempCtx.getImageData(0, 0, width, height);
        tempCtx.restore();

        // Combine into anaglyph
        const anaglyphData = ctx.createImageData(width, height);
        for (let i = 0; i < anaglyphData.data.length; i += 4) {
            // Red channel from left image
            anaglyphData.data[i] = leftImageData.data[i];
            // Green and blue channels from right image
            anaglyphData.data[i + 1] = rightImageData.data[i + 1];
            anaglyphData.data[i + 2] = rightImageData.data[i + 2];
            // Alpha
            anaglyphData.data[i + 3] = 255;
        }

        ctx.putImageData(anaglyphData, 0, 0);
    }

    applyImageTransforms(ctx, side, x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // Apply transformations
        ctx.translate(centerX, centerY);
        
        // Rotation
        if (this.settings.rotation !== 0) {
            ctx.rotate(this.settings.rotation * Math.PI / 180);
        }

        // Horizontal and vertical shifts
        const shiftX = side === 'left' ? -this.settings.horizontalShift : this.settings.horizontalShift;
        const shiftY = this.settings.verticalShift;
        ctx.translate(shiftX + (this.settings.parallax * (side === 'left' ? -1 : 1)), shiftY);

        // Color adjustments
        if (this.settings.brightness !== 0 || this.settings.contrast !== 100) {
            const brightness = this.settings.brightness / 100;
            const contrast = this.settings.contrast / 100;
            ctx.filter = `brightness(${1 + brightness}) contrast(${contrast})`;
        }

        ctx.translate(-centerX, -centerY);
    }

    showExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    exportImage() {
        const format = document.getElementById('exportFormat').value;
        const resolution = document.getElementById('exportResolution').value;
        const quality = parseFloat(document.getElementById('exportQuality').value) / 100;

        this.hideExportModal();
        this.showProcessing(true);

        setTimeout(() => {
            this.generateExportImage(format, resolution, quality);
            this.showProcessing(false);
        }, 100);
    }

    generateExportImage(format, resolution, quality) {
        if (!this.leftImage || !this.rightImage) {
            alert('Please upload both left and right images first');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width, height;
        if (resolution === 'original') {
            const avgWidth = (this.leftImage.width + this.rightImage.width) / 2;
            const avgHeight = (this.leftImage.height + this.rightImage.height) / 2;
            
            if (this.currentMode === 'anaglyph') {
                width = avgWidth;
                height = avgHeight;
            } else {
                width = avgWidth * 2;
                height = avgHeight;
            }
        } else {
            const preset = this.resolutionPresets[resolution];
            width = preset.width;
            height = preset.height;
        }

        canvas.width = width;
        canvas.height = height;

        this.renderStereoscopicImage(ctx, width, height);

        // Download the image
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        const link = document.createElement('a');
        link.download = `real3d-stereoscopic-${Date.now()}.${format}`;
        link.href = dataURL;
        link.click();
    }

    enterFullscreen() {
        if (!this.leftImage || !this.rightImage) {
            alert('Please upload both images first');
            return;
        }

        const viewer = document.getElementById('fullscreenViewer');
        const canvas = document.getElementById('fullscreenCanvas');
        const ctx = canvas.getContext('2d');
        
        // Update viewer mode text
        document.getElementById('viewerModeText').textContent = this.viewingModes[this.currentMode].name;
        document.getElementById('viewingInstructions').textContent = this.viewingModes[this.currentMode].instructions;

        // Set canvas size to screen dimensions
        canvas.width = Math.min(window.innerWidth, 1920);
        canvas.height = Math.min(window.innerHeight - 100, 1080);

        this.renderStereoscopicImage(ctx, canvas.width, canvas.height);
        
        viewer.classList.remove('hidden');
        
        // Try to enter actual fullscreen
        if (viewer.requestFullscreen) {
            viewer.requestFullscreen();
        } else if (viewer.webkitRequestFullscreen) {
            viewer.webkitRequestFullscreen();
        } else if (viewer.msRequestFullscreen) {
            viewer.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        const viewer = document.getElementById('fullscreenViewer');
        if (viewer) {
            viewer.classList.add('hidden');
        }
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    showProcessing(show) {
        const overlay = document.getElementById('processingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.real3DApp = new Real3DApp();
        console.log('Real3D Stereoscopic Image Creator initialized successfully');
    } catch (error) {
        console.error('Error initializing Real3D app:', error);
    }
});

// Handle window resize for responsive canvas
window.addEventListener('resize', () => {
    if (window.real3DApp) {
        setTimeout(() => {
            window.real3DApp.updatePreview();
        }, 100);
    }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const viewer = document.getElementById('fullscreenViewer');
        if (viewer) viewer.classList.add('hidden');
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
        const viewer = document.getElementById('fullscreenViewer');
        if (viewer) viewer.classList.add('hidden');
    }
});

// Add keyboard shortcuts info to console
console.log('Real3D Stereoscopic Image Creator - Keyboard Shortcuts:');
console.log('F - Enter fullscreen mode (when images are loaded)');
console.log('ESC - Exit fullscreen or close modals');
console.log('Drag & Drop - Upload images to left/right areas');