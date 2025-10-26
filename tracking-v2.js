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
            siteUrl: config.siteUrl,
            region: config.region || 'unknown' // NEW: Region support
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
            
            // Set up universal successful lead tracking
            setupUniversalLeadTracking();
            
            // Track thank you page visits
            trackThankYouPage();
        }
        
        // Detect Google Ads traffic
        function detectGoogleAdsTraffic() {
            const urlParams = new URLSearchParams(window.location.search);
            const referrer = document.referrer;
            
            // Check for Google Ads UTM parameters
            const utmSource = urlParams.get('utm_source');
            const utmMedium = urlParams.get('utm_medium');
            const utmCampaign = urlParams.get('utm_campaign');
            const utmTerm = urlParams.get('utm_term');
            const utmContent = urlParams.get('utm_content');
            
            // Check for Google Ads referrer
            const isGoogleAdsReferrer = referrer.includes('google.com') && 
                                       (referrer.includes('/ads/') || referrer.includes('gclid='));
            
            // Check for gclid parameter (Google Ads click ID)
            const gclid = urlParams.get('gclid');
            
            return {
                isGoogleAds: utmSource === 'google' && utmMedium === 'cpc' || 
                             isGoogleAdsReferrer || 
                             gclid !== null,
                utmSource,
                utmMedium,
                utmCampaign,
                utmTerm,
                utmContent,
                gclid,
                referrer,
                trafficSource: utmSource === 'google' && utmMedium === 'cpc' ? 'google_ads' : 
                              isGoogleAdsReferrer ? 'google_ads_referrer' : 'organic'
            };
        }

        // Track page view
        function trackPageView() {
            const googleAdsData = detectGoogleAdsTraffic();
            
    const payload = {
        gtmId: DASHBOARD_CONFIG.gtmId,
        siteName: DASHBOARD_CONFIG.siteName,
        siteUrl: DASHBOARD_CONFIG.siteUrl,
        region: DASHBOARD_CONFIG.region || 'unknown', // NEW: Region support
        eventType: 'gtm.pageView',
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        sessionId: getSessionId(),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        deviceType: getDeviceType(),
        userAgent: navigator.userAgent,
        // NEW: Google Ads tracking data
        googleAds: googleAdsData,
        isGoogleAdsVisitor: googleAdsData.isGoogleAds,
        trafficSource: googleAdsData.trafficSource,
        data: {
            pageTitle: document.title,
            pagePath: window.location.pathname,
            pageSearch: window.location.search,
            pageHash: window.location.hash,
            // UTM parameters
            utmSource: googleAdsData.utmSource,
            utmMedium: googleAdsData.utmMedium,
            utmCampaign: googleAdsData.utmCampaign,
            utmTerm: googleAdsData.utmTerm,
            utmContent: googleAdsData.utmContent,
            gclid: googleAdsData.gclid
        }
    };
            
            sendToDashboard(payload);
        }
        
        // Set up form tracking
        function setupFormTracking() {
            const forms = document.querySelectorAll('form');
            
            forms.forEach((form, index) => {
                // Track successful form submissions
                form.addEventListener('submit', function(event) {
                    // Let the form submit naturally first
                    setTimeout(() => {
                        checkForSuccessfulSubmission(form, index);
                    }, 1000); // Wait 1 second for form processing
                });
                // Intercept form submission BEFORE it gets processed
                form.addEventListener('submit', function(event) {
                    console.log('🚨 Form submission intercepted!');
                    console.log('🔍 Form element:', form);
                    console.log('🔍 Form HTML:', form.outerHTML);
                    
                    // Get Google Ads data
                    const googleAdsData = detectGoogleAdsTraffic();
                    
                    // Get all input fields from the form
                    const inputs = form.querySelectorAll('input, textarea, select');
                    console.log('🔍 Found inputs:', inputs.length);
                    
                    const data = {};
                    
                    inputs.forEach((input, index) => {
                        console.log(`🔍 Input ${index}:`, {
                            tagName: input.tagName,
                            type: input.type,
                            name: input.name,
                            id: input.id,
                            className: input.className,
                            value: input.value,
                            placeholder: input.placeholder
                        });
                        
                        // Try different ways to get the field name
                        const fieldName = input.name || input.id || input.className || `field_${index}`;
                        if (input.value) {
                            data[fieldName] = input.value;
                            console.log(`📝 Captured field: ${fieldName} = ${input.value}`);
                        }
                    });
                    
                    console.log('🔍 All captured form data:', data);
                    
                    // Check if this is a test lead
                    const isTestLead = isTestSubmission(data);
                    
                    console.log('🔍 Form submission data:', data);
                    console.log('🧪 Is test lead:', isTestLead);
                    console.log('🔍 Name field value:', data.name);
                    console.log('🔍 Phone field value:', data.phone);
                    console.log('🎯 Google Ads data:', googleAdsData);
                    
                    const payload = {
                        gtmId: DASHBOARD_CONFIG.gtmId,
                        siteName: DASHBOARD_CONFIG.siteName,
                        siteUrl: DASHBOARD_CONFIG.siteUrl,
                        region: DASHBOARD_CONFIG.region || 'unknown', // NEW: Region support
                        eventType: 'gtm.formSubmit',
                        timestamp: Date.now(),
                        url: window.location.href,
                        referrer: document.referrer,
                        sessionId: getSessionId(),
                        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                        deviceType: getDeviceType(),
                        userAgent: navigator.userAgent,
                        // NEW: Google Ads tracking data
                        googleAds: googleAdsData,
                        isGoogleAdsVisitor: googleAdsData.isGoogleAds,
                        trafficSource: googleAdsData.trafficSource,
                        data: {
                            ...data,
                            formId: form.id || `form-${index}`,
                            formClass: form.className,
                            formType: 'contact',
                            isFormSubmission: true,
                            isTestLead: isTestLead
                        }
                    };
                    
                    // Store lead data in session storage for thank you page tracking
                    sessionStorage.setItem('leadData', JSON.stringify({
                        ...data,
                        isTestLead: isTestLead,
                        isGoogleAdsVisitor: googleAdsData.isGoogleAds,
                        trafficSource: googleAdsData.trafficSource,
                        googleAds: googleAdsData,
                        timestamp: Date.now()
                    }));
                    
                    // Send to dashboard immediately (form submission attempt)
                    sendToDashboard(payload);
                    console.log('📊 Form submission attempt tracked');
                    
                    // Track form submission for status monitoring
                    if (window.realTimeFetcher && window.realTimeFetcher.trackFormSubmission) {
                        window.realTimeFetcher.trackFormSubmission(DASHBOARD_CONFIG.siteUrl, 'contact');
                    }
                    
                    // DON'T count as lead yet - wait for successful validation
                    // The lead will be counted only when form validation passes
                    // and the form actually submits successfully
                    
                    // Log form submission (no user notifications)
                    if (isTestLead) {
                        console.log('🧪 Test lead detected - allowing form to proceed with validation');
                        // For test leads, allow the form to proceed but mark it as test lead
                        // The website's validation will handle phone number validation
                        // We'll track it when it reaches the thank you page
                    } else {
                        console.log('✅ Real lead - allowing form submission to proceed');
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
            
            // Check ALL fields for "test" keyword
            for (const [fieldName, fieldValue] of Object.entries(data)) {
                if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
                    const value = fieldValue.toLowerCase().trim();
                    console.log(`🔍 Checking field "${fieldName}":`, value);
                    if (value.includes('test')) {
                        console.log(`🧪 Test lead detected - field "${fieldName}" contains "test":`, { field: fieldName, value: fieldValue });
                        return true;
                    }
                }
            }
            
            console.log('✅ Real lead detected - no field contains "test"');
            return false;
        }

        // Check for successful form submission
        function checkForSuccessfulSubmission(form, index) {
            console.log('🔍 Checking for successful form submission...');
            
            // Check if form is still on the page (not redirected)
            if (!document.contains(form)) {
                console.log('✅ Form no longer on page - likely successful submission');
                trackSuccessfulLead(form, index);
                return;
            }
            
            // Check for success indicators
            const successIndicators = [
                'success', 'thank', 'submitted', 'received', 'confirmation',
                'thank you', 'enquiry received', 'form submitted'
            ];
            
            const pageText = document.body.textContent.toLowerCase();
            const hasSuccessIndicator = successIndicators.some(indicator => 
                pageText.includes(indicator)
            );
            
            if (hasSuccessIndicator) {
                console.log('✅ Success indicator found on page');
                trackSuccessfulLead(form, index);
                return;
            }
            
            // Check for error indicators
            const errorIndicators = [
                'error', 'invalid', 'required', 'failed', 'try again',
                'please enter', 'incorrect', 'validation'
            ];
            
            const hasErrorIndicator = errorIndicators.some(indicator => 
                pageText.includes(indicator)
            );
            
            if (hasErrorIndicator) {
                console.log('❌ Error indicator found - form submission failed');
                return;
            }
            
            // If no clear indicators, check if form fields are cleared (success)
            const inputs = form.querySelectorAll('input, textarea, select');
            const allFieldsEmpty = Array.from(inputs).every(input => 
                !input.value || input.value.trim() === ''
            );
            
            if (allFieldsEmpty) {
                console.log('✅ Form fields cleared - likely successful submission');
                trackSuccessfulLead(form, index);
            } else {
                console.log('⚠️ Form still has values - submission may have failed');
            }
        }

        // Track successful lead
        function trackSuccessfulLead(form, index) {
            console.log('🎉 Tracking successful lead submission!');
            
            // Get Google Ads data
            const googleAdsData = detectGoogleAdsTraffic();
            
            // Get form data from session storage
            const leadData = sessionStorage.getItem('leadData');
            let formData = {};
            let isTestLead = false;
            
            if (leadData) {
                try {
                    const data = JSON.parse(leadData);
                    formData = data;
                    isTestLead = data.isTestLead || false;
                } catch (error) {
                    console.error('❌ Error parsing lead data:', error);
                }
            }
            
            // Send successful lead confirmation
            const leadPayload = {
                gtmId: DASHBOARD_CONFIG.gtmId,
                siteName: DASHBOARD_CONFIG.siteName,
                siteUrl: DASHBOARD_CONFIG.siteUrl,
                region: DASHBOARD_CONFIG.region || 'unknown', // NEW: Region support
                eventType: 'gtm.thankYouPage',
                timestamp: Date.now(),
                url: window.location.href,
                referrer: document.referrer,
                sessionId: getSessionId(),
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                deviceType: getDeviceType(),
                userAgent: navigator.userAgent,
                // NEW: Google Ads tracking data
                googleAds: googleAdsData,
                isGoogleAdsVisitor: googleAdsData.isGoogleAds,
                trafficSource: googleAdsData.trafficSource,
                data: {
                    ...formData,
                    isFormSubmission: true,
                    isTestLead: isTestLead,
                    thankYouPage: true,
                    successfulSubmission: true
                }
            };
            
            sendToDashboard(leadPayload);
            console.log('✅ Successful lead tracked and sent to dashboard');
            
            // Track successful form submission for status monitoring
            if (window.realTimeFetcher && window.realTimeFetcher.trackFormSubmission) {
                window.realTimeFetcher.trackFormSubmission(DASHBOARD_CONFIG.siteUrl, 'successful_lead');
            }
            
            // Clear the stored data
            sessionStorage.removeItem('leadData');
        }

        // Universal Lead Tracking - Automatically detect successful form submissions
        function setupUniversalLeadTracking() {
            console.log('🌐 Setting up universal lead tracking...');
            
            // Track all forms on the page
            const allForms = document.querySelectorAll('form');
            console.log(`🔍 Found ${allForms.length} forms on the page`);
            
            allForms.forEach((form, index) => {
                console.log(`🔧 Setting up universal tracking for form ${index + 1}:`, form.id || form.className);
                
                // Add event listener for form submission
                form.addEventListener('submit', function(e) {
                    console.log('📝 Universal form submission detected:', form.id || form.className);
                    
                    // Store form data immediately
                    const formData = {};
                    const inputs = form.querySelectorAll('input, textarea, select');
                    
                    inputs.forEach((input, inputIndex) => {
                        const fieldName = input.name || input.id || input.className || `field_${inputIndex}`;
                        if (input.value) {
                            formData[fieldName] = input.value;
                        }
                    });
                    
                    // Check if this is a test lead
                    const isTestLead = isTestSubmission(formData);
                    
                    // Store lead data in session storage
                    sessionStorage.setItem('leadData', JSON.stringify({
                        ...formData,
                        isTestLead: isTestLead,
                        isGoogleAdsVisitor: detectGoogleAdsTraffic().isGoogleAds,
                        trafficSource: detectGoogleAdsTraffic().trafficSource,
                        googleAds: detectGoogleAdsTraffic(),
                        timestamp: Date.now()
                    }));
                    
                    console.log('💾 Form data stored for universal tracking');
                    
                    // Set up multiple detection methods for successful submission
                    setupSuccessDetection(form, index);
                }, true); // Use capture phase
            });
            
            // Also track buttons with data-track-lead="true"
            const leadButtons = document.querySelectorAll('button[data-track-lead="true"]');
            console.log(`🔘 Found ${leadButtons.length} buttons with data-track-lead="true"`);
            
            leadButtons.forEach((button, index) => {
                button.addEventListener('click', function(e) {
                    console.log('🔘 Lead tracking button clicked:', button.textContent);
                    
                    // Find associated form
                    const form = button.closest('form');
                    if (form) {
                        console.log('📝 Associated form found for button:', form.id || form.className);
                        setupSuccessDetection(form, index);
                    }
                });
            });
        }

        // Set up multiple detection methods for successful form submission
        function setupSuccessDetection(form, index) {
            console.log('🔍 Setting up success detection for form:', form.id || form.className);
            
            // Method 1: DOM Mutation Observer - Watch for form changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        checkForFormSuccess(form, index);
                    }
                });
            });
            
            observer.observe(form, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'disabled']
            });
            
            // Method 2: Periodic check for form state changes
            let checkCount = 0;
            const maxChecks = 20; // Check for 10 seconds (20 * 500ms)
            
            const successChecker = setInterval(() => {
                checkCount++;
                
                if (checkForFormSuccess(form, index) || checkCount >= maxChecks) {
                    clearInterval(successChecker);
                    observer.disconnect();
                }
            }, 500);
            
            // Method 3: Check for success indicators
            setTimeout(() => {
                checkForFormSuccess(form, index);
            }, 1000);
            
            setTimeout(() => {
                checkForFormSuccess(form, index);
            }, 3000);
            
            // Method 4: Fallback - track lead after 5 seconds if no success indicators found AND no validation errors
            setTimeout(() => {
                const leadData = sessionStorage.getItem('leadData');
                if (leadData) {
                    // Check for validation errors before fallback tracking
                    const errorMessages = form.querySelectorAll('.error, .invalid, [class*="error"], [class*="invalid"], .field-error, .validation-error, .form-error');
                    const hasValidationErrors = errorMessages.length > 0;
                    
                    const errorTexts = [
                        'invalid', 'error', 'required', 'invalid phone', 'invalid email', 
                        'please enter', 'enter a valid', 'must be', 'should be',
                        'invalid phone number', 'enter a valid 10-digit number'
                    ];
                    
                    const formText = form.textContent.toLowerCase();
                    const hasErrorText = errorTexts.some(errorText => formText.includes(errorText));
                    
                    const invalidInputs = form.querySelectorAll('input:invalid, textarea:invalid, select:invalid');
                    const hasInvalidInputs = invalidInputs.length > 0;
                    
                    if (!hasValidationErrors && !hasErrorText && !hasInvalidInputs) {
                        console.log('⏰ Fallback: Tracking lead after 5 seconds (no success indicators found, no validation errors)');
                        trackSuccessfulLead(form, index);
                    } else {
                        console.log('⏰ Fallback: NOT tracking lead - validation errors detected:', {
                            hasValidationErrors,
                            hasErrorText,
                            hasInvalidInputs
                        });
                    }
                }
            }, 5000);
        }

        // Check for successful form submission
        function checkForFormSuccess(form, index) {
            // First, check for validation errors - if there are errors, don't track
            const errorMessages = form.querySelectorAll('.error, .invalid, [class*="error"], [class*="invalid"], .field-error, .validation-error, .form-error');
            const hasValidationErrors = errorMessages.length > 0;
            
            // Check for error text content (common validation messages)
            const errorTexts = [
                'invalid', 'error', 'required', 'invalid phone', 'invalid email', 
                'please enter', 'enter a valid', 'must be', 'should be',
                'invalid phone number', 'enter a valid 10-digit number'
            ];
            
            const formText = form.textContent.toLowerCase();
            const hasErrorText = errorTexts.some(errorText => formText.includes(errorText));
            
            // Check for form validation attributes
            const invalidInputs = form.querySelectorAll('input:invalid, textarea:invalid, select:invalid');
            const hasInvalidInputs = invalidInputs.length > 0;
            
            // If there are validation errors, don't track the lead
            if (hasValidationErrors || hasErrorText || hasInvalidInputs) {
                console.log('❌ Validation errors detected - NOT tracking lead:', {
                    hasValidationErrors,
                    hasErrorText,
                    hasInvalidInputs,
                    errorMessages: Array.from(errorMessages).map(el => el.textContent),
                    errorTexts: errorTexts.filter(text => formText.includes(text))
                });
                return false;
            }
            
            // Check if form fields are cleared (common success indicator)
            const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
            const allFieldsEmpty = Array.from(inputs).every(input => 
                !input.value || input.value.trim() === ''
            );
            
            // Check for success messages
            const successMessages = document.querySelectorAll('.success, .thank-you, .success-message, [class*="success"], [class*="thank"]');
            const hasSuccessMessage = successMessages.length > 0;
            
            // Check for form being disabled or hidden
            const formDisabled = form.disabled || form.style.display === 'none' || form.style.visibility === 'hidden';
            
            // Check for URL changes (redirect to thank you page)
            const urlChanged = window.location.href.includes('thank') || 
                              window.location.href.includes('success') || 
                              window.location.href.includes('confirmation');
            
            // Check for success indicators in the page
            const pageSuccessIndicators = document.querySelectorAll('[class*="success"], [id*="success"], [class*="thank"], [id*="thank"]');
            const hasPageSuccess = pageSuccessIndicators.length > 0;
            
            // Check for form submission button being disabled (common after submission)
            const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
            const submitButtonDisabled = Array.from(submitButtons).some(button => button.disabled);
            
            console.log('🔍 Success detection check:', {
                hasValidationErrors,
                hasErrorText,
                hasInvalidInputs,
                allFieldsEmpty,
                hasSuccessMessage,
                formDisabled,
                urlChanged,
                hasPageSuccess,
                submitButtonDisabled
            });
            
            // If any success indicator is found AND no validation errors, track the lead
            if ((allFieldsEmpty || hasSuccessMessage || formDisabled || urlChanged || hasPageSuccess || submitButtonDisabled) && !hasValidationErrors && !hasErrorText && !hasInvalidInputs) {
                console.log('✅ Success indicators detected and no validation errors - tracking lead');
                trackSuccessfulLead(form, index);
                return true;
            }
            
            return false;
        }
        
        // Track thank you page visits
        function trackThankYouPage() {
            // Check if we're on the thank you page
            if (window.location.href.includes('thankyou.html') || window.location.href.includes('thank-you')) {
                console.log('🎉 Thank you page detected!');
                
                // Get the lead data from session storage (stored during form submission)
                const leadData = sessionStorage.getItem('leadData');
                if (leadData) {
                    try {
                        const data = JSON.parse(leadData);
                        const isTestLead = data.isTestLead;
                        
                        console.log('📊 Thank you page - Lead data:', data);
                        console.log('🧪 Is test lead:', isTestLead);
                        
                        // Send final lead confirmation to dashboard
                        const payload = {
                            gtmId: DASHBOARD_CONFIG.gtmId,
                            siteName: DASHBOARD_CONFIG.siteName,
                            siteUrl: DASHBOARD_CONFIG.siteUrl,
                            region: DASHBOARD_CONFIG.region || 'unknown', // NEW: Region support
                            eventType: 'gtm.thankYouPage',
                            timestamp: Date.now(),
                            url: window.location.href,
                            referrer: document.referrer,
                            sessionId: getSessionId(),
                            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                            deviceType: getDeviceType(),
                            userAgent: navigator.userAgent,
                            // NEW: Google Ads tracking data
                            googleAds: data.googleAds,
                            isGoogleAdsVisitor: data.isGoogleAdsVisitor,
                            trafficSource: data.trafficSource,
                            data: {
                                ...data,
                                isFormSubmission: true,
                                isTestLead: isTestLead,
                                thankYouPage: true
                            }
                        };
                        
                        sendToDashboard(payload);
                        
                        // Clear the stored data
                        sessionStorage.removeItem('leadData');
                        
                        console.log('✅ Thank you page lead tracked successfully');
                    } catch (error) {
                        console.error('❌ Error processing thank you page data:', error);
                    }
                }
            }
        }
        
        // Send data to dashboard
        function sendToDashboard(payload) {
            console.log('🚀 Sending data to dashboard:', payload);
            console.log('🌐 Dashboard URL:', `${DASHBOARD_CONFIG.dashboardUrl}/api/receive`);
            
            fetch(`${DASHBOARD_CONFIG.dashboardUrl}/api/receive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', response.headers);
                return response.json();
            })
            .then(result => {
                console.log('✅ Data sent to dashboard successfully:', result);
            })
            .catch(error => {
                console.error('❌ Error sending data to dashboard:', error);
                console.error('❌ Error details:', error.message);
                console.error('❌ Stack trace:', error.stack);
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
        
        // Notification functions removed - no user notifications will be shown
        
        // Manual lead tracking function for websites to call
        function manualTrackLead(formData = {}) {
            console.log('🔧 Manual lead tracking called with data:', formData);
            
            // Check if this is a test lead
            const isTestLead = isTestSubmission(formData);
            
            // Store lead data in session storage
            sessionStorage.setItem('leadData', JSON.stringify({
                ...formData,
                isTestLead: isTestLead,
                isGoogleAdsVisitor: detectGoogleAdsTraffic().isGoogleAds,
                trafficSource: detectGoogleAdsTraffic().trafficSource,
                googleAds: detectGoogleAdsTraffic(),
                timestamp: Date.now(),
                manualTracking: true
            }));
            
            // Track the lead immediately
            trackSuccessfulLead(null, 0);
        }

        // Expose tracking functions globally
        window.LiveAnalytics = {
            trackPageView: trackPageView,
            trackSuccessfulLead: trackSuccessfulLead,
            setupUniversalLeadTracking: setupUniversalLeadTracking,
            manualTrackLead: manualTrackLead
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTracking);
        } else {
            initTracking();
        }
    }
    
})();
