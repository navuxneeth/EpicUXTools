// Get elements
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const ratioDisplay = document.getElementById('ratio');
const decimalDisplay = document.getElementById('decimal');
const percentageDisplay = document.getElementById('percentage');
const newWidthInput = document.getElementById('newWidth');
const newHeightInput = document.getElementById('newHeight');
const previewBox = document.getElementById('previewBox');
const previewText = document.getElementById('previewText');

let isUpdating = false;

// Calculate GCD for simplifying ratios
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Calculate and display results
function calculate() {
    if (isUpdating) return;
    
    const width = parseInt(widthInput.value) || 1;
    const height = parseInt(heightInput.value) || 1;
    
    // Calculate aspect ratio
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;
    
    // Calculate decimal
    const decimal = (width / height).toFixed(3);
    
    // Calculate percentage (height as percentage of width)
    const percentage = ((height / width) * 100).toFixed(2);
    
    // Update displays
    ratioDisplay.textContent = `${ratioW}:${ratioH}`;
    decimalDisplay.textContent = decimal;
    percentageDisplay.textContent = `${percentage}%`;
    
    // Update preview
    updatePreview(ratioW, ratioH);
}

// Update visual preview
function updatePreview(w, h) {
    const maxSize = 300;
    let displayW, displayH;
    
    if (w > h) {
        displayW = maxSize;
        displayH = (maxSize * h) / w;
    } else {
        displayH = maxSize;
        displayW = (maxSize * w) / h;
    }
    
    previewBox.style.width = `${displayW}px`;
    previewBox.style.height = `${displayH}px`;
    previewText.textContent = `${w}:${h}`;
}

// Set preset ratio
function setRatio(w, h) {
    const currentWidth = parseInt(widthInput.value) || 1920;
    
    widthInput.value = currentWidth;
    heightInput.value = Math.round((currentWidth * h) / w);
    
    calculate();
}

// Handle resize calculator
newWidthInput.addEventListener('input', function() {
    if (this.value && !isUpdating) {
        isUpdating = true;
        const originalWidth = parseInt(widthInput.value) || 1;
        const originalHeight = parseInt(heightInput.value) || 1;
        const ratio = originalHeight / originalWidth;
        
        const newW = parseInt(this.value);
        newHeightInput.value = Math.round(newW * ratio);
        isUpdating = false;
    }
});

newHeightInput.addEventListener('input', function() {
    if (this.value && !isUpdating) {
        isUpdating = true;
        const originalWidth = parseInt(widthInput.value) || 1;
        const originalHeight = parseInt(heightInput.value) || 1;
        const ratio = originalWidth / originalHeight;
        
        const newH = parseInt(this.value);
        newWidthInput.value = Math.round(newH * ratio);
        isUpdating = false;
    }
});

// Event listeners
widthInput.addEventListener('input', calculate);
heightInput.addEventListener('input', calculate);

// Initialize
calculate();
