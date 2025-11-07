const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const quality = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const results = document.getElementById('results');

let compressedImages = [];

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.background = 'var(--color-accent)';
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.background = 'var(--color-panel-bg)';
});
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.background = 'var(--color-panel-bg)';
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
quality.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
    if (compressedImages.length > 0) {
        processImages(Array.from(fileInput.files));
    }
});

function handleFiles(files) {
    if (files.length > 0) {
        controls.style.display = 'block';
        processImages(Array.from(files));
    }
}

function processImages(files) {
    compressedImages = [];
    results.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const originalSize = file.size;
                    const newSize = blob.size;
                    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
                    
                    compressedImages.push({ blob, name: file.name });
                    
                    const resultDiv = document.createElement('div');
                    resultDiv.style.cssText = 'border: 2px dashed var(--color-border); padding: var(--space-md); margin-bottom: var(--space-sm); background: var(--color-input-bg);';
                    
                    // Create elements safely to avoid XSS
                    const nameStrong = document.createElement('strong');
                    nameStrong.style.color = 'var(--color-primary)';
                    nameStrong.textContent = file.name;
                    
                    const statsText = document.createTextNode(`Original: ${(originalSize / 1024).toFixed(1)} KB → Compressed: ${(newSize / 1024).toFixed(1)} KB`);
                    
                    const savingsSpan = document.createElement('span');
                    savingsSpan.style.color = 'var(--color-accent)';
                    savingsSpan.textContent = `Saved: ${savings}%`;
                    
                    resultDiv.appendChild(nameStrong);
                    resultDiv.appendChild(document.createElement('br'));
                    resultDiv.appendChild(statsText);
                    resultDiv.appendChild(document.createElement('br'));
                    resultDiv.appendChild(savingsSpan);
                    
                    results.appendChild(resultDiv);
                }, 'image/jpeg', quality.value / 100);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function downloadAll() {
    compressedImages.forEach(({ blob, name }) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `compressed-${name}`;
        link.click();
    });
}
