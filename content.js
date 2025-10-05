(function() {
    'use strict';
    
    // Configuration
    const config = {
        baseUrl: 'https://ihsoyct.github.io/',
        defaultLimit: 100,
        defaultSort: 'desc',
        defaultMode: 'submissions',
        defaultBackend: 'artic_shift'
    };
    
    // Get stored settings or use defaults
    async function getSettings() {
        const stored = await browser.storage.local.get(['limit', 'sort', 'mode', 'backend']);
        return {
            limit: stored.limit || config.defaultLimit,
            sort: stored.sort || config.defaultSort,
            mode: stored.mode || config.defaultMode,
            backend: stored.backend || config.defaultBackend
        };
    }
    
    // Create the redirect URL
    function createRedirectUrl(username, settings) {
        const params = new URLSearchParams({
            backend: settings.backend,
            mode: settings.mode,
            author: username,
            limit: settings.limit,
            sort: settings.sort
        });
        
        return `${config.baseUrl}?${params.toString()}`;
    }
    
    // Check if element is a Reddit username link
    function isUsernameLink(element) {
        if (element.tagName !== 'A') return false;
        
        // Check for various Reddit username link patterns
        const href = element.getAttribute('href') || '';
        const usernamePatterns = [
            /^\/user\/[^\/]+\/?$/,
            /^\/u\/[^\/]+\/?$/,
            /^\/user\/[^\/]+\/posts\/?$/,
            /^\/user\/[^\/]+\/comments\/?$/,
            /^https:\/\/www\.reddit\.com\/user\/[^\/]+\/?$/,
            /^https:\/\/www\.reddit\.com\/u\/[^\/]+\/?$/
        ];
        
        return usernamePatterns.some(pattern => pattern.test(href));
    }
    
    // Extract username from href
    function extractUsername(href) {
        const match = href.match(/\/(?:u|user)\/([^\/]+)/);
        return match ? match[1] : null;
    }
    
    // Main function to handle username clicks
    async function handleUsernameClick(event) {
        const target = event.target.closest('a');
        if (!target || !isUsernameLink(target)) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const href = target.getAttribute('href');
        const username = extractUsername(href);
        
        if (username) {
            const settings = await getSettings();
            const redirectUrl = createRedirectUrl(username, settings);
            
            // Open in new tab
            window.open(redirectUrl, '_blank');
        }
    }
    
    // Add click event listener
    document.addEventListener('click', handleUsernameClick, true);
    
    // Observe DOM changes for dynamically loaded content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Re-attach event listeners if needed
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Reddit User Search Redirect extension loaded');
})();