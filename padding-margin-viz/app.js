const inputs = ['pt', 'pr', 'pb', 'pl', 'mt', 'mr', 'mb', 'ml'].map(id => document.getElementById(id));
const viz = document.getElementById('visualization');
const cssCode = document.getElementById('cssCode');

function update() {
    const [pt, pr, pb, pl, mt, mr, mb, ml] = inputs.map(i => parseInt(i.value) || 0);
    
    viz.innerHTML = `
        <div style="background: var(--color-accent); opacity: 0.6; padding: ${mt}px ${mr}px ${mb}px ${ml}px;">
            <span style="font-size: 0.8rem; color: var(--color-text);">MARGIN</span>
            <div style="background: var(--color-secondary); opacity: 0.8; padding: ${pt}px ${pr}px ${pb}px ${pl}px;">
                <span style="font-size: 0.8rem; color: var(--color-text);">PADDING</span>
                <div style="background: var(--color-primary); padding: 20px; color: var(--color-text);">CONTENT</div>
            </div>
        </div>
    `;
    
    cssCode.textContent = `.element {
  padding: ${pt}px ${pr}px ${pb}px ${pl}px;
  margin: ${mt}px ${mr}px ${mb}px ${ml}px;
}`;
}

inputs.forEach(input => input.addEventListener('input', update));
update();
