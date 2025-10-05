document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    browser.storage.local.get(['limit', 'sort', 'mode', 'backend']).then((result) => {
        document.getElementById('limit').value = result.limit || 100;
        document.getElementById('sort').value = result.sort || 'desc';
        document.getElementById('mode').value = result.mode || 'submissions';
        document.getElementById('backend').value = result.backend || 'artic_shift';
    });
    
    // Save settings
    document.getElementById('save').addEventListener('click', function() {
        const settings = {
            limit: parseInt(document.getElementById('limit').value),
            sort: document.getElementById('sort').value,
            mode: document.getElementById('mode').value,
            backend: document.getElementById('backend').value
        };
        
        browser.storage.local.set(settings).then(() => {
            const status = document.getElementById('status');
            status.textContent = 'Settings saved successfully!';
            status.className = 'status success';
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 2000);
        });
    });
});