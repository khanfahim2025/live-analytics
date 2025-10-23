/**
 * Real-time Tracking Script for Homesfy Test Website
 * Add this script to your microsite to send live data to the dashboard
 */

(function() {
    'use strict';
    
    // Configuration - UPDATE THESE VALUES
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-XXXXXXX', // Replace with your actual GTM Container ID
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'http://localhost:9000', // Your dashboard URL
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

    // Tracking data
    let trackingData = {
        visitors: 0,
        leads: 0,
        conversions: 0,
        pageViews: 0,
        formSubmissions: 0,
        buttonClicks: 0,
        scrollDepth: 0,
        timeOnPage: 0,
        startTime: Date.now()
    };

    // Send data to dashboard
    function sendToDashboard(eventType, data) {
        const message = {
            event: 'gtm.' + eventType,
            gtmId: DASHBOARD_CONFIG.gtmId,
            siteName: DASHBOARD_CONFIG.siteName,
            siteUrl: DASHBOARD_CONFIG.siteUrl,
            data: {
                ...data,
                timestamp: Date.now(),
                url: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent
            }
        };

        // Send to parent window (if in iframe)
        if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
        
        // Send to dashboard via fetch
        fetch(DASHBOARD_CONFIG.dashboardUrl + '/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        }).catch(error => {
            console.log('Dashboard not available:', error);
        });

        // Store locally for offline tracking
        storeTrackingData(message);
    }

    // Store tracking data locally
    function storeTrackingData(data) {
        const existingData = JSON.parse(localStorage.getItem('homesfy_tracking') || '[]');
        existingData.push(data);
        
        // Keep only last 100 entries
        if (existingData.length > 100) {
            existingData.splice(0, existingData.length - 100);
        }
        
        localStorage.setItem('homesfy_tracking', JSON.stringify(existingData));
    }

    // Track page view
    function trackPageView() {
        trackingData.pageViews++;
        trackingData.visitors++;
        
        sendToDashboard('pageView', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now()
        });
    }

    // Track form submission
    function trackFormSubmission(form) {
        trackingData.formSubmissions++;
        trackingData.leads++;
        trackingData.conversions = ((trackingData.leads / trackingData.visitors) * 100).toFixed(1);
        
        sendToDashboard('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown',
            formAction: form.action || 'unknown',
            formMethod: form.method || 'unknown',
            formData: new FormData(form)
        });
    }

    // Track button clicks
    function trackButtonClick(element) {
        trackingData.buttonClicks++;
        
        sendToDashboard('buttonClick', {
            elementId: element.id || 'unknown',
            elementClass: element.className || 'unknown',
            elementText: element.textContent || element.value || 'unknown',
            elementType: element.tagName.toLowerCase(),
            elementHref: element.href || null
        });
    }

    // Track scroll depth
    function trackScrollDepth() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > trackingData.scrollDepth) {
            trackingData.scrollDepth = scrollPercent;
            
            if (trackingData.scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                sendToDashboard('scrollDepth', {
                    depth: trackingData.scrollDepth
                });
            }
        }
    }

    // Track time on page
    function trackTimeOnPage() {
        trackingData.timeOnPage = Math.round((Date.now() - trackingData.startTime) / 1000);
        
        sendToDashboard('timeOnPage', {
            seconds: trackingData.timeOnPage
        });
    }

    // Track conversions
    function trackConversion(conversionData) {
        trackingData.conversions++;
        trackingData.leads++;
        
        sendToDashboard('conversion', {
            conversionType: conversionData.type || 'lead',
            value: conversionData.value || 0,
            currency: conversionData.currency || 'USD',
            goal: conversionData.goal || 'Lead Generation'
        });
    }

    // Initialize tracking
    function initTracking() {
        // Track initial page view
        trackPageView();

        // Track form submissions
        document.addEventListener('submit', function(e) {
            trackFormSubmission(e.target);
        });

        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                trackButtonClick(e.target);
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScrollDepth, 100);
        });

        // Track time on page before unload
        window.addEventListener('beforeunload', function() {
            trackTimeOnPage();
        });

        // Track window focus/blur
        window.addEventListener('focus', function() {
            sendToDashboard('windowFocus', { action: 'focus' });
        });

        window.addEventListener('blur', function() {
            sendToDashboard('windowBlur', { action: 'blur' });
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                sendToDashboard('pageHidden', { action: 'hidden' });
            } else {
                sendToDashboard('pageVisible', { action: 'visible' });
            }
        });
    }

    // Make functions globally available
    window.trackConversion = trackConversion;
    window.trackFormSubmission = trackFormSubmission;
    window.trackButtonClick = trackButtonClick;
    window.sendToDashboard = sendToDashboard;

    // Get current tracking data
    window.getTrackingData = function() {
        return trackingData;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Send periodic updates
    setInterval(function() {
        sendToDashboard('heartbeat', {
            visitors: trackingData.visitors,
            leads: trackingData.leads,
            conversions: trackingData.conversions,
            pageViews: trackingData.pageViews,
            formSubmissions: trackingData.formSubmissions,
            buttonClicks: trackingData.buttonClicks,
            scrollDepth: trackingData.scrollDepth,
            timeOnPage: trackingData.timeOnPage
        });
    }, 30000); // Send every 30 seconds

})();
