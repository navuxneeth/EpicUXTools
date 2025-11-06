const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frameType = document.getElementById('frameType');
const downloadBtn = document.getElementById('downloadBtn');

let currentImage = null;

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
    
    canvas.width = currentImage.width + padding * 2 + shadowSize;
    canvas.height = currentImage.height + padding * 2 + shadowSize;
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(padding + shadowSize/2, padding + shadowSize/2, currentImage.width, currentImage.height);
    
    // Draw frame
    ctx.fillStyle = '#333';
    ctx.fillRect(padding, padding, currentImage.width, currentImage.height);
    
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
