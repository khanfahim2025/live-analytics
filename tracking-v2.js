/**
 * Universal Live Analytics Tracking Script v3
 * Works for ALL websites with different GTM IDs
 * * FIX v3: 
 * 1. Added specific phone validation error string to error check.
 * 2. Removed redundant `checkForSuccessfulSubmission` function which was 
 * causing false positive 'thankYouPage' events on validation failure.
 */

(function() {
    'useB strict';
    
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
                
                // *** FIX: REMOVED the first event listener that called checkForSuccessfulSubmission.
                // It was causing false positives.
                // The setupUniversalLeadTracking function handles success detection better.

                // Intercept form submission BEFORE it gets processed (Capture Phase)
                form.addEventListener('submit', function(event) {
                    console.log('🚨 Form submission intercepted!');
                    
                    // Get Google Ads data
                    const googleAdsData = detectGoogleAdsTraffic();
                    
                    // Get all input fields from the form
                    const inputs = form.querySelectorAll('input, textarea, select');
                    const data = {};
                    
                    inputs.forEach((input, index) => {
                        const fieldName = input.name || input.id || input.className || `field_${index}`;

                        if(input.type === 'radio' || input.type === 'checkbox') {
                            if(input.checked) {
                                data[fieldName] = input.value;
                                console.log(`📝 Captured field: ${fieldName} = ${input.value}`);
                            }
                        } else if (input.value) {
                            data[fieldName] = input.value;
                            console.log(`📝 Captured field: ${fieldName} = ${input.value}`);
                        }
                    });
                    
                    // Check if this is a test lead
                    const isTestLead = isTestSubmission(data);
                    
                    console.log('🔍 Form submission data:', data);
                    console.log('🧪 Is test lead:', isTestLead);
                    
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

                    // Wait for validation scripts to run.
                    console.log('⏳ Waiting 500ms for client-side validation...');

                    setTimeout(() => {
                        // Re-check for validation errors RIGHT BEFORE sending
                        const errorMessages = form.querySelectorAll('.error, .invalid, [class*="error"], [class*="invalid"], .field-error, .validation-error, .form-error');
                        const hasValidationErrors = errorMessages.length > 0;
                        
                        // Check for specific error text content (like your validation)
                        const errorTexts = [
                            'invalid phone number. for indian numbers, enter a valid 10-digit number starting with 6-9', // <-- *** FIX: ADDED YOUR ERROR ***
                            'invalid otp',
                            'failed to send', 'error sending', 'failed to fetch', 'cors policy',
                            '409', 'conflict', 'validation failed', 'form validation',
                            'its worng u enter'
                        ];
                        
                        const formText = form.textContent.toLowerCase();
                        const pageText = document.body.textContent.toLowerCase();
                        // *** FIX: Check pageText as well, in case error is not inside the form
                        const hasErrorText = errorTexts.some(errorText => formText.includes(errorText) || pageText.includes(errorText.toLowerCase()));
                        
                        // Check for form validation attributes
                        const invalidInputs = form.querySelectorAll('input:invalid, textarea:invalid, select:invalid');
                        const hasInvalidInputs = invalidInputs.length > 0;
                        
                        // Check browser's native validation API
                        const isFormValid = form.checkValidity();

                        if (hasValidationErrors || hasErrorText || hasInvalidInputs || !isFormValid) {
                            // Validation failed! DO NOT SEND.
                            console.log('❌ Validation failed on submit attempt. gtm.formSubmit event CANCELLED.', {
                                hasValidationErrors: hasValidationErrors,
                                hasErrorText: hasErrorText,
                                hasInvalidInputs: hasInvalidInputs,
                                isFormValid: isFormValid
                            });
                        } else {
                            // Validation passed (or at least, no errors were found). Send the data.
                            console.log('✅ Validation passed on submit attempt. Sending gtm.formSubmit event.');
                            sendToDashboard(payload);
                        }
                    }, 500); // 500ms delay to allow validation scripts to run and update the DOM
                    
                    // Track form submission for status monitoring (this is separate)
                    if (window.realTimeFetcher && window.realTimeFetcher.trackFormSubmission) {
                        window.realTimeFetcher.trackFormSubmission(DASHBOARD_CONFIG.siteUrl, 'contact');
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
            
            // Check name field for "test" keyword
            const nameField = data.name || data.fname || data['form-name'] || '';
            if (typeof nameField === 'string' && nameField.trim() !== '') {
                const nameValue = nameField.toLowerCase().trim();
                console.log(`🔍 Checking name field:`, nameValue);
                if (nameValue.includes('test')) {
                    console.log(`🧪 Test lead detected - name contains "test":`, { field: 'name', value: nameField });
                    return true;
                }
            }

            // Check all fields for test keywords
            for (const key in data) {
                const value = data[key];
                if (typeof value === 'string') {
                    const lowerCaseValue = value.toLowerCase().trim();
                    if (TEST_KEYWORDS.some(keyword => lowerCaseValue.includes(keyword))) {
                         console.log(`🧪 Test lead detected - field "${key}" contains test keyword:`, { value: value });
                         return true;
                    }
                }
            }
            
            console.log('✅ Real lead detected - no test keywords found');
            return false;
        }

        // *** FIX: REMOVED the redundant `checkForSuccessfulSubmission` function.
        // It was being called by the deleted listener and was causing false positives.
        // `checkForFormSuccess` (below) is the only one used now.

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
            } else {
                console.warn('⚠️ No leadData found in sessionStorage for successful lead.');
                // Fallback: try to get data from form if it still exists
                if (form) {
                    const inputs = form.querySelectorAll('input, textarea, select');
                    inputs.forEach((input, inputIndex) => {
                        const fieldName = input.name || input.id || input.className || `field_${inputIndex}`;
                        if(input.type === 'radio' || input.type === 'checkbox') {
                            if(input.checked) { formData[fieldName] = input.value; }
                        } else if (input.value) {
                            formData[fieldName] = input.value;
                        }
                    });
                    isTestLead = isTestSubmission(formData);
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
                        if(input.type === 'radio' || input.type === 'checkbox') {
                            if(input.checked) {
                                formData[fieldName] = input.value;
                            }
                        } else if (input.value) {
                            formData[fieldName] = input.value;
                        }
                    });
                    
                    // Check if this is a test lead
                    const isTestLead = isTestSubmission(formData);
                    
                    // Store lead data in session storage (this might overwrite data from setupFormTracking, which is fine)
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
            
            // Method 4: Fallback DISABLED in strict mode — never track without a real thank-you page
            setTimeout(() => {
                console.log('⏸️ Strict mode: fallback tracking disabled. Waiting for thank-you page only.');
            }, 8000);
        }

        // Check for successful form submission
        function checkForFormSuccess(form, index) {
            // First, check for validation errors - if there are errors, don't track
            const errorMessages = form.querySelectorAll('.error, .invalid, [class*="error"], [class*="invalid"], .field-error, .validation-error, .form-error');
            const hasValidationErrors = errorMessages.length > 0;
            
            // Check for specific error text content (exactly like your validation)
            const errorTexts = [
                'invalid phone number. for indian numbers, enter a valid 10-digit number starting with 6-9', // <-- *** FIX: ADDED YOUR ERROR ***
                'invalid otp',
                'failed to send', 'error sending', 'failed to fetch', 'cors policy',
                '409', 'conflict', 'validation failed', 'form validation',
                'its worng u enter'
            ];
            
            const formText = form.textContent.toLowerCase();
            const pageText = document.body.textContent.toLowerCase();
            // *** FIX: Check pageText as well
            const hasErrorText = errorTexts.some(errorText => formText.includes(errorText) || pageText.includes(errorText.toLowerCase()));
            
            // Check for form validation attributes
            const invalidInputs = form.querySelectorAll('input:invalid, textarea:invalid, select:invalid');
            const hasInvalidInputs = invalidInputs.length > 0;
            
            // Check for network errors in console or page
            const hasNetworkErrors = pageText.includes('failed to fetch') || 
                                   pageText.includes('cors policy') || 
                                   pageText.includes('error sending') ||
                                   pageText.includes('409') ||
                                   pageText.includes('conflict');
            
            // Check if form is still visible and not redirected (indicates validation failure)
            const formStillVisible = form.offsetParent !== null && form.style.display !== 'none';
            const noRedirect = !window.location.href.includes('thank') && 
                              !window.location.href.includes('success') && 
                              !window.location.href.includes('confirmation');
            
            // If there are validation errors, don't track the lead
            if (hasValidationErrors || hasErrorText || hasInvalidInputs || hasNetworkErrors) {
                console.log('❌ Validation errors detected - NOT tracking lead:', {
                    hasValidationErrors,
                    hasErrorText,
                    hasInvalidInputs,
                    hasNetworkErrors,
                    formStillVisible,
                    noRedirect,
                    errorMessages: Array.from(errorMessages).map(el => el.textContent),
                    errorTexts: errorTexts.filter(text => formText.includes(text) || pageText.includes(text))
                });
                return false;
            }

            // Check if we've already tracked this lead
            if (!sessionStorage.getItem('leadData')) {
                // console.log('Lead already tracked, skipping success check.');
                return true; // Return true to stop intervals
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
            const currentUrl = window.location.href.toLowerCase();
            const thankYouPatterns = [
                'thankyou', 'thank-you', 'thank_you', 'thank you',
                'success', 'confirmation', 'submitted', 'received',
                'enquiry-received', 'lead-received', 'form-submitted'
            ];
            const urlChanged = thankYouPatterns.some(pattern => currentUrl.includes(pattern));
            
            // Check for success indicators in the page
            const pageSuccessIndicators = document.querySelectorAll('[class*="success"], [id*="success"], [class*="thank"], [id*="thank"]');
            const hasPageSuccess = pageSuccessIndicators.length > 0;
            
            // Check for form submission button being disabled (common after submission)
            const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
            const submitButtonDisabled = Array.from(submitButtons).some(button => button.disabled);
            
            // console.log('🔍 Success detection check:', { // Optional: too noisy
            //     allFieldsEmpty,
            //     hasSuccessMessage,
            //     formDisabled,
            //     urlChanged,
            //     hasPageSuccess,
            //     submitButtonDisabled
            // });
            
            // Strict mode: Only track on explicit thank-you URL; otherwise do nothing
            if (urlChanged && !hasValidationErrors && !hasErrorText && !hasInvalidInputs) {
                console.log('✅ Thank-you URL detected - tracking lead');
                trackSuccessfulLead(form, index);
                return true;
            }
            
            return false;
        }
        
        // Track thank you page visits
        function trackThankYouPage() {
            // Check if we're on the thank you page (multiple patterns)
            const currentUrl = window.location.href.toLowerCase();
            const thankYouPatterns = [
                'thankyou', 'thank-you', 'thank_you', 'thank you',
                'success', 'confirmation', 'submitted', 'received',
                'enquiry-received', 'lead-received', 'form-submitted'
            ];
            
            const isThankYouPage = thankYouPatterns.some(pattern => currentUrl.includes(pattern));
            
            if (isThankYouPage) {
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
                // console.log('📡 Response headers:', response.headers); // Optional: for deep debugging
                return response.json();
            })
            .then(result => {
                console.log('✅ Data sent to dashboard successfully:', result);
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