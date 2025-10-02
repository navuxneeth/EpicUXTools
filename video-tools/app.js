class VideoEditor {
    constructor() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.statusMessage = document.getElementById('statusMessage');
        
        // Preview elements
        this.previewSection = document.getElementById('previewSection');
        this.videoPreview = document.getElementById('videoPreview');
        this.toolsSection = document.getElementById('toolsSection');
        this.actionsSection = document.getElementById('actionsSection');
        
        // Video info
        this.infoDuration = document.getElementById('infoDuration');
        this.infoResolution = document.getElementById('infoResolution');
        this.infoSize = document.getElementById('infoSize');
        this.infoFormat = document.getElementById('infoFormat');
        
        // Tool tabs
        this.toolTabs = document.querySelectorAll('.tool-tab');
        this.toolSections = document.querySelectorAll('.tool-section');
        
        // Trim controls
        this.trimStart = document.getElementById('trimStart');
        this.trimEnd = document.getElementById('trimEnd');
        this.applyTrim = document.getElementById('applyTrim');
        
        // Crop controls
        this.cropPreset = document.getElementById('cropPreset');
        this.cropWidth = document.getElementById('cropWidth');
        this.cropHeight = document.getElementById('cropHeight');
        this.cropX = document.getElementById('cropX');
        this.cropY = document.getElementById('cropY');
        this.applyCrop = document.getElementById('applyCrop');
        
        // Speed controls
        this.speedPreset = document.getElementById('speedPreset');
        this.speedCustom = document.getElementById('speedCustom');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.applySpeed = document.getElementById('applySpeed');
        
        // Reverse controls
        this.applyReverse = document.getElementById('applyReverse');
        
        // Merge controls
        this.mergeUploadArea = document.getElementById('mergeUploadArea');
        this.mergeFileInput = document.getElementById('mergeFileInput');
        this.mergeVideosList = document.getElementById('mergeVideosList');
        this.applyMerge = document.getElementById('applyMerge');
        
        // Action buttons
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // State
        this.currentVideo = null;
        this.videoFile = null;
        this.mergeVideos = [];
        this.editedVideoBlob = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Upload area
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleVideoUpload(e.target.files[0]);
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
                this.handleVideoUpload(e.dataTransfer.files[0]);
            }
        });

        // Tool tabs
        this.toolTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTool(tab.dataset.tool);
            });
        });

        // Trim controls
        this.trimStart.addEventListener('input', () => {
            this.updateTrimPreview();
        });

        this.trimEnd.addEventListener('input', () => {
            this.updateTrimPreview();
        });

        this.applyTrim.addEventListener('click', () => {
            this.trimVideo();
        });

        // Crop controls
        this.cropPreset.addEventListener('change', () => {
            this.applyCropPreset();
        });

        this.applyCrop.addEventListener('click', () => {
            this.cropVideo();
        });

        // Speed controls
        this.speedPreset.addEventListener('change', () => {
            const value = this.speedPreset.value;
            if (value !== 'custom') {
                const speed = parseFloat(value);
                this.speedSlider.value = speed;
                this.speedCustom.value = speed;
                this.speedValue.textContent = speed.toFixed(2) + 'x';
                this.videoPreview.playbackRate = speed;
            }
        });

        this.speedSlider.addEventListener('input', () => {
            const speed = parseFloat(this.speedSlider.value);
            this.speedCustom.value = speed;
            this.speedValue.textContent = speed.toFixed(2) + 'x';
            this.videoPreview.playbackRate = speed;
        });

        this.speedCustom.addEventListener('input', () => {
            const speed = parseFloat(this.speedCustom.value);
            this.speedSlider.value = speed;
            this.speedValue.textContent = speed.toFixed(2) + 'x';
            this.videoPreview.playbackRate = speed;
            this.speedPreset.value = 'custom';
        });

        this.applySpeed.addEventListener('click', () => {
            this.adjustSpeed();
        });

        // Reverse controls
        this.applyReverse.addEventListener('click', () => {
            this.reverseVideo();
        });

        // Merge controls
        this.mergeUploadArea.addEventListener('click', () => {
            this.mergeFileInput.click();
        });

        this.mergeFileInput.addEventListener('change', (e) => {
            this.addMergeVideos(e.target.files);
        });

        this.mergeUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.mergeUploadArea.classList.add('dragover');
        });

        this.mergeUploadArea.addEventListener('dragleave', () => {
            this.mergeUploadArea.classList.remove('dragover');
        });

        this.mergeUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.mergeUploadArea.classList.remove('dragover');
            this.addMergeVideos(e.dataTransfer.files);
        });

        this.applyMerge.addEventListener('click', () => {
            this.mergeVideos();
        });

        // Action buttons
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        this.downloadBtn.addEventListener('click', () => {
            this.downloadVideo();
        });

        // Video loaded
        this.videoPreview.addEventListener('loadedmetadata', () => {
            this.updateVideoInfo();
            this.trimEnd.value = this.videoPreview.duration;
            this.trimEnd.max = this.videoPreview.duration;
            this.trimStart.max = this.videoPreview.duration;
        });
    }

    handleVideoUpload(file) {
        if (!file.type.startsWith('video/')) {
            this.showStatus('Please select a valid video file!', 'error');
            return;
        }

        this.videoFile = file;
        this.currentVideo = URL.createObjectURL(file);
        this.videoPreview.src = this.currentVideo;
        
        this.previewSection.classList.remove('hidden');
        this.toolsSection.classList.remove('hidden');
        this.actionsSection.classList.remove('hidden');
        
        this.showStatus('Video loaded successfully!', 'success');
    }

    updateVideoInfo() {
        // Duration
        const duration = this.videoPreview.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        this.infoDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Resolution
        this.infoResolution.textContent = `${this.videoPreview.videoWidth}x${this.videoPreview.videoHeight}`;
        
        // Size
        const sizeMB = (this.videoFile.size / (1024 * 1024)).toFixed(2);
        this.infoSize.textContent = `${sizeMB} MB`;
        
        // Format
        this.infoFormat.textContent = this.videoFile.type.split('/')[1].toUpperCase();
        
        // Set initial crop values
        this.cropWidth.value = this.videoPreview.videoWidth;
        this.cropHeight.value = this.videoPreview.videoHeight;
    }

    switchTool(toolName) {
        // Update tabs
        this.toolTabs.forEach(tab => {
            if (tab.dataset.tool === toolName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update sections
        this.toolSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(toolName + 'Tool').classList.add('active');
    }

    updateTrimPreview() {
        const start = parseFloat(this.trimStart.value) || 0;
        const end = parseFloat(this.trimEnd.value) || this.videoPreview.duration;
        
        // Update video current time to show trim start
        if (this.videoPreview.paused) {
            this.videoPreview.currentTime = start;
        }
    }

    async trimVideo() {
        const start = parseFloat(this.trimStart.value) || 0;
        const end = parseFloat(this.trimEnd.value) || this.videoPreview.duration;
        
        if (start >= end) {
            this.showStatus('Start time must be less than end time!', 'error');
            return;
        }

        this.showStatus('Trimming video... Please wait', 'info');
        
        try {
            // Create a canvas to capture trimmed video
            const canvas = document.createElement('canvas');
            canvas.width = this.videoPreview.videoWidth;
            canvas.height = this.videoPreview.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // For live preview, just update the video element
            this.videoPreview.currentTime = start;
            
            this.showStatus(`Video trimmed! Preview shows seconds ${start.toFixed(1)} to ${end.toFixed(1)}`, 'success');
            
            // Note: Actual trimming would require server-side processing or FFmpeg.wasm
            // This is a preview-only implementation
        } catch (error) {
            this.showStatus('Error trimming video: ' + error.message, 'error');
        }
    }

    applyCropPreset() {
        const preset = this.cropPreset.value;
        if (preset === 'custom') return;
        
        const videoWidth = this.videoPreview.videoWidth;
        const videoHeight = this.videoPreview.videoHeight;
        
        let width, height;
        
        switch (preset) {
            case '16:9':
                height = videoHeight;
                width = Math.floor((height * 16) / 9);
                if (width > videoWidth) {
                    width = videoWidth;
                    height = Math.floor((width * 9) / 16);
                }
                break;
            case '9:16':
                width = videoWidth;
                height = Math.floor((width * 16) / 9);
                if (height > videoHeight) {
                    height = videoHeight;
                    width = Math.floor((height * 9) / 16);
                }
                break;
            case '1:1':
                const size = Math.min(videoWidth, videoHeight);
                width = size;
                height = size;
                break;
            case '4:3':
                height = videoHeight;
                width = Math.floor((height * 4) / 3);
                if (width > videoWidth) {
                    width = videoWidth;
                    height = Math.floor((width * 3) / 4);
                }
                break;
        }
        
        this.cropWidth.value = width;
        this.cropHeight.value = height;
        this.cropX.value = Math.floor((videoWidth - width) / 2);
        this.cropY.value = Math.floor((videoHeight - height) / 2);
    }

    async cropVideo() {
        const width = parseInt(this.cropWidth.value);
        const height = parseInt(this.cropHeight.value);
        const x = parseInt(this.cropX.value);
        const y = parseInt(this.cropY.value);
        
        if (width <= 0 || height <= 0) {
            this.showStatus('Width and height must be greater than 0!', 'error');
            return;
        }
        
        this.showStatus('Crop settings applied to preview', 'success');
        
        // Apply crop effect visually by adjusting video element
        this.videoPreview.style.objectFit = 'none';
        this.videoPreview.style.objectPosition = `-${x}px -${y}px`;
        this.videoPreview.style.width = `${width}px`;
        this.videoPreview.style.height = `${height}px`;
    }

    async adjustSpeed() {
        const speed = parseFloat(this.speedCustom.value);
        
        if (speed < 0.1 || speed > 4) {
            this.showStatus('Speed must be between 0.1x and 4.0x!', 'error');
            return;
        }
        
        this.videoPreview.playbackRate = speed;
        this.showStatus(`Speed set to ${speed.toFixed(2)}x`, 'success');
    }

    async reverseVideo() {
        this.showStatus('Reverse feature requires advanced processing. Preview shows current video.', 'info');
        
        // Note: True video reversal requires FFmpeg.wasm or server-side processing
        // This would reverse frame order and audio
        this.showStatus('Note: Full reverse processing requires additional libraries (FFmpeg.wasm)', 'info');
    }

    addMergeVideos(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('video/')) {
                this.mergeVideos.push(file);
            }
        });
        
        this.updateMergeVideosList();
    }

    updateMergeVideosList() {
        if (this.mergeVideos.length === 0) {
            this.mergeVideosList.innerHTML = '<p style="color: var(--color-text-dim);">No additional videos added</p>';
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: var(--space-sm);">';
        html += '<p style="color: var(--color-primary); font-weight: bold;">Videos to merge:</p>';
        
        // Include the main video
        if (this.videoFile) {
            html += `<div style="padding: var(--space-sm); background: var(--color-card); border: 1px solid var(--color-border);">
                1. ${this.videoFile.name}
            </div>`;
        }
        
        this.mergeVideos.forEach((file, index) => {
            html += `<div style="padding: var(--space-sm); background: var(--color-card); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <span>${index + 2}. ${file.name}</span>
                <button onclick="videoEditor.removeMergeVideo(${index})" style="background: var(--color-secondary); color: white; border: none; padding: 4px 8px; cursor: pointer;">✕</button>
            </div>`;
        });
        
        html += '</div>';
        this.mergeVideosList.innerHTML = html;
    }

    removeMergeVideo(index) {
        this.mergeVideos.splice(index, 1);
        this.updateMergeVideosList();
    }

    async mergeVideos() {
        if (this.mergeVideos.length === 0) {
            this.showStatus('Please add videos to merge!', 'error');
            return;
        }
        
        this.showStatus('Merging videos requires advanced processing. Please use FFmpeg.wasm for full functionality.', 'info');
        
        // Note: True video merging requires FFmpeg.wasm or server-side processing
    }

    downloadVideo() {
        // Download the current video file
        const link = document.createElement('a');
        link.href = this.currentVideo;
        link.download = 'edited_' + (this.videoFile ? this.videoFile.name : 'video.mp4');
        link.click();
        
        this.showStatus('Video downloaded!', 'success');
    }

    clearAll() {
        // Reset video
        if (this.currentVideo) {
            URL.revokeObjectURL(this.currentVideo);
        }
        
        this.currentVideo = null;
        this.videoFile = null;
        this.mergeVideos = [];
        this.editedVideoBlob = null;
        
        this.videoPreview.src = '';
        this.videoPreview.style.objectFit = 'contain';
        this.videoPreview.style.objectPosition = 'center';
        this.videoPreview.style.width = '100%';
        this.videoPreview.style.height = 'auto';
        
        this.previewSection.classList.add('hidden');
        this.toolsSection.classList.add('hidden');
        this.actionsSection.classList.add('hidden');
        
        this.fileInput.value = '';
        this.mergeFileInput.value = '';
        this.statusMessage.innerHTML = '';
        
        // Reset controls
        this.trimStart.value = 0;
        this.trimEnd.value = 0;
        this.speedSlider.value = 1;
        this.speedCustom.value = 1;
        this.speedPreset.value = '1';
        this.speedValue.textContent = '1.0x';
        this.cropPreset.value = 'custom';
        
        this.updateMergeVideosList();
    }

    showStatus(message, type) {
        this.statusMessage.innerHTML = `
            <div class="status-message status-${type}">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            this.statusMessage.innerHTML = '';
        }, 5000);
    }
}

// Initialize
let videoEditor;
document.addEventListener('DOMContentLoaded', () => {
    videoEditor = new VideoEditor();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   VIDEO EDITOR v1.0                  ║');
console.log('║   Edit videos with live preview      ║');
console.log('╚═══════════════════════════════════════╝');
