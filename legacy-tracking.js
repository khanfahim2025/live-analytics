/**
 * Legacy Live Analytics Tracking Script
 * Uses Firebase v8 SDK for maximum compatibility
 */

// Global variables
let firebaseApp = null;
let database = null;
let isInitialized = false;

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDl8ApkaKB-Cpg9fHfk4uwRpAUn6oj-2FA",
    authDomain: "live-analytics-dashboard.firebaseapp.com",
    databaseURL: "https://live-analytics-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-analytics-dashboard",
    storageBucket: "live-analytics-dashboard.firebasestorage.app",
    messagingSenderId: "289125971781",
    appId: "1:289125971781:web:f9eee35fc1938a7d43302c",
    measurementId: "G-CMZT1BT8W5"
};

// Initialize Firebase with legacy compatibility
function initFirebase() {
    if (typeof firebase !== 'undefined' && !isInitialized) {
        try {
            // Check if Firebase is already initialized
            if (firebase.apps && firebase.apps.length > 0) {
                firebaseApp = firebase.app();
                database = firebase.database();
            } else {
                firebaseApp = firebase.initializeApp(firebaseConfig);
                database = firebase.database();
            }
            isInitialized = true;
            console.log('🔥 Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            return false;
        }
    }
    return false;
}

// Simple tracking function
function trackEvent(eventType, additionalData) {
    // Try to initialize Firebase if not done
    if (!isInitialized) {
        if (!initFirebase()) {
            console.warn('⚠️ Firebase not available, skipping tracking');
            return;
        }
    }
    
    if (!database) {
        console.warn('⚠️ Database not available, skipping tracking');
        return;
    }
    
    const eventData = {
        gtm_id: 'gtm_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        microsite_id: 'green-reserve-noida',
        event_type: eventType,
        url: window.location.href,
        referrer: document.referrer || 'direct',
        utm_source: getUrlParameter('utm_source') || 'direct',
        utm_medium: getUrlParameter('utm_medium') || 'organic',
        utm_campaign: getUrlParameter('utm_campaign') || null,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        source: 'real_microsite'
    };
    
    // Merge additional data
    if (additionalData) {
        Object.assign(eventData, additionalData);
    }
    
    console.log('📊 Tracking event:', eventType, eventData);
    
    try {
        // Store in events collection
        database.ref('events').push().set(eventData);
        
        // Store in specific collections based on event type
        if (eventType === 'page_view') {
            database.ref('visits').push().set(eventData);
            console.log('✅ Page view tracked');
        }
        
        if (eventType === 'form_submission' || eventType === 'lead_conversion') {
            database.ref('leads').push().set(eventData);
            console.log('✅ Lead tracked');
        }
        
        // Show success notification
        showNotification('✅ Event tracked successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error tracking event:', error);
        showNotification('❌ Error tracking event', 'error');
    }
}

// Track page view
function trackPageView() {
    trackEvent('page_view');
}

// Track lead/form submission
function trackLead(formData) {
    trackEvent('form_submission', {
        form_data: formData,
        lead_data: {
            name: formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            message: formData.message || ''
        }
    });
}

// Track button clicks
function trackButtonClick(buttonText, buttonType) {
    if (!buttonType) buttonType = 'button_click';
    trackEvent(buttonType, {
        button_text: buttonText,
        button_type: buttonType,
        action: buttonText
    });
}

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Show notification
function showNotification(message, type) {
    if (!type) type = 'info';
    
    const notification = document.createElement('div');
    notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'padding: 15px 20px;' +
        'border-radius: 8px;' +
        'color: white;' +
        'font-family: Arial, sans-serif;' +
        'font-size: 14px;' +
        'font-weight: 500;' +
        'z-index: 10000;' +
        'max-width: 300px;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.3);' +
        (type === 'success' ? 'background-color: #27ae60;' : '') +
        (type === 'error' ? 'background-color: #e74c3c;' : '') +
        (type === 'info' ? 'background-color: #3498db;' : '');
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Setup form tracking
function setupFormTracking() {
    // Track all form submissions
    document.addEventListener('submit', function(event) {
        const form = event.target;
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        
        console.log('📝 Form submission detected:', data);
        trackLead(data);
    });
    
    // Track specific buttons
    var trackableButtons = [
        'button[type="submit"]',
        '.enquire-now',
        '.register-now',
        '.request-brochure',
        '.download-brochure',
        '.cta-button',
        '.contact-form button',
        '.inquiry-form button'
    ];
    
    trackableButtons.forEach(function(selector) {
        document.addEventListener('click', function(event) {
            if (event.target.matches(selector) || event.target.closest(selector)) {
                var buttonText = event.target.textContent || event.target.value || 'Button Click';
                console.log('🔘 Button click detected:', buttonText);
                trackButtonClick(buttonText, 'button_click');
            }
        });
    });
    
    // Track specific elements by text content
    document.addEventListener('click', function(event) {
        var text = event.target.textContent.toLowerCase();
        if (text.indexOf('enquire') !== -1 || text.indexOf('register') !== -1 || 
            text.indexOf('download') !== -1 || text.indexOf('get') !== -1 || 
            text.indexOf('book') !== -1 || text.indexOf('call') !== -1) {
            console.log('🔘 Action button clicked:', event.target.textContent);
            trackButtonClick(event.target.textContent, 'action_click');
        }
    });
}

// Initialize tracking when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Live Analytics Tracker initializing...');
    
    // Wait for Firebase to be available
    var checkFirebase = setInterval(function() {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            initFirebase();
            
            // Track initial page view
            setTimeout(function() {
                trackPageView();
            }, 1000);
            
            // Setup form tracking
            setupFormTracking();
            
            console.log('✅ Live Analytics Tracker initialized successfully');
        }
    }, 100);
    
    // Fallback - track without Firebase after 3 seconds
    setTimeout(function() {
        if (!isInitialized) {
            console.warn('⚠️ Firebase not loaded, tracking without database');
            trackPageView();
            setupFormTracking();
        }
    }, 3000);
});

// Export functions for manual use
window.LiveAnalytics = {
    trackPageView: trackPageView,
    trackLead: trackLead,
    trackButtonClick: trackButtonClick,
    trackEvent: trackEvent
};
