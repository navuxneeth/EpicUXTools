let items = [];
const title = document.getElementById('title');
const newItem = document.getElementById('newItem');
const itemsDiv = document.getElementById('items');

newItem.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && newItem.value.trim()) {
        items.push(newItem.value.trim());
        newItem.value = '';
        renderItems();
    }
});

function renderItems() {
    itemsDiv.innerHTML = items.map((item, i) => `
        <div style="border: 2px dashed var(--color-border); padding: var(--space-sm); margin-bottom: var(--space-xs); background: var(--color-input-bg); display: flex; justify-content: space-between; align-items: center;">
            <span>☐ ${item}</span>
            <button onclick="removeItem(${i})" style="padding: 4px 8px; background: var(--color-accent); color: white; border: none; cursor: pointer;">✖</button>
        </div>
    `).join('');
}

function removeItem(index) {
    items.splice(index, 1);
    renderItems();
}

function printChecklist() {
    const printWindow = document.createElement('iframe');
    printWindow.style.display = 'none';
    document.body.appendChild(printWindow);
    
    const content = `
        <!DOCTYPE html>
        <html><head><style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
            .item { padding: 10px; border-bottom: 1px solid #ddd; }
        </style></head><body>
        <h1>${title.value || 'Checklist'}</h1>
        ${items.map(item => `<div class="item">☐ ${item}</div>`).join('')}
        </body></html>
    `;
    
    printWindow.contentDocument.write(content);
    printWindow.contentDocument.close();
    printWindow.contentWindow.print();
    
    setTimeout(() => document.body.removeChild(printWindow), 1000);
}
