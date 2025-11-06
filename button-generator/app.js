const preview = document.getElementById('preview');
const cssCode = document.getElementById('cssCode');
const btnText = document.getElementById('btnText');
const bgColor = document.getElementById('bgColor');
const textColor = document.getElementById('textColor');
const borderRadius = document.getElementById('borderRadius');
const padding = document.getElementById('padding');
const fontSize = document.getElementById('fontSize');
const radiusVal = document.getElementById('radiusVal');
const paddingVal = document.getElementById('paddingVal');
const fontSizeVal = document.getElementById('fontSizeVal');

function update() {
    const styles = {
        backgroundColor: bgColor.value,
        color: textColor.value,
        borderRadius: borderRadius.value + 'px',
        padding: `${padding.value}px ${padding.value * 2}px`,
        fontSize: fontSize.value + 'px'
    };
    
    Object.assign(preview.style, styles);
    preview.textContent = btnText.value;
    
    radiusVal.textContent = borderRadius.value;
    paddingVal.textContent = padding.value;
    fontSizeVal.textContent = fontSize.value;
    
    cssCode.textContent = `.button {
  background-color: ${bgColor.value};
  color: ${textColor.value};
  border-radius: ${borderRadius.value}px;
  padding: ${padding.value}px ${padding.value * 2}px;
  font-size: ${fontSize.value}px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.3s;
}

.button:hover {
  opacity: 0.9;
}`;
}

[btnText, bgColor, textColor, borderRadius, padding, fontSize].forEach(el => {
    el.addEventListener('input', update);
});

function copyCSS() {
    navigator.clipboard.writeText(cssCode.textContent);
    alert('CSS copied to clipboard!');
}

update();
