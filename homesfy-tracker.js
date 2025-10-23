/**
 * Homesfy Tracker - Add this to your microsite
 * This sends real data to your dashboard
 */

(function() {
    'use strict';
    
    console.log('🚀 Homesfy Tracker Initialized');
    
    // Configuration
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-HOMESFY001',
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'http://localhost:9000',
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

    // Real tracking data
    let trackingData = {
        visitors: 0,
        leads: 0,
        conversions: 0,
        pageViews: 0,
        formSubmissions: 0,
        buttonClicks: 0,
        scrollDepth: 0,
        timeOnPage: 0,
        startTime: Date.now(),
        pageViewTracked: false,
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
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
                referrer: document.referrer
            }
        };

        console.log('📊 Sending REAL data to dashboard:', eventType, data);

        // Method 1: Try to send to dashboard via fetch
        fetch('http://localhost:9000/api/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        }).then(response => {
            if (response.ok) {
                console.log('✅ Data sent to dashboard successfully');
            }
        }).catch(error => {
            console.log('Could not send to dashboard API:', error);
        });

        // Method 2: Store in localStorage for dashboard to pick up
        const existingData = JSON.parse(localStorage.getItem('homesfy_tracking') || '[]');
        existingData.push(message);
        if (existingData.length > 100) {
            existingData.splice(0, existingData.length - 100);
        }
        localStorage.setItem('homesfy_tracking', JSON.stringify(existingData));
        
        // Method 3: Store in global variable
        if (!window.homesfyTrackingData) {
            window.homesfyTrackingData = [];
        }
        window.homesfyTrackingData.push(message);
        
        // Method 4: Try to send to parent window (if in iframe)
        if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
        
        // Method 5: Try to send to opener window
        if (window.opener) {
            window.opener.postMessage(message, '*');
        }
    }

    // Track real page view
    function trackPageView() {
        // Only track page view once per session
        if (!trackingData.pageViewTracked) {
            trackingData.pageViews++;
            trackingData.visitors++;
            trackingData.pageViewTracked = true;
            
            console.log('👀 REAL page view tracked:', trackingData.visitors);
            
            sendToDashboard('pageView', {
                page: window.location.pathname,
                title: document.title,
                referrer: document.referrer
            });
        }
    }

    // Track real form submission
    function trackFormSubmission(form) {
        // Prevent duplicate form submissions
        const formKey = form.id || form.className || 'unknown';
        if (trackingData.submittedForms && trackingData.submittedForms.includes(formKey)) {
            console.log('📝 Form already submitted, skipping duplicate');
            return;
        }
        
        if (!trackingData.submittedForms) {
            trackingData.submittedForms = [];
        }
        trackingData.submittedForms.push(formKey);
        
        trackingData.formSubmissions++;
        trackingData.leads++;
        
        // Only update conversion rate when there's an actual form submission
        if (trackingData.visitors > 0) {
            trackingData.conversions = ((trackingData.leads / trackingData.visitors) * 100).toFixed(1);
        }
        
        console.log('📝 REAL form submission tracked:', trackingData.leads, 'Total leads:', trackingData.leads);
        
        sendToDashboard('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown',
            sessionId: trackingData.sessionId
        });
    }

    // Track real conversions
    function trackConversion(conversionData) {
        trackingData.leads++;
        
        // Only update conversion rate when there's an actual conversion
        if (trackingData.visitors > 0) {
            trackingData.conversions = ((trackingData.leads / trackingData.visitors) * 100).toFixed(1);
        }
        
        console.log('💰 REAL conversion tracked:', conversionData, 'Total leads:', trackingData.leads);
        
        sendToDashboard('conversion', {
            conversionType: conversionData.type || 'lead',
            value: conversionData.value || 0,
            goal: conversionData.goal || 'Lead Generation'
        });
    }

    // Initialize real tracking
    function initTracking() {
        console.log('🎯 Initializing REAL tracking...');
        
        // Track initial page view
        trackPageView();

        // Track form submissions - Only track when forms are actually submitted
        document.addEventListener('submit', function(e) {
            // Check if it's one of your specific forms
            if (e.target.id === 'ModalFormSlug4' || 
                e.target.id === 'ModalFormSlug1' || 
                e.target.id === 'ModalFormSlug2' ||
                e.target.classList.contains('popupModal-form')) {
                
                trackFormSubmission(e.target);
                
                // Don't prevent default - let the form submit normally
                console.log('📝 Form submitted:', e.target.id || e.target.className);
            }
        });

        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                // Check if it's a lead tracking button
                if (e.target.getAttribute('data-track-lead') === 'true') {
                    trackConversion({
                        type: 'lead',
                        value: 50,
                        goal: 'Lead Generation'
                    });
                }
                
                console.log('🖱️ REAL button click tracked:', e.target.textContent);
                sendToDashboard('buttonClick', {
                    elementId: e.target.id || 'unknown',
                    elementText: e.target.textContent || e.target.value || 'unknown',
                    elementType: e.target.tagName.toLowerCase(),
                    hasTrackLead: e.target.getAttribute('data-track-lead') === 'true'
                });
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                if (scrollPercent > trackingData.scrollDepth) {
                    trackingData.scrollDepth = scrollPercent;
                    
                    if (trackingData.scrollDepth % 25 === 0) {
                        console.log('📏 REAL scroll depth tracked:', trackingData.scrollDepth + '%');
                        sendToDashboard('scrollDepth', {
                            depth: trackingData.scrollDepth
                        });
                    }
                }
            }, 100);
        });

        // Track time on page
        window.addEventListener('beforeunload', function() {
            trackingData.timeOnPage = Math.round((Date.now() - trackingData.startTime) / 1000);
            sendToDashboard('timeOnPage', {
                seconds: trackingData.timeOnPage
            });
        });

        console.log('✅ REAL tracking initialized successfully!');
    }

    // Make functions globally available
    window.trackConversion = trackConversion;
    window.trackFormSubmission = trackFormSubmission;
    window.sendToDashboard = sendToDashboard;
    window.getTrackingData = function() {
        return trackingData;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Send periodic updates with REAL data every 10 seconds
    setInterval(function() {
        console.log('💓 Sending REAL heartbeat:', trackingData);
        
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
    }, 10000);

})();
