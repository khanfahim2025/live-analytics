/**
 * Universal Live Analytics Tracking Script
 * Works for ALL websites with different GTM IDs
 * 
 * Usage:
 * 1. Include this script on your website
 * 2. Configure with your GTM ID and site details
 * 3. Automatic test/main lead detection and tracking
 */

(function() {
    'use strict';
    
    // Get configuration from website
    const config = window.LiveAnalyticsConfig || {};
    
    // Validate configuration
    if (!config.gtmId || !config.siteName || !config.siteUrl) {
        console.error('❌ Live Analytics: Missing required configuration. Please set window.LiveAnalyticsConfig');
        return;
    }
    
    const DASHBOARD_CONFIG = {
        gtmId: config.gtmId,
        siteName: config.siteName,
        dashboardUrl: config.dashboardUrl || 'https://web-production-19751.up.railway.app',
        siteUrl: config.siteUrl
    };

    // Test lead detection keywords
    const TEST_KEYWORDS = ['test', 'demo', 'sample', 'example', 'fake', 'dummy'];
    
    console.log('🚀 Live Analytics Tracking Initialized for:', DASHBOARD_CONFIG.siteName, 'GTM:', DASHBOARD_CONFIG.gtmId);
    
    // Initialize tracking
    function initTracking() {
        // Track page view
        trackPageView();
        
        // Set up form tracking
        setupFormTracking();
        
        // Set up button click tracking
        setupButtonTracking();
    }
    
    // Track page view
    function trackPageView() {
        const payload = {
            gtmId: DASHBOARD_CONFIG.gtmId,
            siteName: DASHBOARD_CONFIG.siteName,
            siteUrl: DASHBOARD_CONFIG.siteUrl,
            eventType: 'gtm.pageView',
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            sessionId: getSessionId(),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            deviceType: getDeviceType(),
            userAgent: navigator.userAgent,
            data: {
                pageTitle: document.title,
                pagePath: window.location.pathname,
                pageSearch: window.location.search,
                pageHash: window.location.hash
            }
        };
        
        sendToDashboard(payload);
    }
    
    // Set up form tracking
    function setupFormTracking() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            form.addEventListener('submit', function(event) {
                const formData = new FormData(form);
                const data = {};
                
                // Extract form data
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Check if this is a test lead
                const isTestLead = isTestSubmission(data);
                
                const payload = {
                    gtmId: DASHBOARD_CONFIG.gtmId,
                    siteName: DASHBOARD_CONFIG.siteName,
                    siteUrl: DASHBOARD_CONFIG.siteUrl,
                    eventType: 'gtm.formSubmit',
                    timestamp: Date.now(),
                    url: window.location.href,
                    referrer: document.referrer,
                    sessionId: getSessionId(),
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    deviceType: getDeviceType(),
                    userAgent: navigator.userAgent,
                    data: {
                        ...data,
                        formId: form.id || `form-${index}`,
                        formClass: form.className,
                        formType: 'contact',
                        isFormSubmission: true,
                        isTestLead: isTestLead
                    }
                };
                
                sendToDashboard(payload);
                
                // Show user feedback
                if (isTestLead) {
                    showTestLeadFeedback();
                } else {
                    showRealLeadFeedback();
                }
            });
        });
    }
    
    // Set up button click tracking
    function setupButtonTracking() {
        const buttons = document.querySelectorAll('button[type="submit"], .btn-submit, .contact-btn, .enquiry-btn, .lead-btn, .cta-btn, .book-now, .get-quote');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(event) {
                const payload = {
                    gtmId: DASHBOARD_CONFIG.gtmId,
                    siteName: DASHBOARD_CONFIG.siteName,
                    siteUrl: DASHBOARD_CONFIG.siteUrl,
                    eventType: 'gtm.buttonClick',
                    timestamp: Date.now(),
                    url: window.location.href,
                    referrer: document.referrer,
                    sessionId: getSessionId(),
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    deviceType: getDeviceType(),
                    userAgent: navigator.userAgent,
                    data: {
                        buttonText: button.textContent || button.innerText,
                        buttonId: button.id,
                        buttonClass: button.className,
                        buttonType: button.type
                    }
                };
                
                sendToDashboard(payload);
            });
        });
    }
    
    // Check if submission is a test lead
    function isTestSubmission(data) {
        console.log('🔍 Checking for test lead in data:', data);
        
        // Check for test keywords in form fields
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                for (const keyword of TEST_KEYWORDS) {
                    if (lowerValue.includes(keyword)) {
                        console.log('🧪 Test keyword detected:', { field: key, value: value, keyword: keyword });
                        return true;
                    }
                }
            }
        }
        
        // Check for test email patterns
        if (data.email) {
            const email = data.email.toLowerCase();
            if (email.includes('test') || email.includes('demo') || email.includes('example') || 
                email.includes('@test.') || email.includes('@demo.') || email.includes('@example.')) {
                console.log('🧪 Test email pattern detected:', email);
                return true;
            }
        }
        
        // Check for test phone patterns
        if (data.phone) {
            const phone = data.phone.toString();
            if (phone.includes('1234567890') || phone.includes('0000000000') || 
                phone.includes('1111111111') || phone.includes('9999999999') ||
                phone.match(/^(\d)\1{9}$/)) {
                console.log('🧪 Test phone pattern detected:', phone);
                return true;
            }
        }
        
        // Check for test names in form submissions
        if (data.formId) {
            const formId = data.formId.toLowerCase();
            if (formId.includes('test') || formId.includes('demo') || formId.includes('sample')) {
                console.log('🧪 Test form ID detected:', formId);
                return true;
            }
        }
        
        console.log('✅ Real lead detected');
        return false;
    }
    
    // Send data to dashboard
    function sendToDashboard(payload) {
        fetch(`${DASHBOARD_CONFIG.dashboardUrl}/api/receive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(result => {
            console.log('📊 Data sent to dashboard:', result);
        })
        .catch(error => {
            console.error('❌ Error sending data to dashboard:', error);
        });
    }
    
    // Get session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem(`liveAnalyticsSessionId_${DASHBOARD_CONFIG.gtmId}`);
        if (!sessionId) {
            sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(`liveAnalyticsSessionId_${DASHBOARD_CONFIG.gtmId}`, sessionId);
        }
        return sessionId;
    }
    
    // Get device type
    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return 'mobile';
        } else if (/iPad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    // Show test lead feedback
    function showTestLeadFeedback() {
        const feedback = document.createElement('div');
        feedback.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 300px;">
                <strong>🧪 Test Lead Submitted!</strong><br>
                <small>This will disappear from dashboard after 1 minute</small>
            </div>
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 5000);
    }
    
    // Show real lead feedback
    function showRealLeadFeedback() {
        const feedback = document.createElement('div');
        feedback.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 300px;">
                <strong>✅ Lead Submitted Successfully!</strong><br>
                <small>Thank you for your interest in ${DASHBOARD_CONFIG.siteName}</small>
            </div>
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 5000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }
    
})();
