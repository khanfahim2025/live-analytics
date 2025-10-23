/**
 * Universal Microsite Tracker - Auto-Detection Version
 * Just change the GTM ID and site details below
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire script
 * 2. Change ONLY the 4 configuration lines below
 * 3. Paste in your microsite's <head> section
 * 4. Done! Your microsite will automatically appear in the dashboard
 */

<script>
/**
 * Universal Microsite Tracker - Works for ALL 60-70 microsites
 * Just change the GTM ID and site details below
 */
(function() {
    'use strict';
    
    // 🔧 CONFIGURATION - CHANGE ONLY THESE 4 LINES FOR EACH SITE
    const SITE_CONFIG = {
        gtmId: 'GTM-XXXXXXX', // ← Change this to your GTM ID
        siteName: 'Your Site Name', // ← Change this to your site name
        siteUrl: 'https://your-site.com', // ← Change this to your site URL
        dashboardUrl: 'https://web-production-beea8.up.railway.app' // ← Keep this same for all sites
    };
    
    console.log('🚀 Universal Tracker loaded for:', SITE_CONFIG.siteName);
    
    // Session tracking
    let sessionData = {
        pageViewTracked: false,
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        submittedForms: [],
        isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk/i.test(navigator.userAgent),
        deviceType: /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(navigator.userAgent) ? 'tablet' : 
                   /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    
    // Send data to server
    function sendEvent(eventType, data) {
        const message = {
            event: 'gtm.' + eventType,
            gtmId: SITE_CONFIG.gtmId,
            siteName: SITE_CONFIG.siteName,
            siteUrl: SITE_CONFIG.siteUrl,
            data: {
                ...data,
                timestamp: Date.now(),
                url: window.location.href,
                referrer: document.referrer,
                sessionId: sessionData.sessionId,
                isMobile: sessionData.isMobile,
                deviceType: sessionData.deviceType,
                userAgent: navigator.userAgent
            }
        };
        
        fetch(SITE_CONFIG.dashboardUrl + '/api/receive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        }).catch(() => {
            // Retry once
            setTimeout(() => {
                fetch(SITE_CONFIG.dashboardUrl + '/api/receive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });
            }, 1000);
        });
    }
    
    // Track page view (once per session)
    function trackPageView() {
        if (!sessionData.pageViewTracked) {
            sessionData.pageViewTracked = true;
            sendEvent('pageView', {
                page: window.location.pathname,
                title: document.title
            });
        }
    }
    
    // Track form submission (prevent duplicates)
    function trackFormSubmission(form) {
        const formKey = form.id || form.className || 'unknown';
        if (sessionData.submittedForms.includes(formKey)) return;
        
        sessionData.submittedForms.push(formKey);
        sendEvent('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown',
            isFormSubmission: true
        });
    }
    
    // Initialize tracking
    function initTracking() {
        trackPageView();
        
        // Track form submissions
        document.addEventListener('submit', function(e) {
            trackFormSubmission(e.target);
        });
        
        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                sendEvent('buttonClick', {
                    elementId: e.target.id || 'unknown',
                    elementText: e.target.textContent || e.target.value || 'unknown'
                });
            }
        });
        
        // Send heartbeat every 10 seconds
        setInterval(() => {
            sendEvent('heartbeat', {
                timeOnPage: Math.round((Date.now() - sessionData.startTime) / 1000)
            });
        }, 10000);
    }
    
    // Start tracking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }
    
})();
</script>
