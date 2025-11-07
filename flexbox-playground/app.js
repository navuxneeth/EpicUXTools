const preview = document.getElementById('preview');
const cssOutput = document.getElementById('cssOutput');
const controls = {
    flexDirection: document.getElementById('flexDirection'),
    justifyContent: document.getElementById('justifyContent'),
    alignItems: document.getElementById('alignItems'),
    flexWrap: document.getElementById('flexWrap'),
    gap: document.getElementById('gap')
};

const items = Array.from({length: 5}, (_, i) => `<div style="background: #6AB0A2; padding: 20px; color: white; border: 2px solid white; min-width: 60px; text-align: center;">ITEM ${i + 1}</div>`);

function update() {
    preview.style.flexDirection = controls.flexDirection.value;
    preview.style.justifyContent = controls.justifyContent.value;
    preview.style.alignItems = controls.alignItems.value;
    preview.style.flexWrap = controls.flexWrap.value;
    preview.style.gap = controls.gap.value + 'px';
    
    preview.innerHTML = items.join('');
    
    cssOutput.textContent = `.container {
  display: flex;
  flex-direction: ${controls.flexDirection.value};
  justify-content: ${controls.justifyContent.value};
  align-items: ${controls.alignItems.value};
  flex-wrap: ${controls.flexWrap.value};
  gap: ${controls.gap.value}px;
}`;
}

Object.values(controls).forEach(control => control.addEventListener('change', update));
controls.gap.addEventListener('input', update);
update();
