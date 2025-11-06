const inputs = ['pt', 'pr', 'pb', 'pl', 'mt', 'mr', 'mb', 'ml'].map(id => document.getElementById(id));
const viz = document.getElementById('visualization');
const cssCode = document.getElementById('cssCode');

function update() {
    const [pt, pr, pb, pl, mt, mr, mb, ml] = inputs.map(i => parseInt(i.value) || 0);
    
    viz.innerHTML = `
        <div style="background: #ff6b6b; padding: ${mt}px ${mr}px ${mb}px ${ml}px;">
            <span style="font-size: 0.8rem; color: white;">MARGIN</span>
            <div style="background: #4ecdc4; padding: ${pt}px ${pr}px ${pb}px ${pl}px;">
                <span style="font-size: 0.8rem; color: white;">PADDING</span>
                <div style="background: #45b7d1; padding: 20px; color: white;">CONTENT</div>
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
