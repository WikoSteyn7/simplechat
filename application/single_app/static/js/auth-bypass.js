// auth-bypass.js
// Handle authentication bypass for frontend functionality

(function() {
    'use strict';
    
    // Check if authentication is disabled
    const authDisabled = document.body.dataset.authDisabled === 'true';
    
    if (authDisabled) {
        console.log('Authentication disabled - enabling bypass mode');
        
        // Override fetch to handle authentication bypass
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            return originalFetch(url, options)
                .catch(error => {
                    // If API calls fail due to auth, provide fallback responses
                    if (url.includes('/api/user/settings')) {
                        console.log('Providing fallback user settings for auth bypass');
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({
                                settings: {
                                    navLayout: 'top',
                                    profileImage: null,
                                    theme: 'light'
                                }
                            })
                        });
                    }
                    
                    if (url.includes('/api/profile/image/refresh')) {
                        console.log('Providing fallback profile image refresh for auth bypass');
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({
                                success: false,
                                error: 'Authentication disabled'
                            })
                        });
                    }
                    
                    // Re-throw other errors
                    throw error;
                });
        };
        
        // Override jQuery AJAX for legacy code
        if (window.$ && $.ajaxSetup) {
            $(document).ajaxError(function(event, xhr, settings) {
                // Handle failed user settings requests
                if (settings.url && settings.url.includes('/api/user/settings')) {
                    console.log('Handling failed user settings request in auth bypass mode');
                    
                    // Trigger success callback with default settings
                    if (settings.success) {
                        settings.success({
                            settings: {
                                navLayout: 'top',
                                profileImage: null,
                                theme: 'light',
                                publicDirectorySettings: {}
                            }
                        });
                    }
                }
            });
        }
        
        // Set a flag for other scripts to check
        window.SIMPLECHAT_AUTH_DISABLED = true;
    }
})();

