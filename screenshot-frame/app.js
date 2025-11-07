const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frameType = document.getElementById('frameType');
const downloadBtn = document.getElementById('downloadBtn');

let currentImage = null;

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
});

frameType.addEventListener('change', () => {
    if (currentImage) drawFrame();
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            drawFrame();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function drawFrame() {
    const padding = 50;
    const shadowSize = 30;
    const type = frameType.value;
    
    canvas.width = currentImage.width + padding * 2 + shadowSize;
    canvas.height = currentImage.height + padding * 2 + shadowSize;
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(padding + shadowSize/2, padding + shadowSize/2, currentImage.width, currentImage.height);
    
    // Draw frame based on device type
    let frameColor = '#333';
    let frameWidth = currentImage.width;
    let frameHeight = currentImage.height;
    
    if (type === 'phone') {
        frameColor = '#1a1a1a';
        // Add phone-specific styling (rounded corners, notch area)
        ctx.fillStyle = frameColor;
        ctx.roundRect(padding, padding - 30, frameWidth, frameHeight + 60, 20);
        ctx.fill();
    } else if (type === 'laptop') {
        frameColor = '#2a2a2a';
        // Add laptop bezel
        ctx.fillStyle = frameColor;
        ctx.fillRect(padding - 10, padding - 10, frameWidth + 20, frameHeight + 20);
        // Add keyboard area below
        ctx.fillRect(padding - 40, padding + frameHeight + 20, frameWidth + 80, 20);
    } else if (type === 'tablet') {
        frameColor = '#3a3a3a';
        ctx.fillStyle = frameColor;
        ctx.roundRect(padding - 5, padding - 5, frameWidth + 10, frameHeight + 10, 10);
        ctx.fill();
    } else { // desktop
        frameColor = '#444';
        ctx.fillStyle = frameColor;
        ctx.fillRect(padding - 15, padding - 15, frameWidth + 30, frameHeight + 30);
    }
    
    // Draw image
    ctx.drawImage(currentImage, padding, padding);
    
    canvas.style.display = 'block';
    downloadBtn.style.display = 'block';
}

function download() {
    const link = document.createElement('a');
    link.download = 'framed-screenshot.png';
    link.href = canvas.toDataURL();
    link.click();
}
