// Theme switching functionality
(function() {
    // Get saved theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme on page load
    if (savedTheme === 'light') {
        document.documentElement.classList.add('theme-light');
    }
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Create theme toggle button if it doesn't exist
        if (!document.getElementById('themeToggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'themeToggle';
            toggleBtn.className = 'theme-toggle';
            toggleBtn.innerHTML = savedTheme === 'light' ? '[DARK MODE]' : '[LIGHT MODE]';
            document.body.appendChild(toggleBtn);
            
            // Add click event listener
            toggleBtn.addEventListener('click', toggleTheme);
        }
    });
    
    function toggleTheme() {
        const html = document.documentElement;
        const toggleBtn = document.getElementById('themeToggle');
        
        if (html.classList.contains('theme-light')) {
            // Switch to dark mode
            html.classList.remove('theme-light');
            localStorage.setItem('theme', 'dark');
            toggleBtn.innerHTML = '[LIGHT MODE]';
        } else {
            // Switch to light mode
            html.classList.add('theme-light');
            localStorage.setItem('theme', 'light');
            toggleBtn.innerHTML = '[DARK MODE]';
        }
    }
})();
