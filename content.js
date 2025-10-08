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
        
        const href = element.getAttribute('href') || '';
        const usernamePatterns = [
            // New Reddit patterns
            /^\/user\/[^\/]+\/?$/,
            /^\/u\/[^\/]+\/?$/,
            /^\/user\/[^\/]+\/(?:posts|comments)\/?$/,
            /^https:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/[^\/]+\/?$/,
            
            // Old Reddit patterns
            /^https:\/\/old\.reddit\.com\/(?:u|user)\/[^\/]+\/?$/,
            /^\/u\/[^\/]+\/?$/i,
            
            // Relative paths (common in old Reddit)
            /^\/user\/[^\/]+\/?$/i
        ];
        
        return usernamePatterns.some(pattern => pattern.test(href));
    }
    
    // Extract username from href
    function extractUsername(href) {
        // Handle both absolute and relative URLs
        const url = href.startsWith('http') ? href : 'https://reddit.com' + href;
        
        try {
            const urlObj = new URL(url, 'https://reddit.com');
            const pathParts = urlObj.pathname.split('/').filter(function(part) {
                return part.length > 0;
            });
            
            // Look for 'user' or 'u' in the path and get the next part
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'user' || pathParts[i] === 'u') {
                    if (i + 1 < pathParts.length) {
                        return pathParts[i + 1];
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing URL:', e);
        }
        
        return null;
    }
    
    // Main function to handle username clicks
    async function handleUsernameClick(event) {
        try {
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
        } catch (error) {
            console.error('Error handling username click:', error);
        }
    }
    
    // Add click event listener
    document.addEventListener('click', handleUsernameClick, true);
    
    // Observe DOM changes for dynamically loaded content (common in new Reddit)
    const observer = new MutationObserver(function(mutations) {
        let shouldReattach = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if this looks like content that might contain username links
                        if (node.querySelector && node.querySelector('a[href*="/user/"], a[href*="/u/"]')) {
                            shouldReattach = true;
                        }
                    }
                });
            }
        });
        
        if (shouldReattach) {
            // Re-initialize event listeners if needed
            console.log('New content detected, extension should work automatically');
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
    
    console.log('Reddit User Search Redirect extension loaded');
    console.log('Current domain:', window.location.hostname);
    console.log('Extension configured for both old and new Reddit');
})();