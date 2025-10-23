/**
 * FIXED Homesfy Tracker - Mobile Compatible & Accurate Counting
 * This script properly tracks visitors and leads with mobile support
 */

(function() {
    'use strict';
    
    console.log('🚀 Homesfy FIXED Tracker Initialized');
    
    // Configuration
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-5PHH5D6T',
        siteName: 'Homesfy Test Website',
        dashboardUrl: 'http://10.74.28.74:9000', // Use your laptop's IP address
        siteUrl: 'https://www.homesfytestwebsite.com'
    };

    // Session tracking data - NO TOTALS, only session state
    let sessionData = {
        scrollDepth: 0,
        timeOnPage: 0,
        startTime: Date.now(),
        pageViewTracked: false,
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        submittedForms: [], // Prevent duplicate submits in same session
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    // Enhanced send function with mobile support
    function sendEvent(eventType, data) {
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
                sessionId: sessionData.sessionId,
                isMobile: sessionData.isMobile,
                userAgent: navigator.userAgent
            }
        };

        console.log('📊 Sending event to server:', eventType, data);

        // Send to server API with retry logic for mobile
        fetch('http://localhost:9000/api/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        }).then(response => {
            if (response.ok) {
                console.log('✅ Event sent to server successfully');
            } else {
                console.log('⚠️ Server response not OK:', response.status);
            }
        }).catch(error => {
            console.log('❌ Could not send to server:', error);
            // Retry once for mobile networks
            setTimeout(() => {
                fetch('http://localhost:9000/api/receive', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message)
                }).catch(retryError => {
                    console.log('❌ Retry also failed:', retryError);
                });
            }, 1000);
        });
    }

    // Track page view - ONLY ONCE PER SESSION
    function trackPageView() {
        if (!sessionData.pageViewTracked) {
            sessionData.pageViewTracked = true;
            
            console.log('👀 Page view event sent to server (Mobile:', sessionData.isMobile + ')');
            
            sendEvent('pageView', {
                page: window.location.pathname,
                title: document.title,
                referrer: document.referrer,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        }
    }

        // Track form submission - PREVENT DUPLICATES
        function trackFormSubmission(form) {
            const formKey = form.id || form.className || 'unknown';
            
            // Check if form already submitted in this session
            if (sessionData.submittedForms.includes(formKey)) {
                console.log('📝 Form already submitted in this session, skipping');
                return;
            }
            
            // Mark form as submitted in this session
            sessionData.submittedForms.push(formKey);
            
            console.log('📝 Form submission event sent to server');
            
            sendEvent('formSubmit', {
                formId: form.id || 'unknown',
                formClass: form.className || 'unknown',
                formType: form.getAttribute('data-tracking-id') || 'unknown',
                isFormSubmission: true // Flag to identify this as form submission
            });
        }

    // Track button clicks
    function trackButtonClick(element) {
        console.log('🖱️ Button click event sent to server:', element.textContent);
        
        sendEvent('buttonClick', {
            elementId: element.id || 'unknown',
            elementText: element.textContent || element.value || 'unknown',
            elementType: element.tagName.toLowerCase(),
            hasTrackLead: element.getAttribute('data-track-lead') === 'true'
        });
    }

    // Track conversions - ONLY for specific conversion events
    function trackConversion(conversionData) {
        console.log('💰 Conversion event sent to server');
        
        sendEvent('conversion', {
            conversionType: conversionData.type || 'lead',
            value: conversionData.value || 0,
            goal: conversionData.goal || 'Lead Generation'
        });
    }

    // Initialize tracking
    function initTracking() {
        console.log('🎯 Initializing FIXED tracking...');
        
        // Track initial page view
        trackPageView();

        // Track form submissions - FIXED: Only track actual form submissions
        document.addEventListener('submit', function(e) {
            if (e.target.id === 'ModalFormSlug4' || 
                e.target.id === 'ModalFormSlug1' || 
                e.target.id === 'ModalFormSlug2' ||
                e.target.classList.contains('popupModal-form')) {
                
                trackFormSubmission(e.target);
                console.log('📝 Form submitted:', e.target.id || e.target.className);
            }
        });

        // Track button clicks - FIXED: Don't auto-trigger conversions
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                trackButtonClick(e.target);
                
                // Only track conversion if explicitly marked AND not inside a form
                // This prevents double counting when form is submitted
                if (e.target.getAttribute('data-track-lead') === 'true' && 
                    !e.target.closest('form')) {
                    trackConversion({
                        type: 'lead',
                        value: 50,
                        goal: 'Lead Generation'
                    });
                }
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                if (scrollPercent > sessionData.scrollDepth) {
                    sessionData.scrollDepth = scrollPercent;
                    
                    if (sessionData.scrollDepth % 25 === 0) {
                        console.log('📏 Scroll depth event sent to server:', sessionData.scrollDepth + '%');
                        sendEvent('scrollDepth', {
                            depth: sessionData.scrollDepth
                        });
                    }
                }
            }, 100);
        });

        // Track session end
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Math.round((Date.now() - sessionData.startTime) / 1000);
            sendEvent('sessionEnd', {
                seconds: timeOnPage
            });
        });

        // Mobile-specific optimizations
        if (sessionData.isMobile) {
            console.log('📱 Mobile device detected - applying mobile optimizations');
            
            // Handle mobile orientation changes
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    sendEvent('orientationChange', {
                        orientation: screen.orientation ? screen.orientation.angle : 'unknown',
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    });
                }, 500);
            });
        }

        console.log('✅ FIXED tracking initialized successfully!');
    }

    // Make functions globally available
    window.trackConversion = trackConversion;
    window.trackFormSubmission = trackFormSubmission;
    window.trackButtonClick = trackButtonClick;
    window.sendEvent = sendEvent;
    window.getSessionData = function() {
        return sessionData;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Send session heartbeat - NO TOTALS, only session data
    setInterval(function() {
        const currentSessionTime = Math.round((Date.now() - sessionData.startTime) / 1000);

        console.log('💓 Sending session heartbeat:', {
            sessionId: sessionData.sessionId,
            timeOnPage: currentSessionTime,
            scrollDepth: sessionData.scrollDepth,
            isMobile: sessionData.isMobile
        });
        
        sendEvent('heartbeat', {
            // NO visitors, leads, conversions - server counts these
            scrollDepth: sessionData.scrollDepth,
            timeOnPage: currentSessionTime 
        });
    }, 10000);

})();