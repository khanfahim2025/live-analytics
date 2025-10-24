/**
 * Universal Live Analytics Tracking Script v2
 * Works for ALL websites with different GTM IDs
 * Fixed configuration loading issue
 */

(function() {
    'use strict';
    
    // Wait for configuration to be set
    function waitForConfig() {
        return new Promise((resolve) => {
            const checkConfig = () => {
                if (window.LiveAnalyticsConfig && window.LiveAnalyticsConfig.gtmId) {
                    resolve(window.LiveAnalyticsConfig);
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });
    }
    
    // Initialize when configuration is ready
    waitForConfig().then((config) => {
        console.log('✅ Configuration loaded:', config);
        initializeTracking(config);
    });
    
    function initializeTracking(config) {
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
                // Intercept form submission BEFORE it gets processed
                form.addEventListener('submit', function(event) {
                    console.log('🚨 Form submission intercepted!');
                    
                    // Get all input fields from the form
                    const inputs = form.querySelectorAll('input, textarea, select');
                    const data = {};
                    
                    inputs.forEach(input => {
                        if (input.name && input.value) {
                            data[input.name] = input.value;
                            console.log(`📝 Captured field: ${input.name} = ${input.value}`);
                        }
                    });
                    
                    console.log('🔍 All captured form data:', data);
                    
                    // Check if this is a test lead
                    const isTestLead = isTestSubmission(data);
                    
                    console.log('🔍 Form submission data:', data);
                    console.log('🧪 Is test lead:', isTestLead);
                    console.log('🔍 Name field value:', data.name);
                    console.log('🔍 Phone field value:', data.phone);
                    
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
                }, true); // Use capture phase to intercept before other handlers
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
            console.log('🔍 All form fields:', Object.keys(data));
            console.log('🔍 Name field value:', data.name);
            console.log('🔍 Name field type:', typeof data.name);
            
            // SIMPLE TEST LEAD DETECTION: Just check if name field contains "test"
            if (data.name && typeof data.name === 'string' && data.name.trim() !== '') {
                const name = data.name.toLowerCase().trim();
                console.log('🔍 Name after processing:', name);
                if (name.includes('test')) {
                    console.log('🧪 Test lead detected - name contains "test":', { name: data.name });
                    return true;
                }
            }
            
            // Check other possible name fields
            const nameFields = ['name', 'firstName', 'fullName', 'contactName', 'customerName', 'userName'];
            for (const field of nameFields) {
                if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
                    const name = data[field].toLowerCase().trim();
                    console.log(`🔍 Checking field "${field}":`, name);
                    if (name.includes('test')) {
                        console.log(`🧪 Test lead detected - field "${field}" contains "test":`, { field: field, value: data[field] });
                        return true;
                    }
                }
            }
            
            console.log('✅ Real lead detected - no name field contains "test"');
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
    }
    
})();
