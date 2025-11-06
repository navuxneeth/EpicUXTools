const baseFontSize = document.getElementById('baseFontSize');
const inputValue = document.getElementById('inputValue');
const fromUnit = document.getElementById('fromUnit');
const results = document.getElementById('results');

function convert() {
    const base = parseFloat(baseFontSize.value) || 16;
    const value = parseFloat(inputValue.value) || 0;
    const unit = fromUnit.value;
    
    let px = value;
    if (unit === 'rem') px = value * base;
    else if (unit === 'em') px = value * base;
    else if (unit === '%') px = (value / 100) * base;
    else if (unit === 'pt') px = value * 1.333333;
    else if (unit === 'vh') px = (value / 100) * window.innerHeight;
    else if (unit === 'vw') px = (value / 100) * window.innerWidth;
    
    const conversions = {
        px: px.toFixed(2),
        rem: (px / base).toFixed(4),
        em: (px / base).toFixed(4),
        '%': ((px / base) * 100).toFixed(2),
        pt: (px / 1.333333).toFixed(2),
        vh: ((px / window.innerHeight) * 100).toFixed(4),
        vw: ((px / window.innerWidth) * 100).toFixed(4)
    };
    
    results.innerHTML = Object.entries(conversions).map(([unit, val]) => 
        `<div style="border: 2px dashed var(--color-border); padding: var(--space-md); margin-bottom: var(--space-sm); background: var(--color-input-bg);">
            <strong style="color: var(--color-primary);">${unit}:</strong> ${val}
        </div>`
    ).join('');
}

baseFontSize.addEventListener('input', convert);
inputValue.addEventListener('input', convert);
fromUnit.addEventListener('change', convert);

convert();
