const sizes = [
    {name: 'Favicon', sizes: ['16x16', '32x32', '48x48']},
    {name: 'iOS Icons', sizes: ['180x180', '167x167', '152x152', '120x120']},
    {name: 'Android Icons', sizes: ['192x192', '144x144', '96x96', '72x72', '48x48']},
    {name: 'Web Icons', sizes: ['512x512', '256x256', '128x128', '64x64', '32x32', '16x16']},
    {name: 'Social Media', sizes: ['1200x1200', '800x800', '512x512']}
];

const container = document.getElementById('sizes');
container.innerHTML = sizes.map(category => `
    <div style="border: 2px dashed var(--color-border); padding: var(--space-md); background: var(--color-panel-bg);">
        <h3 style="color: var(--color-primary); margin-bottom: var(--space-sm);">${category.name}</h3>
        ${category.sizes.map(size => `
            <div style="padding: var(--space-xs); margin-bottom: var(--space-xs); background: var(--color-input-bg); border: 1px solid var(--color-border);">
                ${size}
            </div>
        `).join('')}
    </div>
`).join('');
