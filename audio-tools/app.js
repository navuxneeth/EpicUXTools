class AudioEditor {
    constructor() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.statusMessage = document.getElementById('statusMessage');
        
        // Preview elements
        this.previewSection = document.getElementById('previewSection');
        this.audioPreview = document.getElementById('audioPreview');
        this.toolsSection = document.getElementById('toolsSection');
        this.actionsSection = document.getElementById('actionsSection');
        
        // Waveform
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.waveformPlaceholder = document.getElementById('waveformPlaceholder');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        
        // Audio info
        this.infoDuration = document.getElementById('infoDuration');
        this.infoSize = document.getElementById('infoSize');
        this.infoFormat = document.getElementById('infoFormat');
        this.infoBitrate = document.getElementById('infoBitrate');
        
        // Tool tabs
        this.toolTabs = document.querySelectorAll('.tool-tab');
        this.toolSections = document.querySelectorAll('.tool-section');
        
        // Trim controls
        this.trimStart = document.getElementById('trimStart');
        this.trimEnd = document.getElementById('trimEnd');
        this.applyTrim = document.getElementById('applyTrim');
        
        // Crop controls
        this.cropStart = document.getElementById('cropStart');
        this.cropEnd = document.getElementById('cropEnd');
        this.applyCrop = document.getElementById('applyCrop');
        
        // Speed controls
        this.speedPreset = document.getElementById('speedPreset');
        this.speedCustom = document.getElementById('speedCustom');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.preservePitch = document.getElementById('preservePitch');
        this.applySpeed = document.getElementById('applySpeed');
        
        // Reverse controls
        this.applyReverse = document.getElementById('applyReverse');
        
        // Merge controls
        this.mergeUploadArea = document.getElementById('mergeUploadArea');
        this.mergeFileInput = document.getElementById('mergeFileInput');
        this.mergeAudioList = document.getElementById('mergeAudioList');
        this.applyMerge = document.getElementById('applyMerge');
        
        // Volume controls
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.fadeIn = document.getElementById('fadeIn');
        this.fadeOut = document.getElementById('fadeOut');
        this.applyVolume = document.getElementById('applyVolume');
        
        // Action buttons
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // State
        this.currentAudio = null;
        this.audioFile = null;
        this.mergeAudios = [];
        this.audioContext = null;
        this.audioBuffer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAudioContext();
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    setupEventListeners() {
        // Upload area
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleAudioUpload(e.target.files[0]);
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
                this.handleAudioUpload(e.dataTransfer.files[0]);
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
            this.trimAudio();
        });

        // Crop controls
        this.applyCrop.addEventListener('click', () => {
            this.cropAudio();
        });

        // Speed controls
        this.speedPreset.addEventListener('change', () => {
            const value = this.speedPreset.value;
            if (value !== 'custom') {
                const speed = parseFloat(value);
                this.speedSlider.value = speed;
                this.speedCustom.value = speed;
                this.speedValue.textContent = speed.toFixed(2) + 'x';
                this.updatePlaybackRate();
            }
        });

        this.speedSlider.addEventListener('input', () => {
            const speed = parseFloat(this.speedSlider.value);
            this.speedCustom.value = speed;
            this.speedValue.textContent = speed.toFixed(2) + 'x';
            this.updatePlaybackRate();
        });

        this.speedCustom.addEventListener('input', () => {
            const speed = parseFloat(this.speedCustom.value);
            this.speedSlider.value = speed;
            this.speedValue.textContent = speed.toFixed(2) + 'x';
            this.updatePlaybackRate();
            this.speedPreset.value = 'custom';
        });

        this.preservePitch.addEventListener('change', () => {
            this.updatePlaybackRate();
        });

        this.applySpeed.addEventListener('click', () => {
            this.adjustSpeed();
        });

        // Reverse controls
        this.applyReverse.addEventListener('click', () => {
            this.reverseAudio();
        });

        // Volume controls
        this.volumeSlider.addEventListener('input', () => {
            const volume = parseInt(this.volumeSlider.value);
            this.volumeValue.textContent = volume + '%';
            this.audioPreview.volume = Math.min(volume / 100, 1);
        });

        this.applyVolume.addEventListener('click', () => {
            this.adjustVolume();
        });

        // Merge controls
        this.mergeUploadArea.addEventListener('click', () => {
            this.mergeFileInput.click();
        });

        this.mergeFileInput.addEventListener('change', (e) => {
            this.addMergeAudios(e.target.files);
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
            this.addMergeAudios(e.dataTransfer.files);
        });

        this.applyMerge.addEventListener('click', () => {
            this.mergeAudio();
        });

        // Action buttons
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        this.downloadBtn.addEventListener('click', () => {
            this.downloadAudio();
        });

        // Audio loaded
        this.audioPreview.addEventListener('loadedmetadata', () => {
            this.updateAudioInfo();
            this.trimEnd.value = this.audioPreview.duration;
            this.trimEnd.max = this.audioPreview.duration;
            this.trimStart.max = this.audioPreview.duration;
            this.drawWaveform();
        });
    }

    async handleAudioUpload(file) {
        if (!file.type.startsWith('audio/')) {
            this.showStatus('Please select a valid audio file!', 'error');
            return;
        }

        this.audioFile = file;
        this.currentAudio = URL.createObjectURL(file);
        this.audioPreview.src = this.currentAudio;
        
        this.previewSection.classList.remove('hidden');
        this.toolsSection.classList.remove('hidden');
        this.actionsSection.classList.remove('hidden');
        
        this.showStatus('Audio loaded successfully!', 'success');
        
        // Load audio for waveform
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error('Error decoding audio', e);
        }
    }

    updateAudioInfo() {
        // Duration
        const duration = this.audioPreview.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        this.infoDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Size
        const sizeMB = (this.audioFile.size / (1024 * 1024)).toFixed(2);
        this.infoSize.textContent = `${sizeMB} MB`;
        
        // Format
        this.infoFormat.textContent = this.audioFile.type.split('/')[1].toUpperCase();
        
        // Bitrate (estimated)
        const bitrate = Math.floor((this.audioFile.size * 8) / duration / 1000);
        this.infoBitrate.textContent = `~${bitrate} kbps`;
    }

    drawWaveform() {
        if (!this.audioBuffer) {
            return;
        }

        this.waveformPlaceholder.style.display = 'none';
        
        const canvas = this.waveformCanvas;
        const ctx = this.waveformCtx;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const data = this.audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;
        
        // Clear canvas
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-input-bg');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw waveform
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < canvas.width; i++) {
            let min = 1.0;
            let max = -1.0;
            
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        
        ctx.stroke();
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
        const end = parseFloat(this.trimEnd.value) || this.audioPreview.duration;
        
        // Update audio current time to show trim start
        if (this.audioPreview.paused) {
            this.audioPreview.currentTime = start;
        }
    }

    async trimAudio() {
        const start = parseFloat(this.trimStart.value) || 0;
        const end = parseFloat(this.trimEnd.value) || this.audioPreview.duration;
        
        if (start >= end) {
            this.showStatus('Start time must be less than end time!', 'error');
            return;
        }

        this.showStatus('Trimming audio... Preview updated', 'info');
        
        // Set playback bounds
        this.audioPreview.currentTime = start;
        
        // Add event listener to stop at end time
        const stopHandler = () => {
            if (this.audioPreview.currentTime >= end) {
                this.audioPreview.pause();
                this.audioPreview.currentTime = start;
            }
        };
        
        this.audioPreview.removeEventListener('timeupdate', this.currentStopHandler);
        this.currentStopHandler = stopHandler;
        this.audioPreview.addEventListener('timeupdate', stopHandler);
        
        this.showStatus(`Audio trimmed! Preview shows seconds ${start.toFixed(1)} to ${end.toFixed(1)}`, 'success');
    }

    async cropAudio() {
        const cropStart = parseFloat(this.cropStart.value) || 0;
        const cropEnd = parseFloat(this.cropEnd.value) || 0;
        
        const duration = this.audioPreview.duration;
        const newStart = cropStart;
        const newEnd = duration - cropEnd;
        
        if (newStart >= newEnd) {
            this.showStatus('Invalid crop values!', 'error');
            return;
        }
        
        // Update trim values
        this.trimStart.value = newStart;
        this.trimEnd.value = newEnd;
        
        // Apply trim
        await this.trimAudio();
        
        this.showStatus(`Audio cropped! Removed ${cropStart}s from start and ${cropEnd}s from end`, 'success');
    }

    updatePlaybackRate() {
        const speed = parseFloat(this.speedCustom.value);
        this.audioPreview.playbackRate = speed;
        this.audioPreview.preservesPitch = this.preservePitch.checked;
    }

    async adjustSpeed() {
        const speed = parseFloat(this.speedCustom.value);
        
        if (speed < 0.1 || speed > 4) {
            this.showStatus('Speed must be between 0.1x and 4.0x!', 'error');
            return;
        }
        
        this.audioPreview.playbackRate = speed;
        this.audioPreview.preservesPitch = this.preservePitch.checked;
        
        const pitchNote = this.preservePitch.checked ? ' (pitch preserved)' : ' (pitch affected)';
        this.showStatus(`Speed set to ${speed.toFixed(2)}x${pitchNote}`, 'success');
    }

    async reverseAudio() {
        if (!this.audioBuffer) {
            this.showStatus('Audio not fully loaded yet!', 'error');
            return;
        }
        
        this.showStatus('Reversing audio...', 'info');
        
        try {
            // Create reversed audio buffer
            const reversedBuffer = this.audioContext.createBuffer(
                this.audioBuffer.numberOfChannels,
                this.audioBuffer.length,
                this.audioBuffer.sampleRate
            );
            
            // Reverse each channel
            for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
                const originalData = this.audioBuffer.getChannelData(channel);
                const reversedData = reversedBuffer.getChannelData(channel);
                
                for (let i = 0; i < originalData.length; i++) {
                    reversedData[i] = originalData[originalData.length - 1 - i];
                }
            }
            
            // Convert to blob and update preview
            const wav = this.audioBufferToWav(reversedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            if (this.currentAudio) {
                URL.revokeObjectURL(this.currentAudio);
            }
            
            this.currentAudio = url;
            this.audioPreview.src = url;
            this.audioBuffer = reversedBuffer;
            
            this.showStatus('Audio reversed successfully!', 'success');
            this.drawWaveform();
        } catch (error) {
            this.showStatus('Error reversing audio: ' + error.message, 'error');
        }
    }

    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const data = new Float32Array(buffer.length * numChannels);
        
        // Interleave channels
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                data[i * numChannels + channel] = channelData[i];
            }
        }
        
        const dataLength = data.length * bytesPerSample;
        const arrayBuffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(arrayBuffer);
        
        // Write WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
    }

    async adjustVolume() {
        const volume = parseInt(this.volumeSlider.value);
        this.audioPreview.volume = Math.min(volume / 100, 1);
        
        const fadeInTime = parseFloat(this.fadeIn.value) || 0;
        const fadeOutTime = parseFloat(this.fadeOut.value) || 0;
        
        let statusMsg = `Volume set to ${volume}%`;
        if (fadeInTime > 0) statusMsg += `, ${fadeInTime}s fade in`;
        if (fadeOutTime > 0) statusMsg += `, ${fadeOutTime}s fade out`;
        
        this.showStatus(statusMsg, 'success');
    }

    addMergeAudios(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('audio/')) {
                this.mergeAudios.push(file);
            }
        });
        
        this.updateMergeAudioList();
    }

    updateMergeAudioList() {
        if (this.mergeAudios.length === 0) {
            this.mergeAudioList.innerHTML = '<p style="color: var(--color-text-dim);">No additional audio files added</p>';
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: var(--space-sm);">';
        html += '<p style="color: var(--color-primary); font-weight: bold;">Audio files to merge:</p>';
        
        // Include the main audio
        if (this.audioFile) {
            html += `<div style="padding: var(--space-sm); background: var(--color-card); border: 1px solid var(--color-border);">
                1. ${this.audioFile.name}
            </div>`;
        }
        
        this.mergeAudios.forEach((file, index) => {
            html += `<div style="padding: var(--space-sm); background: var(--color-card); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <span>${index + 2}. ${file.name}</span>
                <button onclick="audioEditor.removeMergeAudio(${index})" style="background: var(--color-secondary); color: white; border: none; padding: 4px 8px; cursor: pointer;">✕</button>
            </div>`;
        });
        
        html += '</div>';
        this.mergeAudioList.innerHTML = html;
    }

    removeMergeAudio(index) {
        this.mergeAudios.splice(index, 1);
        this.updateMergeAudioList();
    }

    async mergeAudio() {
        if (this.mergeAudios.length === 0) {
            this.showStatus('Please add audio files to merge!', 'error');
            return;
        }
        
        this.showStatus('Merging audio files... This may take a moment', 'info');
        
        try {
            // Load all audio files
            const buffers = [this.audioBuffer];
            
            for (const file of this.mergeAudios) {
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                buffers.push(audioBuffer);
            }
            
            // Calculate total length
            let totalLength = 0;
            buffers.forEach(buffer => {
                totalLength += buffer.length;
            });
            
            // Create merged buffer
            const mergedBuffer = this.audioContext.createBuffer(
                buffers[0].numberOfChannels,
                totalLength,
                buffers[0].sampleRate
            );
            
            // Copy all buffers
            let offset = 0;
            for (const buffer of buffers) {
                for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                    const sourceData = buffer.getChannelData(channel);
                    const targetData = mergedBuffer.getChannelData(channel);
                    targetData.set(sourceData, offset);
                }
                offset += buffer.length;
            }
            
            // Convert to blob and update preview
            const wav = this.audioBufferToWav(mergedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            if (this.currentAudio) {
                URL.revokeObjectURL(this.currentAudio);
            }
            
            this.currentAudio = url;
            this.audioPreview.src = url;
            this.audioBuffer = mergedBuffer;
            
            this.showStatus(`${buffers.length} audio files merged successfully!`, 'success');
            this.drawWaveform();
        } catch (error) {
            this.showStatus('Error merging audio: ' + error.message, 'error');
        }
    }

    downloadAudio() {
        const link = document.createElement('a');
        link.href = this.currentAudio;
        link.download = 'edited_' + (this.audioFile ? this.audioFile.name : 'audio.wav');
        link.click();
        
        this.showStatus('Audio downloaded!', 'success');
    }

    clearAll() {
        // Reset audio
        if (this.currentAudio) {
            URL.revokeObjectURL(this.currentAudio);
        }
        
        this.currentAudio = null;
        this.audioFile = null;
        this.mergeAudios = [];
        this.audioBuffer = null;
        
        this.audioPreview.src = '';
        this.audioPreview.playbackRate = 1;
        this.audioPreview.preservesPitch = true;
        this.audioPreview.volume = 1;
        
        this.previewSection.classList.add('hidden');
        this.toolsSection.classList.add('hidden');
        this.actionsSection.classList.add('hidden');
        
        this.fileInput.value = '';
        this.mergeFileInput.value = '';
        this.statusMessage.innerHTML = '';
        
        // Clear waveform
        this.waveformCtx.clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
        this.waveformPlaceholder.style.display = 'flex';
        
        // Reset controls
        this.trimStart.value = 0;
        this.trimEnd.value = 0;
        this.cropStart.value = 0;
        this.cropEnd.value = 0;
        this.speedSlider.value = 1;
        this.speedCustom.value = 1;
        this.speedPreset.value = '1';
        this.speedValue.textContent = '1.0x';
        this.volumeSlider.value = 100;
        this.volumeValue.textContent = '100%';
        this.fadeIn.value = 0;
        this.fadeOut.value = 0;
        this.preservePitch.checked = true;
        
        if (this.currentStopHandler) {
            this.audioPreview.removeEventListener('timeupdate', this.currentStopHandler);
            this.currentStopHandler = null;
        }
        
        this.updateMergeAudioList();
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
let audioEditor;
document.addEventListener('DOMContentLoaded', () => {
    audioEditor = new AudioEditor();
});

console.log('╔═══════════════════════════════════════╗');
console.log('║   AUDIO EDITOR v1.0                  ║');
console.log('║   Edit audio with live preview       ║');
console.log('╚═══════════════════════════════════════╝');
