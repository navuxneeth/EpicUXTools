const hexInput = document.getElementById('hexInput');
const colorPicker = document.getElementById('colorPicker');
const results = document.getElementById('results');
const preview = document.getElementById('preview');

function convert() {
    let hex = hexInput.value.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return;
    
    const hsl = rgbToHsl(r, g, b);
    
    results.innerHTML = `
        <div style="border: 2px dashed var(--color-border); padding: var(--space-md); margin-bottom: var(--space-sm); background: var(--color-input-bg);">
            <strong style="color: var(--color-primary);">RGB:</strong> rgb(${r}, ${g}, ${b})
        </div>
        <div style="border: 2px dashed var(--color-border); padding: var(--space-md); margin-bottom: var(--space-sm); background: var(--color-input-bg);">
            <strong style="color: var(--color-primary);">RGBA:</strong> rgba(${r}, ${g}, ${b}, 1)
        </div>
        <div style="border: 2px dashed var(--color-border); padding: var(--space-md); margin-bottom: var(--space-sm); background: var(--color-input-bg);">
            <strong style="color: var(--color-primary);">HSL:</strong> hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)
        </div>
    `;
    
    preview.style.background = `#${hex}`;
    colorPicker.value = `#${hex}`;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

hexInput.addEventListener('input', convert);
colorPicker.addEventListener('input', (e) => {
    hexInput.value = e.target.value;
    convert();
});

convert();
