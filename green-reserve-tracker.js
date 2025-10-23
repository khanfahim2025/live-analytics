<script>
/**
 * Universal Device Tracker - Works on ALL devices from ANYWHERE
 * Add this script to your microsite to track visitors from any device
 */
(function() {
    'use strict';
    
    console.log('🚀 Universal Device Tracker Initialized');
    
    // Configuration - WORKS FROM ANY DEVICE, ANYWHERE
    const DASHBOARD_CONFIG = {
        gtmId: 'GTM-WLQ7HBKH',
        siteName: 'Green Reserve Noida',
        dashboardUrl: 'https://web-production-beea8.up.railway.app', // Your actual Railway URL
        siteUrl: 'https://www.green-reserve-noida.in'
    };

    // Enhanced device detection
    function isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
            'iemobile', 'opera mini', 'mobile', 'tablet', 'kindle', 'silk'
        ];
        return mobileKeywords.some(keyword => userAgent.includes(keyword));
    }

    function isTabletDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(userAgent);
    }

    function getDeviceType() {
        if (isTabletDevice()) return 'tablet';
        if (isMobileDevice()) return 'mobile';
        return 'desktop';
    }

    // Session tracking data
    let sessionData = {
        scrollDepth: 0,
        timeOnPage: 0,
        startTime: Date.now(),
        pageViewTracked: false,
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        submittedForms: [],
        isMobile: isMobileDevice(),
        isTablet: isTabletDevice(),
        deviceType: getDeviceType(),
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };

    // Send event to server
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
                isTablet: sessionData.isTablet,
                deviceType: sessionData.deviceType,
                orientation: sessionData.orientation,
                userAgent: navigator.userAgent,
                screenSize: {
                    width: window.screen.width,
                    height: window.screen.height
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        console.log('📊 Sending event to server:', eventType, data);

        // Send to server with retry logic
        fetch(DASHBOARD_CONFIG.dashboardUrl + '/api/receive', {
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
                fetch(DASHBOARD_CONFIG.dashboardUrl + '/api/receive', {
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
            
            console.log('👀 Page view event sent to server (Device:', sessionData.deviceType + ')');
            
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
        
        if (sessionData.submittedForms.includes(formKey)) {
            console.log('📝 Form already submitted in this session, skipping');
            return;
        }
        
        sessionData.submittedForms.push(formKey);
        
        console.log('📝 Form submission event sent to server');
        
        sendEvent('formSubmit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown',
            formType: form.getAttribute('data-tracking-id') || 'unknown',
            isFormSubmission: true
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

    // Track conversions
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
        console.log('🎯 Initializing Universal Device Tracking...');
        
        // Track initial page view
        trackPageView();

        // Mobile-specific event listeners
        if (sessionData.isMobile || sessionData.isTablet) {
            console.log('📱 Mobile/Tablet device detected:', sessionData.deviceType);
            
            // Track orientation changes
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    sessionData.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
                    console.log('📱 Orientation changed to:', sessionData.orientation);
                    sendEvent('orientationChange', {
                        orientation: sessionData.orientation,
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    });
                }, 100);
            });

            // Track viewport changes
            let resizeTimeout;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
                    if (newOrientation !== sessionData.orientation) {
                        sessionData.orientation = newOrientation;
                        console.log('📱 Viewport changed:', sessionData.orientation);
                        sendEvent('viewportChange', {
                            orientation: sessionData.orientation,
                            viewport: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            }
                        });
                    }
                }, 250);
            });

            // Enhanced touch tracking for mobile
            document.addEventListener('touchstart', function(e) {
                if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                    console.log('📱 Touch start on button:', e.target.textContent);
                    sendEvent('touchStart', {
                        element: e.target.tagName.toLowerCase(),
                        elementId: e.target.id || 'unknown',
                        elementText: e.target.textContent || e.target.value || 'unknown'
                    });
                }
            }, { passive: true });
        }

        // Track form submissions - UNIVERSAL FORM DETECTION
        document.addEventListener('submit', function(e) {
            // Track any form submission
            trackFormSubmission(e.target);
            console.log('📝 Form submitted:', e.target.id || e.target.className || 'unknown form');
        });

        // Track button clicks - FIXED: Don't auto-trigger conversions
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, a, input[type="submit"], input[type="button"]')) {
                trackButtonClick(e.target);
                
                // Only track conversion if explicitly marked AND not inside a form
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

        console.log('✅ Universal Device Tracking initialized successfully!');
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

    // Send session heartbeat
    setInterval(function() {
        const currentSessionTime = Math.round((Date.now() - sessionData.startTime) / 1000);

        console.log('💓 Sending session heartbeat:', {
            sessionId: sessionData.sessionId,
            timeOnPage: currentSessionTime,
            scrollDepth: sessionData.scrollDepth,
            deviceType: sessionData.deviceType,
            isMobile: sessionData.isMobile
        });
        
        sendEvent('heartbeat', {
            scrollDepth: sessionData.scrollDepth,
            timeOnPage: currentSessionTime,
            deviceType: sessionData.deviceType,
            orientation: sessionData.orientation,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }, 10000);

})();
</script>
