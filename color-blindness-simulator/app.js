const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('controls');

let originalImage = null;
let currentFilter = 'normal';

// Color blindness simulation matrices
const colorBlindnessMatrices = {
    normal: [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ],
    protanopia: [ // Red-blind
        0.567, 0.433, 0,
        0.558, 0.442, 0,
        0, 0.242, 0.758
    ],
    deuteranopia: [ // Green-blind
        0.625, 0.375, 0,
        0.7, 0.3, 0,
        0, 0.3, 0.7
    ],
    tritanopia: [ // Blue-blind
        0.95, 0.05, 0,
        0, 0.433, 0.567,
        0, 0.475, 0.525
    ],
    protanomaly: [ // Red-weak
        0.817, 0.183, 0,
        0.333, 0.667, 0,
        0, 0.125, 0.875
    ],
    deuteranomaly: [ // Green-weak
        0.8, 0.2, 0,
        0.258, 0.742, 0,
        0, 0.142, 0.858
    ],
    tritanomaly: [ // Blue-weak
        0.967, 0.033, 0,
        0, 0.733, 0.267,
        0, 0.183, 0.817
    ],
    achromatopsia: [ // Complete color blindness
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114
    ],
    achromatomaly: [ // Partial color blindness
        0.618, 0.320, 0.062,
        0.163, 0.775, 0.062,
        0.163, 0.320, 0.516
    ]
};

// Upload zone events
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// Load and display image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            canvas.width = img.width;
            canvas.height = img.height;
            controls.classList.add('visible');
            applyFilter();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Apply color blindness filter
function applyFilter() {
    if (!originalImage) return;
    
    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const matrix = colorBlindnessMatrices[currentFilter];
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = matrix[0] * r + matrix[1] * g + matrix[2] * b;
        data[i + 1] = matrix[3] * r + matrix[4] * g + matrix[5] * b;
        data[i + 2] = matrix[6] * r + matrix[7] * g + matrix[8] * b;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Filter button events
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        applyFilter();
    });
});

// Download simulated image
function downloadImage() {
    const link = document.createElement('a');
    link.download = `colorblind-${currentFilter}.png`;
    link.href = canvas.toDataURL();
    link.click();
}
